'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import Link from 'next/link'

export default function SignupPage() {
   const [fullName, setFullName] = useState('')
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const [companyName, setCompanyName] = useState('')
   const [role, setRole] = useState('')
   const [useCase, setUseCase] = useState('')
   const [accountType, setAccountType] = useState('personal')
   const [error, setError] = useState('')
   const [message, setMessage] = useState('')
   const router = useRouter()

   const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setMessage('')

      const res = await fetch('/api/auth/signup', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({ fullName, email, password, companyName, role, useCase, accountType }),
      })

      const data = await res.json()

      if (res.ok) {
         setMessage(data.message)
      } else {
         setError(data.error)
      }
   }

   return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
         <div className="w-full max-w-lg p-8 space-y-8 bg-card rounded-lg shadow-lg">
            <div className="text-center">
               <h1 className="text-3xl font-bold text-card-foreground">Create an Account</h1>
               <p className="text-muted-foreground">Get started with your autonomous scraping agent</p>
            </div>
            <form onSubmit={handleSignup} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="fullName">Full Name</Label>
                     <Input
                        id="fullName"
                        type="text"
                        placeholder="Your Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                     />
                  </div>
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
               </div>
               <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                     id="password"
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                  />
               </div>
               <div className="space-y-2">
                  <Label>Account Type</Label>
                  <RadioGroup defaultValue="personal" onValueChange={setAccountType} className="flex gap-4">
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="personal" id="personal" />
                        <Label htmlFor="personal">Personal</Label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="business" id="business" />
                        <Label htmlFor="business">Business</Label>
                     </div>
                  </RadioGroup>
               </div>
               {accountType === 'business' && (
                  <div className="space-y-2">
                     <Label htmlFor="companyName">Company Name</Label>
                     <Input
                        id="companyName"
                        type="text"
                        placeholder="Your Company Inc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                     />
                  </div>
               )}
               <div className="space-y-2">
                  <Label htmlFor="role">Your Role</Label>
                  <Input
                     id="role"
                     type="text"
                     placeholder="e.g., Data Analyst, Developer"
                     value={role}
                     onChange={(e) => setRole(e.target.value)}
                  />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="useCase">Primary Use Case</Label>
                  <Select onValueChange={setUseCase}>
                     <SelectTrigger id="useCase">
                        <SelectValue placeholder="Select a use case" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="lead-generation">Lead Generation</SelectItem>
                        <SelectItem value="market-research">Market Research</SelectItem>
                        <SelectItem value="competitor-analysis">Competitor Analysis</SelectItem>
                        <SelectItem value="data-entry">Data Entry Automation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               {error && <p className="text-destructive text-sm">{error}</p>}
               {message && <p className="text-green-500 text-sm">{message}</p>}
               <Button type="submit" className="w-full">Sign Up</Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
               Already have an account?{" "}
               <Link href="/login" >
                  <span className="text-primary hover:underline">Sign in</span>
               </Link>
            </div>
         </div>
      </div>
   )
}
