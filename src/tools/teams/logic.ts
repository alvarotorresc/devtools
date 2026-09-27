import { shuffle, type Rng } from '../../lib/random';

export type TeamMode = 'count' | 'size';

/** One person per line, trimmed; empty lines are ignored. */
export function parsePeople(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Number of teams: N itself, or ceil(total / N) when N is the size of each team. */
export function teamCount(total: number, mode: TeamMode, n: number): number {
  return mode === 'count' ? n : Math.ceil(total / n);
}

export type TeamsResult =
  | { ok: true; teams: string[][] }
  | { ok: false; reason: 'few' }
  | { ok: false; reason: 'n' }
  | { ok: false; reason: 'tooManyTeams'; people: number; teams: number };

/**
 * Shuffles and deals the people in turns, so team sizes differ by one at most:
 * 10 people, 3 per team → 4 teams of 3, 3, 2 and 2 (not 3, 3, 3 and 1).
 */
export function makeTeams(rng: Rng, people: string[], mode: TeamMode, n: number): TeamsResult {
  if (people.length < 2) return { ok: false, reason: 'few' };
  if (!Number.isInteger(n) || n < 1) return { ok: false, reason: 'n' };
  const k = teamCount(people.length, mode, n);
  if (k > people.length) {
    return { ok: false, reason: 'tooManyTeams', people: people.length, teams: k };
  }
  const teams: string[][] = Array.from({ length: k }, () => []);
  shuffle(rng, people).forEach((p, i) => teams[i % k].push(p));
  return { ok: true, teams };
}

/** "Equipo 1: Ana, Luis" per line. */
export function teamsToText(teams: string[][], prefix: string): string {
  return teams.map((t, i) => `${prefix} ${i + 1}: ${t.join(', ')}`).join('\n');
}
