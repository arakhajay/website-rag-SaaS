
import Link from "next/link"
import { Github, Linkedin, Twitter, Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background py-12 md:py-16">
      <div className="container flex flex-col items-center justify-between gap-8 md:flex-row">
        
        {/* Logo and Copyright */}
        <div className="flex flex-col items-center gap-4 md:items-start">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span>Zivox<span className="text-primary">Agent</span></span>
          </Link>
          <p className="text-sm text-muted-foreground">
            © 2026 Zivox Agent. All rights reserved.
          </p>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="mailto:support@zivoxagent.com" className="hover:text-foreground transition-colors">
            Contact Us
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <Link
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Twitter className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Linkedin className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Github className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
