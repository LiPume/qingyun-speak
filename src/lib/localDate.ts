const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(key: string): Date {
  const match = DATE_KEY_PATTERN.exec(key);
  if (!match) throw new Error(`无效的本地日期：${key}`);
  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  if (getLocalDateKey(parsed) !== key) throw new Error(`无效的本地日期：${key}`);
  return parsed;
}

export function isLocalDateKey(key: string): boolean {
  try {
    parseLocalDateKey(key);
    return true;
  } catch {
    return false;
  }
}

export function addLocalDays(dateOrKey: Date | string, amount: number): string {
  const date = typeof dateOrKey === "string" ? parseLocalDateKey(dateOrKey) : new Date(dateOrKey);
  date.setDate(date.getDate() + amount);
  return getLocalDateKey(date);
}

export function formatLocalDateLabel(key: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("zh-CN", options ?? { month: "long", day: "numeric" }).format(parseLocalDateKey(key));
}
