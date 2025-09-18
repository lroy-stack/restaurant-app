// ELIMINADO - NO USAMOS NEXT AUTH, USAMOS SUPABASE AUTH
// Este archivo ha sido deshabilitado porque usamos Supabase Auth
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: "NextAuth disabled - Using Supabase Auth" }, { status: 404 })
}

export async function POST() {
  return NextResponse.json({ error: "NextAuth disabled - Using Supabase Auth" }, { status: 404 })
}