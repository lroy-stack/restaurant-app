"use client"

import { useSession } from "next-auth/react"
import type { UserRole } from "@prisma/client"

export function useAuth() {
  const { data: session, status } = useSession()
  
  const isLoading = status === "loading"
  const isAuthenticated = !!session?.user && status === "authenticated"
  const user = session?.user || null

  return {
    user,
    isLoading,
    isAuthenticated,
    status,
  }
}

export function useRole() {
  const { user } = useAuth()
  const role = user?.role || null

  const isAdmin = role === "ADMIN"
  const isManager = role === "MANAGER"
  const isStaff = role === "STAFF"
  const isCustomer = role === "CUSTOMER"
  
  const isManagerOrAbove = role === "ADMIN" || role === "MANAGER"
  const canAccessDashboard = role === "ADMIN" || role === "MANAGER" || role === "STAFF"

  const hasRole = (allowedRoles: UserRole[]) => {
    return role ? allowedRoles.includes(role) : false
  }

  const requireRole = (allowedRoles: UserRole[]) => {
    if (!role || !allowedRoles.includes(role)) {
      throw new Error(`Insufficient permissions. Required: ${allowedRoles.join(", ")}`)
    }
    return role
  }

  return {
    role,
    isAdmin,
    isManager,
    isStaff,
    isCustomer,
    isManagerOrAbove,
    canAccessDashboard,
    hasRole,
    requireRole,
  }
}

export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth()
  
  if (isLoading) {
    return { user: null, isLoading: true }
  }
  
  if (!isAuthenticated || !user) {
    throw new Error("Authentication required")
  }
  
  return { user, isLoading: false }
}

export function useRequireRole(allowedRoles: UserRole[]) {
  const { user } = useRequireAuth()
  const { hasRole, role } = useRole()
  
  if (!hasRole(allowedRoles)) {
    throw new Error(`Insufficient permissions. Required: ${allowedRoles.join(", ")}, Current: ${role}`)
  }
  
  return { user, role }
}

// Utility type guards
export const isUserRole = (role: string): role is UserRole => {
  return ["ADMIN", "MANAGER", "STAFF", "CUSTOMER"].includes(role)
}

export const getRoleDisplayName = (role: UserRole): string => {
  const displayNames = {
    ADMIN: "Administrador",
    MANAGER: "Gerente",
    STAFF: "Personal",
    CUSTOMER: "Cliente",
  }
  return displayNames[role]
}

export const getRoleColor = (role: UserRole): string => {
  const colors = {
    ADMIN: "text-red-600 bg-red-50",
    MANAGER: "text-blue-600 bg-blue-50", 
    STAFF: "text-green-600 bg-green-50",
    CUSTOMER: "text-gray-600 bg-gray-50",
  }
  return colors[role]
}