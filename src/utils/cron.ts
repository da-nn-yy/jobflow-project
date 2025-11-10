/** Minimal cron matcher (minute hour dom month dow). Supports star and step expressions. */
export function matchesCron(expression: string, date: Date): boolean {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  const [minExpr, hourExpr, domExpr, monthExpr, dowExpr] = parts;
  const min = date.getUTCMinutes();
  const hour = date.getUTCHours();
  const dom = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const dow = date.getUTCDay();

  return (
    matchField(minExpr, min) &&
    matchField(hourExpr, hour) &&
    matchField(domExpr, dom) &&
    matchField(monthExpr, month) &&
    matchField(dowExpr, dow)
  );
}

function matchField(expr: string, value: number): boolean {
  if (expr === "*") return true;
  if (expr.startsWith("*/")) {
    const step = Number(expr.slice(2));
    return step > 0 && value % step === 0;
  }
  if (expr.includes(",")) {
    return expr.split(",").map(Number).includes(value);
  }
  return Number(expr) === value;
}

export function nextCronRun(expression: string, after: Date): Date {
  const cursor = new Date(after);
  cursor.setUTCSeconds(0, 0);
  for (let i = 0; i < 60 * 24 * 366; i++) {
    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
    if (matchesCron(expression, cursor)) {
      return new Date(cursor);
    }
  }
  throw new Error("no cron match within horizon");
}
