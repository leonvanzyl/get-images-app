import { ExamplesGallery } from "@/components/landing/examples-gallery";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Reveal } from "@/components/landing/reveal";

export default function Home() {
  return (
    <>
      <Hero />
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal delay={80}>
        <ExamplesGallery />
      </Reveal>
      <Reveal delay={120}>
        <FinalCta />
      </Reveal>
    </>
  );
}
