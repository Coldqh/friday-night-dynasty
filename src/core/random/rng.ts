export class SeededRng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state += 0x6D2B79F5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  pick<T>(items: T[]): T {
    if (items.length === 0) throw new Error('Cannot pick from an empty array');
    return items[this.int(0, items.length - 1)];
  }

  shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

export function makeId(prefix: string, rng: SeededRng): string {
  return `${prefix}_${Math.floor(rng.next() * 1_000_000_000).toString(36)}`;
}
