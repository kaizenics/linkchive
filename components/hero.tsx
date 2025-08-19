"use client";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import TextType from "@/components/ui/text-type";


export function Hero() {
    return (
        <div className="">
            <Container variant={"fullMobileBreakpointPadded"}>
                <div className="flex flex-col min-h-[70vh] justify-center items-center gap-4">
                    <div className="flex flex-col gap-2">


                        <h1 className="font-lexend text-center text-4xl sm:text-6xl font-semibold mb-4">
                            Save links to{" "} 
                            <TextType
                                text={[
                                    "visit later",
                                    "never miss a beat",
                                    "stay organized effortlessly",
                                    "access anywhere, anytime",
                                    "keep them private and secure"
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

                        <p className="font-sans text-center text-lg mx-auto max-w-3xl leading-tight">
                            The bookmark manager with privacy at its core. Linkchive.xyz uses Stacks technology to encrypt your saved links so only you can see them.
                        </p>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <Button size="lg" variant="default">
                            Get Started
                        </Button>
                        <Button size="lg" variant="outline">
                            Learn More
                        </Button>
                    </div>
                </div>
            </Container>
        </div>
    );
}