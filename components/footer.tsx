"use client";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-12 mt-auto">
      <Container variant={"fullMobileConstrainedPadded"}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="font-press-start-2p text-2xl font-medium text-center md:text-left">linkchive.</h3>
            <p className="text-muted-foreground text-center md:text-left text-sm md:text-base">
              Your private bookmark manager, powered by<br className="hidden md:inline" />
              end-to-end encryption and Stacks technology.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/kaizenics/linkchive"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://twitter.com/linkchive"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Niko Soriano. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}