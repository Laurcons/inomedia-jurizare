import type { Types } from 'mongoose';

export const BORDA_SCORES = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1] as const;

/**
 * Applies Borda scoring to an ordered list of video IDs (position 0 = rank 1).
 * Returns a map of videoId string → score.
 */
export function scoreRanking(ranking: (Types.ObjectId | string)[]): Map<string, number> {
  const scores = new Map<string, number>();
  ranking.slice(0, 10).forEach((id, index) => {
    scores.set(id.toString(), BORDA_SCORES[index]);
  });
  return scores;
}

/**
 * Aggregates multiple rankings (each an ordered array of videoId strings) using Borda scoring.
 * Returns top 10 video IDs sorted by total score descending.
 */
export function aggregateRankings(rankings: string[][]): string[] {
  const totals = new Map<string, number>();
  for (const ranking of rankings) {
    const scored = scoreRanking(ranking);
    scored.forEach((score, id) => {
      totals.set(id, (totals.get(id) ?? 0) + score);
    });
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);
}

/**
 * Computes the national ranking with scores.
 * Each entry is { videoId, score }.
 *
 * Inputs:
 * - simpleVotes: submitted teacher simple rankings (each is 10 videoId strings in order)
 * - schoolRankings: aggregated per-school rankings from student votes (each is 10 videoId strings in order)
 */
export function computeNationalRanking(
  simpleVotes: string[][],
  schoolRankings: string[][],
): { videoId: string; score: number }[] {
  const totals = new Map<string, number>();

  const addVote = (ranking: string[]) => {
    scoreRanking(ranking).forEach((score, id) => {
      totals.set(id, (totals.get(id) ?? 0) + score);
    });
  };

  simpleVotes.forEach(addVote);
  schoolRankings.forEach(addVote);

  return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([videoId, score]) => ({ videoId, score }));
}
