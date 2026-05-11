/**
 * Mock data for the Get Images UI demo.
 *
 * Wave 2c provides the shared data layer that the Generate, Library, Keys, and
 * Integrations pages all read from so the demo feels cohesive. Nothing here
 * hits a real API — the entries are static, deterministic, and re-used across
 * routes. Picsum.photos is used for placeholder imagery so the build needs no
 * external assets.
 */

export type AspectRatio = "1:1" | "3:2" | "16:9" | "2:3" | "4:5";

export type StylePreset =
  | "Photoreal"
  | "Editorial"
  | "Cinematic"
  | "Studio"
  | "Sketch"
  | "Ink";

export type MockImage = {
  id: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  aspect: AspectRatio;
  style: StylePreset;
  seed: number;
  createdAt: string;
  url: string;
  favorite?: boolean;
};

export type ApiKeyStatus = "active" | "revoked";

export type MockApiKey = {
  id: string;
  name: string;
  prefix: string;
  /** Only present in the just-created reveal flow (UI mock). */
  fullKey?: string;
  createdAt: string;
  lastUsedAt: string | null;
  status: ApiKeyStatus;
};

export const STYLE_PRESETS: StylePreset[] = [
  "Photoreal",
  "Editorial",
  "Cinematic",
  "Studio",
  "Sketch",
  "Ink",
];

export const ASPECT_RATIOS: AspectRatio[] = [
  "1:1",
  "3:2",
  "16:9",
  "2:3",
  "4:5",
];

export const MOCK_MODELS = [
  {
    id: "gi-img-3",
    name: "Get-Img v3",
    description: "Default. Balanced fidelity & speed.",
  },
  {
    id: "gi-img-3-cinema",
    name: "Get-Img v3 Cinema",
    description: "Anamorphic, film grain, high contrast.",
  },
  {
    id: "gi-img-3-studio",
    name: "Get-Img v3 Studio",
    description: "Catalog-grade product/still life.",
  },
] as const;

export type ModelId = (typeof MOCK_MODELS)[number]["id"];

/**
 * picsum.photos uses a seed to lock the placeholder to a stable image; we map
 * the aspect ratio to dimensions so the response Image matches the requested
 * frame. Kept here so consumers can reproduce URLs for newly-generated mocks.
 */
const ASPECT_DIMENSIONS: Record<AspectRatio, { w: number; h: number }> = {
  "1:1": { w: 800, h: 800 },
  "3:2": { w: 900, h: 600 },
  "16:9": { w: 1280, h: 720 },
  "2:3": { w: 600, h: 900 },
  "4:5": { w: 800, h: 1000 },
};

export function aspectDimensions(aspect: AspectRatio): {
  w: number;
  h: number;
} {
  return ASPECT_DIMENSIONS[aspect];
}

export function picsumUrl(id: string, aspect: AspectRatio): string {
  const { w, h } = ASPECT_DIMENSIONS[aspect];
  return `https://picsum.photos/seed/getimg-${id}/${w}/${h}`;
}

type ImageSeed = {
  id: string;
  prompt: string;
  negativePrompt?: string;
  model: ModelId;
  aspect: AspectRatio;
  style: StylePreset;
  seed: number;
  /** Days ago, used to build createdAt within the last 30 days. */
  daysAgo: number;
  favorite?: boolean;
};

const IMAGE_SEEDS: ImageSeed[] = [
  {
    id: "001",
    prompt:
      "A brutalist concrete library at dusk, rain on glass, single warm interior light, anamorphic flare",
    negativePrompt: "people, text, watermark",
    model: "gi-img-3-cinema",
    aspect: "16:9",
    style: "Cinematic",
    seed: 184219,
    daysAgo: 0,
    favorite: true,
  },
  {
    id: "002",
    prompt:
      "Still life — three ripe persimmons on a linen cloth, north-facing window light, paper-thin shadows",
    model: "gi-img-3-studio",
    aspect: "1:1",
    style: "Studio",
    seed: 902341,
    daysAgo: 1,
  },
  {
    id: "003",
    prompt:
      "Editorial portrait of a ceramicist in her studio, dust in afternoon light, kodak portra 400, 50mm",
    negativePrompt: "smile, jewelry",
    model: "gi-img-3",
    aspect: "2:3",
    style: "Editorial",
    seed: 553102,
    daysAgo: 2,
    favorite: true,
  },
  {
    id: "004",
    prompt:
      "Misted spruce forest at first light, fog rolling between trunks, distant mountain silhouette",
    model: "gi-img-3",
    aspect: "3:2",
    style: "Photoreal",
    seed: 410088,
    daysAgo: 3,
  },
  {
    id: "005",
    prompt:
      "Pen-and-ink sketch of a venetian rooftop, hatching only, no shading, archival paper grain",
    model: "gi-img-3",
    aspect: "4:5",
    style: "Ink",
    seed: 711029,
    daysAgo: 4,
  },
  {
    id: "006",
    prompt:
      "Macro shot of a wristwatch movement — brass plates, ruby jewels, ultra-shallow depth of field",
    model: "gi-img-3-studio",
    aspect: "1:1",
    style: "Studio",
    seed: 220914,
    daysAgo: 5,
    favorite: true,
  },
  {
    id: "007",
    prompt:
      "Empty diner booth at 2am, neon outside, condensation on the window, leftover coffee cup",
    model: "gi-img-3-cinema",
    aspect: "16:9",
    style: "Cinematic",
    seed: 998211,
    daysAgo: 6,
  },
  {
    id: "008",
    prompt:
      "Abstract — folded paper sculpture, monochrome cream, single hard side-light, no background",
    model: "gi-img-3-studio",
    aspect: "1:1",
    style: "Studio",
    seed: 134076,
    daysAgo: 7,
  },
  {
    id: "009",
    prompt:
      "Coastal cliffs at high tide, slate sky, single seabird in motion blur, hasselblad medium format look",
    model: "gi-img-3",
    aspect: "3:2",
    style: "Photoreal",
    seed: 651423,
    daysAgo: 9,
  },
  {
    id: "010",
    prompt:
      "Architectural detail — terrazzo stairwell spiraling up, warm bulbs on brass sconces, art deco",
    model: "gi-img-3-cinema",
    aspect: "2:3",
    style: "Cinematic",
    seed: 770201,
    daysAgo: 11,
  },
  {
    id: "011",
    prompt:
      "A weathered fisherman's hands knotting twine, deep shadows, single window key light, oil-painting tonality",
    model: "gi-img-3",
    aspect: "4:5",
    style: "Editorial",
    seed: 318477,
    daysAgo: 13,
    favorite: true,
  },
  {
    id: "012",
    prompt:
      "Loose graphite sketch of a sleeping greyhound, rough paper, smudged contours, no color",
    model: "gi-img-3",
    aspect: "3:2",
    style: "Sketch",
    seed: 446190,
    daysAgo: 14,
  },
  {
    id: "013",
    prompt:
      "Catalog product shot of a matte black espresso machine, neutral grey seamless, soft top-down softbox",
    model: "gi-img-3-studio",
    aspect: "4:5",
    style: "Studio",
    seed: 562108,
    daysAgo: 16,
  },
  {
    id: "014",
    prompt:
      "Aerial view of terraced rice fields after rain, low-angle sun raking the contours, sigma art look",
    model: "gi-img-3",
    aspect: "16:9",
    style: "Photoreal",
    seed: 832914,
    daysAgo: 18,
  },
  {
    id: "015",
    prompt:
      "Inky black bookshop interior, single reader at a desk lamp, dust motes, hard chiaroscuro",
    model: "gi-img-3-cinema",
    aspect: "2:3",
    style: "Cinematic",
    seed: 102330,
    daysAgo: 20,
  },
  {
    id: "016",
    prompt:
      "Watercolor of a tide pool — anemones, starfish, refracted light, hand-laid paper texture",
    model: "gi-img-3",
    aspect: "1:1",
    style: "Ink",
    seed: 615902,
    daysAgo: 23,
  },
  {
    id: "017",
    prompt:
      "Half-finished workbench — woodworking plane, curls of pine shavings, late afternoon side light",
    model: "gi-img-3",
    aspect: "3:2",
    style: "Editorial",
    seed: 901844,
    daysAgo: 26,
  },
  {
    id: "018",
    prompt:
      "Long-exposure of a subway platform, blurred crowd, single still figure in focus, tungsten light",
    model: "gi-img-3-cinema",
    aspect: "16:9",
    style: "Cinematic",
    seed: 256118,
    daysAgo: 29,
  },
];

/**
 * Build a stable base timestamp so that `createdAt` strings remain identical
 * across renders within a build. Anchored to the start of the current day.
 */
const NOW = new Date();
const TODAY_START = new Date(
  NOW.getFullYear(),
  NOW.getMonth(),
  NOW.getDate(),
).getTime();

function isoDaysAgo(days: number, minutes = 0): string {
  const offset = days * 86_400_000 + minutes * 60_000;
  return new Date(TODAY_START - offset).toISOString();
}

export const MOCK_IMAGES: MockImage[] = IMAGE_SEEDS.map((seed) => {
  // Conditional spread so optional fields are omitted (not set to `undefined`)
  // when absent — required by tsconfig `exactOptionalPropertyTypes`.
  const base = {
    id: seed.id,
    prompt: seed.prompt,
    model: seed.model,
    aspect: seed.aspect,
    style: seed.style,
    seed: seed.seed,
    // Spread images across the day so sort order is stable and unique.
    createdAt: isoDaysAgo(seed.daysAgo, Number(seed.id) * 7),
    url: picsumUrl(seed.id, seed.aspect),
  };
  return {
    ...base,
    ...(seed.negativePrompt !== undefined
      ? { negativePrompt: seed.negativePrompt }
      : {}),
    ...(seed.favorite !== undefined ? { favorite: seed.favorite } : {}),
  };
});

export const MOCK_KEYS: MockApiKey[] = [
  {
    id: "key_prod_001",
    name: "Production",
    prefix: "gi_live_x9k4••••••a1b2",
    createdAt: isoDaysAgo(45),
    lastUsedAt: isoDaysAgo(0, 17),
    status: "active",
  },
  {
    id: "key_dev_002",
    name: "Dev — local",
    prefix: "gi_live_p3r7••••••9q0w",
    createdAt: isoDaysAgo(12),
    lastUsedAt: null,
    status: "active",
  },
  {
    id: "key_cursor_003",
    name: "Cursor",
    prefix: "gi_live_h8t2••••••m4n6",
    createdAt: isoDaysAgo(60),
    lastUsedAt: isoDaysAgo(11),
    status: "active",
  },
  {
    id: "key_old_004",
    name: "Old laptop",
    prefix: "gi_live_c5v1••••••z2x8",
    createdAt: isoDaysAgo(120),
    lastUsedAt: isoDaysAgo(70),
    status: "revoked",
  },
];

export const EXAMPLE_PROMPTS: string[] = [
  "Empty parking garage at golden hour, single red car, anamorphic flare",
  "Editorial still life — three lemons, ceramic bowl, north window light",
  "A weathered lighthouse keeper writing in a logbook, kerosene lamp glow",
  "Brutalist gallery interior, single huge painting, polished concrete floor",
  "Macro shot of a vintage typewriter key, deep depth of field, soft rim light",
  "Tokyo back-alley at midnight, rain, neon reflections in puddles",
  "Soft watercolor of a snowy fox crossing a frozen stream at dawn",
  "Catalog shot of a leather satchel on a walnut surface, raking sidelight",
];
