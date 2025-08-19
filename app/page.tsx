"use client"

import { Suspense, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Footer } from "@/components/footer"
import AuthToast from "@/components/auth-toast"

export default function Home() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/links')
    }
  }, [isLoaded, user, router])

  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <AuthToast />
      </Suspense>
      <Hero />
      <About />
      <Footer />
    </>
  );
}
