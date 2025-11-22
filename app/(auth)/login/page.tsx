'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function LoginPage() {
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const [error, setError] = useState('')
   const router = useRouter()

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      const res = await fetch('/api/auth/login', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
         router.push('/chat')
         router.refresh() // to update server components
      } else {
         const { error } = await res.json()
         setError(error)
      }
   }

   return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
         <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
            <div className="text-center">
               <h1 className="text-3xl font-bold text-card-foreground">Welcome Back</h1>
               <p className="text-muted-foreground">Sign in to continue to your dashboard</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
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
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <Label htmlFor="password">Password</Label>
                     <Link href="/forgot-password" >
                        <span className="text-sm text-primary hover:underline">Forgot password?</span>
                     </Link>
                  </div>
                  <Input
                     id="password"
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                  />
               </div>
               {error && <p className="text-destructive text-sm">{error}</p>}
               <Button type="submit" className="w-full">Sign In</Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
               Don&apos;t have an account?{" "}
               <Link href="/signup" >
                  <span className="text-primary hover:underline">Sign up</span>
               </Link>
            </div>
         </div>
      </div>
   )
}
