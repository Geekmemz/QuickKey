export type GeneratorMode = "password" | "passphrase" | "username" | "pin";

export interface PasswordOptions {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  minNumbers: number;
  minSymbols: number;
  avoidAmbiguous: boolean;
}

export interface PassphraseOptions {
  words: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
}

export interface UsernameOptions {
  pattern: "random-word" | "adjective-noun" | "name-style";
  capitalize: boolean;
  includeNumber: boolean;
}

export interface PinOptions {
  length: number;
}

export interface HistoryRecord {
  id: string;
  mode: GeneratorMode;
  value: string;
  time: string;
}

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const NUMBERS = "23456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}:,.?";
const AMBIGUOUS = new Set(["I", "l", "1", "O", "0"]);

const WORDS = [
  "anchor", "breeze", "copper", "delta", "ember", "fable", "garden", "harbor", "ivory", "jungle",
  "kernel", "lantern", "meadow", "nectar", "onyx", "prairie", "quantum", "river", "summit", "timber",
  "utopia", "velvet", "willow", "xenon", "yonder", "zephyr", "atlas", "beacon", "cipher", "drift",
  "echo", "frost", "glimmer", "horizon", "island", "jovial", "keystone", "lunar", "meteor", "nova"
];

const ADJECTIVES = ["swift", "silent", "bright", "calm", "bold", "cool", "lucky", "steady", "gentle", "epic"];
const NOUNS = ["falcon", "forest", "harbor", "comet", "bridge", "summit", "planet", "voyager", "legend", "stream"];
const NAMES = ["alex", "morgan", "jordan", "taylor", "jamie", "casey", "devin", "reese", "skyler", "rowan"];

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sanitizeChars(chars: string, avoidAmbiguous: boolean): string {
  if (!avoidAmbiguous) return chars;
  return chars.split("").filter((ch) => !AMBIGUOUS.has(ch)).join("");
}

export function generatePassword(options: PasswordOptions): string {
  const sets: string[] = [];
  const upper = sanitizeChars(UPPER, options.avoidAmbiguous);
  const lower = sanitizeChars(LOWER, options.avoidAmbiguous);
  const numbers = sanitizeChars(NUMBERS, options.avoidAmbiguous);
  const symbols = sanitizeChars(SYMBOLS, options.avoidAmbiguous);

  if (options.useUpper) sets.push(upper);
  if (options.useLower) sets.push(lower);
  if (options.useNumbers) sets.push(numbers);
  if (options.useSymbols) sets.push(symbols);

  if (sets.length === 0) {
    return "";
  }

  const required: string[] = [];

  if (options.useNumbers) {
    for (let i = 0; i < options.minNumbers; i += 1) required.push(numbers[randomInt(numbers.length)]);
  }
  if (options.useSymbols) {
    for (let i = 0; i < options.minSymbols; i += 1) required.push(symbols[randomInt(symbols.length)]);
  }

  while (required.length < options.length) {
    const set = pick(sets);
    required.push(set[randomInt(set.length)]);
  }

  return shuffle(required).join("");
}

export function generatePassphrase(options: PassphraseOptions): string {
  const parts: string[] = [];
  for (let i = 0; i < options.words; i += 1) {
    let word = pick(WORDS);
    if (options.capitalize) {
      word = `${word[0].toUpperCase()}${word.slice(1)}`;
    }
    parts.push(word);
  }

  if (options.includeNumber) {
    parts[randomInt(parts.length)] = `${parts[randomInt(parts.length)]}${randomInt(100)}`;
  }

  return parts.join(options.separator);
}

export function generateUsername(options: UsernameOptions): string {
  let value = "";
  if (options.pattern === "random-word") {
    value = pick(WORDS);
  } else if (options.pattern === "adjective-noun") {
    value = `${pick(ADJECTIVES)}_${pick(NOUNS)}`;
  } else {
    value = `${pick(NAMES)}.${pick(NOUNS)}`;
  }

  if (options.capitalize) {
    value = value
      .split(/([_.-])/)
      .map((chunk) => (chunk.match(/[_.-]/) ? chunk : `${chunk[0].toUpperCase()}${chunk.slice(1)}`))
      .join("");
  }

  if (options.includeNumber) {
    value = `${value}${100 + randomInt(900)}`;
  }

  return value;
}

export function generatePin(options: PinOptions): string {
  let pin = "";
  for (let i = 0; i < options.length; i += 1) {
    pin += String(randomInt(10));
  }
  return pin;
}

export function scorePassword(input: string): { score: number; label: string } {
  if (!input) return { score: 0, label: "无" };

  let score = Math.min(4, Math.floor(input.length / 4));
  if (/[A-Z]/.test(input)) score += 1;
  if (/[a-z]/.test(input)) score += 1;
  if (/\d/.test(input)) score += 1;
  if (/[^A-Za-z0-9]/.test(input)) score += 1;

  score = Math.min(4, score);
  const labels = ["弱", "一般", "良好", "强", "极强"];
  return { score, label: labels[score] };
}

export function nowIsoString(): string {
  return new Date().toISOString();
}
