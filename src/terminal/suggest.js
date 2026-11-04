/**
 * ==========================================================================
 * Levenshtein Distance & Command Suggestion Utility
 * ==========================================================================
 * Pure functions with zero external dependencies
 * ==========================================================================
 */

/**
 * Calculates Levenshtein distance between two strings.
 */
export function levenshteinDistance(a = '', b = '') {
  const s1 = String(a).toLowerCase();
  const s2 = String(b).toLowerCase();

  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Finds the closest matching command within maxDistance (default 2).
 * Strictly requires distance <= maxDistance.
 */
export function getClosestCommand(input = '', validCommands = [], maxDistance = 2) {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed || !Array.isArray(validCommands) || validCommands.length === 0) {
    return null;
  }

  let closest = null;
  let minDistance = Infinity;

  for (const cmd of validCommands) {
    const dist = levenshteinDistance(trimmed, cmd);
    if (dist <= maxDistance && dist < minDistance) {
      minDistance = dist;
      closest = cmd;
    }
  }

  return closest;
}
