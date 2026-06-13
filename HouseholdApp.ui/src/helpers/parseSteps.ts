/**
 * Parses a chore description into an ordered list of step strings.
 *
 * Handles four formats found in real chore data (in priority order):
 *  1. Numbered list  — "1. Turn on water\n2. Scrub sides"
 *  2. Dash/bullet   — "- Put in corner\n- Wipe down"
 *  3. Newline-sep   — "Wash clothes.\nDry clothes."
 *  4. Period-sep    — "Scrub sink. Rinse. Dry." (fallback)
 */
export function parseSteps(description: string | null | undefined): string[] {
  if (!description?.trim()) return [];
  const text = description.trim();

  // 1. Numbered: lines beginning with "1." or "1)"
  if (/^\s*\d+[.)]\s/m.test(text)) {
    return text
      .split('\n')
      .map((line) => line.replace(/^\s*\d+[.)]\s*/, '').trim())
      .filter(Boolean);
  }

  // 2. Dash / bullet
  if (/^\s*[-•]\s/m.test(text)) {
    return text
      .split('\n')
      .map((line) => line.replace(/^\s*[-•]\s*/, '').trim())
      .filter(Boolean);
  }

  // 3. Newline-separated plain sentences
  if (text.includes('\n')) {
    return text.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  // 4. Period-separated fallback
  return text
    .split('.')
    .map((s) => s.trim())
    .filter((s) => s && isNaN(Number(s)));
}
