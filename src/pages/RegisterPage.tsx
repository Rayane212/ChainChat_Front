import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RegisterForm } from '@/components/auth/RegisterForm'

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegisterSuccess = (message: string) => {
    setSuccess(message)
    setError('')
    setTimeout(() => {
      navigate('/login')
    }, 2000)
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

        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onError={handleError}
        />

        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}