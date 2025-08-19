"use client";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Globe, Lock, FileText } from "lucide-react";

export function About() {
  return (
    <div className="py-16">
      <Container variant={"fullMobileBreakpointPadded"}>
        <div className="flex flex-col gap-16">
          <div className="text-center">
            <h2 className="font-lexend text-3xl sm:text-4xl font-semibold mb-4">
              Your Links, Your Control
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Linkchive is built on the principle that your bookmarks should be yours alone.
              Using advanced encryption, we ensure your data stays private and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-xl bg-background/50 border">
              <div className="p-3 rounded-lg bg-primary/10">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-lexend text-xl font-medium">End-to-End Encryption</h3>
              <p className="text-muted-foreground">
                Your bookmarks are encrypted before they leave your device, ensuring
                only you can access them.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-xl bg-background/50 border">
              <div className="p-3 rounded-lg bg-primary/10">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-lexend text-xl font-medium">Access Anywhere</h3>
              <p className="text-muted-foreground">
                Save and access your links from any device, anytime. Your bookmarks
                sync securely across all your devices.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-xl bg-background/50 border">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-lexend text-xl font-medium">Smart Organization</h3>
              <p className="text-muted-foreground">
                Organize links with tags, collections, and smart filters. Find what
                you need when you need it.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-4 p-6 rounded-xl bg-background/50 border">
              <h3 className="font-lexend text-2xl font-medium">Our Privacy Commitment</h3>
              <p className="text-muted-foreground">
                We believe privacy is a fundamental right. That's why Linkchive is built with a zero-knowledge
                architecture. We can't read your bookmarks, can't share them, and can't lose them to data breaches.
                Your data remains truly yours.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>No tracking or analytics</li>
                <li>No third-party access</li>
                <li>No plaintext storage</li>
                <li>Open-source encryption</li>
              </ul>
            </div>

            <div className="flex flex-col gap-4 p-6 rounded-xl bg-background/50 border">
              <h3 className="font-lexend text-2xl font-medium">Technical Details</h3>
              <p className="text-muted-foreground">
                Linkchive uses industry-leading security practices to ensure your bookmarks stay private:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>AES-256 encryption</li>
                <li>Client-side key generation</li>
                <li>Zero-knowledge proof verification</li>
                <li>Secure key derivation (PBKDF2)</li>
                <li>Perfect forward secrecy</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto pt-8 border-t">
            <h2 className="font-lexend text-3xl sm:text-4xl font-semibold">
              Ready to Take Control?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of users who trust Linkchive to keep their bookmarks
              private, organized, and accessible.
            </p>
            <Button size="lg" variant="default">
              Get Started Now
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}