export const isStale = (updatedAt: string, thresholdSec: number) => Date.now() - new Date(updatedAt).getTime() > thresholdSec * 1000;
