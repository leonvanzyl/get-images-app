type Frame = {
  number: string;
  title: string;
  description: string;
  preview: React.ReactNode;
};

/**
 * 01 — ASK
 * A small chat-style block: the developer asks Claude Code for a hero image
 * from inside the editor. The blinking caret communicates "live session".
 */
function AskPreview() {
  return (
    <div className="relative h-[240px] w-full overflow-hidden bg-[oklch(0.11_0.008_240)]">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-border/60 px-3 py-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          CLAUDE.code
        </span>
        <span className="font-mono text-[9px] text-muted-foreground">
          /about · session
        </span>
      </div>
      <div className="px-3 pt-10 font-mono text-[11px] leading-relaxed">
        <p className="text-muted-foreground">$ claude</p>
        <p className="mt-2 text-foreground/85">
          <span className="text-primary">user&gt;</span>{" "}
          I need a hero image for the
          <br />
          <span className="pl-[4ch]">/about page. Foggy mountain</span>
          <br />
          <span className="pl-[4ch]">studio at dawn, 16:9.</span>
          <span
            aria-hidden="true"
            className="ml-0.5 inline-block w-[0.55em] translate-y-px bg-primary text-transparent animate-cursor-blink"
          >
            ▮
          </span>
        </p>
      </div>
    </div>
  );
}

/**
 * 02 — TOOL CALL
 * A mock tool-call transcript. The active film-progress strip at the bottom
 * carries the "rendering" feeling from the previous version.
 */
function ToolCallPreview() {
  return (
    <div className="relative h-[268px] w-full overflow-hidden bg-[oklch(0.11_0.008_240)]">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-border/60 px-3 py-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
          ● TOOL · generate_image
        </span>
        <span className="font-mono text-[9px] text-muted-foreground">
          0:01.42
        </span>
      </div>
      <div className="space-y-1.5 px-3 pt-9 pb-10 font-mono text-[11px] leading-relaxed">
        <p className="text-muted-foreground">
          <span className="text-foreground">tool&gt;</span>{" "}
          <span className="text-primary">generate_image</span>(
        </p>
        <p className="pl-[6ch] text-muted-foreground">
          prompt:{" "}
          <span className="text-primary">
            &quot;foggy mountain
            <br />
            <span className="pl-[8ch]">studio at dawn&quot;</span>
          </span>
          ,
        </p>
        <p className="pl-[6ch] text-muted-foreground">
          aspect: <span className="text-primary">&quot;16:9&quot;</span>,
        </p>
        <p className="pl-[6ch] text-muted-foreground">
          model:{" "}
          <span className="text-primary">&quot;google/nanobanana-pro&quot;</span>
        </p>
        <p className="text-muted-foreground">
          <span className="text-foreground">)</span>
        </p>
        <p className="text-muted-foreground">
          <span className="text-foreground">img&gt;</span>{" "}
          <span className="text-primary">✓ img_4f29.jpg</span>{" "}
          <span className="text-muted-foreground/80">· 1536×864 · 1.4s</span>
        </p>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-3 bottom-3 film-progress h-1 border border-primary/30 opacity-80"
      />
    </div>
  );
}

/**
 * 03 — SHIP
 * A git-diff style file-change block. `+` lines lime, `~` lines amber, context
 * lines muted — mirroring the agent's actual delta to the project.
 */
function ShipPreview() {
  return (
    <div className="relative h-[240px] w-full overflow-hidden bg-[oklch(0.11_0.008_240)]">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-border/60 px-3 py-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          DIFF / 2 files
        </span>
        <span className="font-mono text-[9px] text-primary">▲ COMMIT</span>
      </div>
      <div className="space-y-1 px-3 pt-10 font-mono text-[11px] leading-relaxed">
        <p className="text-primary">+ public/hero/about.jpg</p>
        <p className="text-amber-300">~ src/app/about/page.tsx</p>
        <p className="pl-[2ch] text-primary">+ import heroAbout from</p>
        <p className="pl-[4ch] text-primary">
          + &quot;@/public/hero/about.jpg&quot;;
        </p>
        <p className="pl-[2ch] text-primary">
          + &lt;Image src={"{heroAbout}"} ... /&gt;
        </p>
      </div>
    </div>
  );
}

const FRAMES: Frame[] = [
  {
    number: "01",
    title: "ASK",
    description:
      "You're in Claude Code, mid-build. You ask for a hero image without leaving the editor.",
    preview: <AskPreview />,
  },
  {
    number: "02",
    title: "TOOL CALL",
    description:
      "Claude Code reaches for the Get Images MCP. Your client can send OpenAI Image 2 or Google Nanobanana Pro via GET_IMAGES_MODEL (or per tool call). The server renders, returns a URL, and logs usage to your key.",
    preview: <ToolCallPreview />,
  },
  {
    number: "03",
    title: "SHIP",
    description:
      "The image is dropped into your project. You keep building. The same image lives in your Get Images library for next time.",
    preview: <ShipPreview />,
  },
];

// Tiny dark sprocket-hole strip drawn with a repeating gradient.
const SPROCKET_STYLE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(to right, transparent 0 14px, oklch(0.06 0.008 240) 14px 22px)",
};

export function HowItWorks() {
  return (
    <section
      id="flow"
      aria-labelledby="how-heading"
      className="border-b border-border/60 scroll-mt-24"
    >
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:py-32">
        <header className="mb-12 flex flex-col gap-4 border-l border-primary/40 pl-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            02 — THE FLOW
          </p>
          <h2
            id="how-heading"
            className="font-display text-4xl font-semibold tracking-tight text-balance md:text-5xl"
          >
            From ask to image, without leaving your agent.
          </h2>
          <p className="max-w-xl text-base text-muted-foreground">
            An example: a developer building a website asks Claude Code for a
            hero image. Get Images is called as a tool — you can pin{" "}
            <span className="text-foreground/90">OpenAI Image 2</span> or{" "}
            <span className="text-foreground/90">Google Nanobanana Pro</span> on
            each
            call. The image comes back; the developer keeps shipping.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {FRAMES.map((frame) => (
            <article
              key={frame.number}
              className="group relative border border-border/60 bg-card transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40"
            >
              {/* Top sprocket strip */}
              <div
                aria-hidden="true"
                className="h-3 border-b border-border/60"
                style={SPROCKET_STYLE}
              />

              {/* Header row */}
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                  {frame.number}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/80">
                  {frame.title}
                </span>
              </div>

              {/* Preview */}
              <div className="border-b border-border/60">{frame.preview}</div>

              {/* Description */}
              <div className="px-4 py-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {frame.description}
                </p>
              </div>

              {/* Bottom sprocket strip */}
              <div
                aria-hidden="true"
                className="h-3 border-t border-border/60"
                style={SPROCKET_STYLE}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
