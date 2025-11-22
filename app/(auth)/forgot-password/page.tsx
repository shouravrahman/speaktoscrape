'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function ForgotPasswordPage() {
   const [email, setEmail] = useState('')
   const [error, setError] = useState('')
   const [message, setMessage] = useState('')

   const handleRequest = async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setMessage('')

      const res = await fetch('/api/auth/request-password-reset', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
         setMessage(data.message)
      } else {
         setError(data.error)
      }
   }

   return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
         <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
            <div className="text-center">
               <h1 className="text-3xl font-bold text-card-foreground">Forgot Password</h1>
               <p className="text-muted-foreground">Enter your email to get a password reset link</p>
            </div>
            <form onSubmit={handleRequest} className="space-y-6">
               <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                     id="email"
                     type="email"
                     placeholder="you@example.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                  />
               </div>
               {error && <p className="text-destructive text-sm">{error}</p>}
               {message && <p className="text-green-500 text-sm">{message}</p>}
               <Button type="submit" className="w-full">Send Reset Link</Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
               Remember your password?{" "}
               <Link href="/login" >
                  <span className="text-primary hover:underline">Sign in</span>
               </Link>
            </div>
         </div>
      </div>
   )
}
