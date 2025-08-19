"use client"

import Link from "next/link"
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { ModeToggle } from "@/components/mode-toggle"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <Container variant={"fullMobileConstrainedPadded"}>
        <div className="flex h-14 items-center justify-between">
          <div className="flex">
            <Link href="/" className="font-lexend font-medium">
             linkchive.
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant={"outline"} data-clerk-signin-button>
                  Sign in
                </Button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </SignedIn>
            
            <ModeToggle />
          </div>
        </div>
      </Container>
    </header>
  )
}