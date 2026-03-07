/**
 * Seeded pseudo-random number generator (Mulberry32).
 * Provides deterministic random sequences from string or numeric seeds.
 */

/**
 * Hash a string into a 32-bit unsigned integer.
 * Uses a simple multiplicative hash (DJB2 variant).
 */
export function hashSeed(seed: string): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/**
 * Create a deterministic PRNG function from a 32-bit integer seed.
 * Uses Mulberry32 algorithm.
 * @returns A function that produces values in [0, 1) on each call.
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convenience: hash a string seed and return a seeded PRNG function.
 */
export function createSeededRandomFromString(seed: string): () => number {
  return createSeededRandom(hashSeed(seed));
}
