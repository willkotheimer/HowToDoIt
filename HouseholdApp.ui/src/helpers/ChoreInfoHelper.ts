export function parseChoreDescription(description: string): string[] {
  return description
    .split(/[.]/)
    .filter((entity) => isNaN(Number(entity)));
}
