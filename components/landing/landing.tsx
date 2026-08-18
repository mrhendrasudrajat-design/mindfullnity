"use client"

import dynamic from "next/dynamic"

import { Hero } from "./hero"
import { LanguageProvider } from "./locale-context"
import { Navbar } from "./navbar"

const Features = dynamic(() => import("./features").then((m) => m.Features))
const UseCases = dynamic(() => import("./use-cases").then((m) => m.UseCases))
const HowItWorks = dynamic(() =>
  import("./how-it-works").then((m) => m.HowItWorks),
)
const Testimonials = dynamic(() =>
  import("./testimonials").then((m) => m.Testimonials),
)
const Faq = dynamic(() => import("./faq").then((m) => m.Faq))
const Cta = dynamic(() => import("./cta").then((m) => m.Cta))
const Footer = dynamic(() => import("./footer").then((m) => m.Footer))

export function Landing() {
  return (
    <LanguageProvider>
      <div className="flex min-h-[100dvh] flex-col">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <Features />
          <UseCases />
          <HowItWorks />
          <Testimonials />
          <Faq />
          <Cta />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  )
}