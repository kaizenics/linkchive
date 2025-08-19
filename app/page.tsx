"use client"

import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Footer } from "@/components/footer"
import AuthToast from "@/components/auth-toast"

export default function Home() {
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
