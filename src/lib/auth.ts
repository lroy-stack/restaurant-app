// src/lib/auth.ts - NextAuth.js v5 Configuration for Enigma Restaurant
import NextAuth, { DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import type { UserRole } from "@prisma/client"

// NextAuth.js v5 module augmentation - Updated paths and interfaces
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: UserRole
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
  }
}

// NextAuth.js v5 JWT interface is handled internally
// JWT token access via session callback

export const { handlers, auth, signIn, signOut } = NextAuth({
  // @ts-expect-error - PrismaAdapter type compatibility with exactOptionalPropertyTypes
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string
        session.user.role = token.role as UserRole
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user exists, if not create with CUSTOMER role by default
          const existingUser = await db.user.findUnique({
            where: { email: user.email }
          })

          if (!existingUser) {
            // First admin user gets ADMIN role, others get CUSTOMER
            const userCount = await db.user.count()
            const role: UserRole = userCount === 0 ? "ADMIN" : "CUSTOMER"
            
            const userData = {
              email: user.email,
              name: user.name ?? "Usuario",
              role: role,
              emailVerified: new Date(),
              image: user.image ?? null,
            }
            
            const newUser = await db.user.create({
              data: userData
            })
            
            // Update the user object with the role for JWT callback
            user.role = newUser.role
          } else {
            // Update the user object with the existing role for JWT callback
            user.role = existingUser.role
          }
          return true
        } catch (error) {
          console.error("Error during sign in:", error)
          return false
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET ?? "fallback-secret-development-only",
})

// Server-side auth utilities
export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  return user
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}

export async function isManagerOrAbove() {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN' || user?.role === 'MANAGER'
}

export async function canAccessDashboard() {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'STAFF'
}