'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Lock, Eye, EyeOff, Mail } from "lucide-react"
import { createClient } from '@/utils/supabase/client'

export default function AlmaEnigmaPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        console.error('Sign in error:', signInError)
        setError('Credenciales incorrectas')
        return
      }

      if (data.user) {
        console.log('Login successful, redirecting to dashboard')
        // Navigate to dashboard - the middleware will handle session validation
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('Login catch error:', err)
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-600 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Panel de Administración</CardTitle>
          <p className="text-muted-foreground">Enigma Cocina Con Alma</p>
        </CardHeader>
        <CardContent>
          {/* Private Access Notice */}
          <div className="bg-orange-600/10 border border-orange-600/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400 font-medium text-sm">Acceso Privado</span>
            </div>
            <p className="text-orange-300 text-xs">
              Panel de gestión interno del restaurante. Solo personal autorizado.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email de administrador
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@enigmaconalma.com"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••••"
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Acceder al Panel'
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-muted-foreground text-xs mt-6">
            © 2025 Enigma Cocina Con Alma - Gestión Interna
          </p>
        </CardContent>
      </Card>
    </div>
  )
}