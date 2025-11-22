'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-destructive">Something went wrong</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We couldn&apos;t process your request. Please try again.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Go back to the homepage</Link>
        </Button>
      </div>
    </div>
  )
}
