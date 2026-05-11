import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-12">
      <section className="lg:col-span-7">{children}</section>
      <FilmPlatePanel />
    </div>
  )
}

function FilmPlatePanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden overflow-hidden border-l border-border/60 bg-card lg:col-span-5 lg:flex lg:flex-col"
    >
      {/* Radial vignette to give the panel cinematic depth. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 35%, oklch(0.18 0.01 240) 0%, oklch(0.13 0.008 240) 55%, oklch(0.09 0.008 240) 100%)",
        }}
      />

      {/* Subtle scan-line texture confined to this hero panel. */}
      <div className="pointer-events-none absolute inset-0 scanlines" />

      <div className="relative flex flex-1 flex-col px-10 py-10 xl:px-14">
        {/* Top slate marker. */}
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block size-2 rounded-full bg-primary animate-cursor-blink shadow-[0_0_8px_oklch(0.9_0.22_130/0.6)]"
            />
            Passage / Secure Lane
          </span>
          <span>Frame 02 / 04</span>
        </div>

        {/* Centred film plate. */}
        <div className="flex flex-1 items-center justify-center py-10">
          <FilmPlate />
        </div>

        {/* Terms footer. */}
        <p className="max-w-md font-mono text-[10px] uppercase leading-relaxed tracking-[0.22em] text-muted-foreground">
          By using Get Images you agree to our{" "}
          <Link
            href="#"
            className="text-foreground/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Terms
          </Link>{" "}
          &{" "}
          <Link
            href="#"
            className="text-foreground/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Privacy
          </Link>
          .
        </p>
      </div>
    </aside>
  )
}

function FilmPlate() {
  return (
    <figure className="relative w-full max-w-md">
      <div className="relative aspect-[4/5] overflow-hidden border border-primary/30 bg-background">
        <Image
          src="https://picsum.photos/seed/getimages-auth/1000/1400"
          alt=""
          fill
          sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 36vw, 0vw"
          className="object-cover opacity-90"
          priority
        />
        {/* Vignette over image to soften toward the frame edges. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 45%, transparent 55%, oklch(0.09 0.008 240 / 0.55) 100%)",
          }}
        />

        {/* Corner ticks. */}
        <CornerTick className="-left-[5px] -top-[5px]" />
        <CornerTick className="-right-[5px] -top-[5px]" />
        <CornerTick className="-left-[5px] -bottom-[5px]" />
        <CornerTick className="-right-[5px] -bottom-[5px]" />
      </div>
      <figcaption className="mt-5 flex items-start gap-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.22em] text-muted-foreground">
        <span className="mt-px text-primary">PROMPT</span>
        <span className="flex-1 normal-case tracking-[0.12em]">
          minimalist studio still life, north light, kodak portra 400
        </span>
      </figcaption>
    </figure>
  )
}

function CornerTick({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute block size-[10px] text-primary ${className ?? ""}`}
    >
      <svg viewBox="0 0 12 12" className="size-full">
        <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1" />
      </svg>
    </span>
  )
}
