export const createUTCDate = (year: number, month: number, day: number): Date =>
  new Date(Date.UTC(year, month - 1, day));
