/**
 * A tiny lantern registry, written to show off every syntax color.
 * @see https://github.com/davidfedericodev/yoru
 */
export enum Glow {
  Dim = "dim",
  Warm = "warm",
  Bright = "bright",
}

interface Lantern {
  readonly id: number;
  name: string;
  glow: Glow;
  lit: boolean;
  tags?: string[];
}

const MAX_LANTERNS = 64;
const NAME_PATTERN = /^[a-z][a-z0-9-]{2,31}$/i;

export class Registry<T extends Lantern = Lantern> {
  #items = new Map<number, T>();

  constructor(private readonly label: string) {}

  add(lantern: T): this {
    if (this.#items.size >= MAX_LANTERNS) {
      throw new RangeError(`Registry "${this.label}" is full`);
    }
    if (!NAME_PATTERN.test(lantern.name)) {
      console.warn(`Skipping invalid name: ${lantern.name}\n`);
      return this;
    }
    this.#items.set(lantern.id, lantern);
    return this;
  }

  // Returns only the lanterns that are currently lit.
  get lit(): T[] {
    return [...this.#items.values()].filter((l) => l.lit && l.glow !== Glow.Dim);
  }
}

export async function loadRegistry(url: string, ratio = 0.75): Promise<Registry> {
  const raw = (await fetch(url).then((res) => res.json())) as Lantern[];
  const registry = new Registry("night-market");

  for (const [index, lantern] of raw.entries()) {
    const brightness = Math.round(index * ratio * 100) / 100;
    registry.add({ ...lantern, lit: brightness > 0.5, tags: ["yoru", `#${index}`] });
  }

  return registry;
}
