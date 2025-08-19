"use client";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import TextType from "@/components/ui/text-type";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';


export function Hero() {
    const router = useRouter();

    return (
        <div>
            <Container variant={"fullMobileConstrainedPadded"}>
                <div className="flex flex-col min-h-[70vh] justify-center items-center gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-center text-4xl sm:text-6xl font-black mb-4">
                            Save links to{" "} 
                            <TextType
                                text={[
                                    "visit later",
                                    "stay organized",
                                    "access anywhere",
                                    "keep them private",
                                    "never miss a beat"
                                ]}
                                textColors={[
                                    "#22d3ee", 
                                ]}
                                typingSpeed={75}
                                pauseDuration={1500}
                                showCursor={true}
                                cursorCharacter="|"
                            />
                        </h1>

                        <p className="font-sans text-center text-sm md:text-lg mx-auto max-w-3xl">
                            The bookmark manager with privacy at its core. linkchive uses Stacks technology to encrypt your saved links so only you can see them.
                        </p>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button size="lg" variant="default">
                                    Get Started
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        
                        <SignedIn>
                            <Button size="lg" variant="default" onClick={() => router.push('/links')}>
                                Get Started
                            </Button>
                        </SignedIn>
                        
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/about">
                                Learn More
                            </Link> 
                        </Button>
                    </div>
                </div>
            </Container>
        </div>
    );
}