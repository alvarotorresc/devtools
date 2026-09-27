import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import { makeTeams, parsePeople, teamCount, teamsToText } from './logic';

const TEN = ['Ana', 'Luis', 'Eva', 'Marta', 'Pablo', 'Sara', 'Hugo', 'Lucía', 'Iván', 'Noa'];

const sizes = (r: ReturnType<typeof makeTeams>) => (r.ok ? r.teams.map((t) => t.length) : []);

describe('makeTeams', () => {
  it('splits by team size with sizes that differ by one at most', () => {
    expect(teamCount(10, 'size', 3)).toBe(4);
    expect(sizes(makeTeams(seededRng('demo'), TEN, 'size', 3))).toEqual([3, 3, 2, 2]);
    expect(sizes(makeTeams(seededRng('demo'), TEN, 'size', 5))).toEqual([5, 5]);
  });

  it('splits into a number of teams', () => {
    expect(sizes(makeTeams(seededRng('demo'), TEN, 'count', 3))).toEqual([4, 3, 3]);
    expect(sizes(makeTeams(seededRng('demo'), TEN, 'count', 10))).toEqual(Array(10).fill(1));
  });

  it('puts everybody in exactly one team', () => {
    const r = makeTeams(seededRng('demo'), TEN, 'count', 4);
    expect(r.ok && r.teams.flat().sort()).toEqual([...TEN].sort());
  });

  it('is deterministic with a seed', () => {
    expect(makeTeams(seededRng('x'), TEN, 'count', 3)).toEqual(
      makeTeams(seededRng('x'), TEN, 'count', 3),
    );
  });

  it('makes one shuffled team with N = 1', () => {
    expect(sizes(makeTeams(seededRng('demo'), TEN, 'count', 1))).toEqual([10]);
    expect(sizes(makeTeams(seededRng('demo'), TEN, 'size', 20))).toEqual([10]);
  });

  it('explains impossible splits', () => {
    const five = TEN.slice(0, 5);
    expect(makeTeams(seededRng('demo'), five, 'count', 6)).toEqual({
      ok: false,
      reason: 'tooManyTeams',
      people: 5,
      teams: 6,
    });
    expect(makeTeams(seededRng('demo'), ['Ana'], 'count', 1)).toEqual({ ok: false, reason: 'few' });
    expect(makeTeams(seededRng('demo'), TEN, 'count', 0)).toEqual({ ok: false, reason: 'n' });
  });
});

describe('text', () => {
  it('reads one person per line', () => {
    expect(parsePeople(' Ana \n\nLuis\r\n')).toEqual(['Ana', 'Luis']);
  });

  it('copies one team per line', () => {
    expect(
      teamsToText(
        [
          ['Ana', 'Luis'],
          ['Eva', 'Marta'],
        ],
        'Equipo',
      ),
    ).toBe('Equipo 1: Ana, Luis\nEquipo 2: Eva, Marta');
  });
});
