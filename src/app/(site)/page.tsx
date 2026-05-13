import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LiveDemo } from "@/components/landing/live-demo";
import { Reveal } from "@/components/landing/reveal";

export default function Home() {
  return (
    <>
      <Hero />
      <Reveal>
        <LiveDemo />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal>
        <FinalCta />
      </Reveal>
    </>
  );
}
