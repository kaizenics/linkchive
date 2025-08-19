"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export default function AuthToast() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (searchParams.get('auth') === 'required') {
      toast.error("You need to sign in first", {
        description: "Please sign in to access your links.",
        action: {
          label: "Sign in",
          onClick: () => {
            const signInButton = document.querySelector('[data-clerk-signin-button]') as HTMLButtonElement
            signInButton?.click()
          }
        }
      })
      

      if (typeof window !== 'undefined' && window.history.replaceState) {
        const url = new URL(window.location.href)
        url.searchParams.delete('auth')
        window.history.replaceState(null, '', url.toString())
      }
    }
  }, [searchParams])

  return null
}
