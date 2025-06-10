import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLoginSuccess = (data: any) => {
    navigate('/dashboard')
  }

  const handleNeed2FA = (data: any) => {
    // Store temporary data for 2FA verification
    sessionStorage.setItem('tempLoginData', JSON.stringify(data))
    navigate('/verify-2fa')
  }

  const handleError = (error: string) => {
    setError(error)
    setSuccess('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {error && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
            {success}
          </div>
        )}

        <LoginForm
          onSuccess={handleLoginSuccess}
          onNeed2FA={handleNeed2FA}
          onError={handleError}
        />

        <div className="text-center space-y-4">
          <Link to="/forgot-password">
            <Button variant="link" className="text-sm">
              Mot de passe oublié ?
            </Button>
          </Link>
          
          <div className="text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary hover:underline">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}