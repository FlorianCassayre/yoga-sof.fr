export const ATTENDANCE_OPENING_MS = 60 * 60 * 1000;

export const attendanceOpensAt = (startsAt: Date): Date =>
  new Date(startsAt.getTime() - ATTENDANCE_OPENING_MS);
