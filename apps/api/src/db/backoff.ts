export function retryBackoffMs(attempt: number): number {
  return Math.min(2 ** (attempt - 1) * 1000, 30000);
}
