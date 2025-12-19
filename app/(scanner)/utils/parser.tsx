// (scanner)/utils/parser.tsx
import { isValid, parse, format } from "date-fns";

// --- normalise common date formats to YYYY-MM-DD
function tryParseDateToYMD(raw: string): string | null {
  const s = raw.trim();

  // 2025-12-12 or 2025/12/12
  const m1 = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m1) {
    const yyyy = Number(m1[1]), mm = Number(m1[2]), dd = Number(m1[3]);
    const d = new Date(yyyy, mm - 1, dd);
    return isValid(d) ? format(d, "yyyy-MM-dd") : null;
  }

  // 12/12/2025 or 12-12-2025  (assume D/M/Y or M/D/Y -> try both; au usually D/M/Y)
  const m2 = s.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (m2) {
    const a = Number(m2[1]), b = Number(m2[2]), y = Number(m2[3] < "100" ? "20" + m2[3] : m2[3]);

    // try D/M/Y (au)
    let d = new Date(y, b - 1, a);
    if (isValid(d)) return format(d, "yyyy-MM-dd");

    // fallback M/D/Y 
    d = new Date(y, a - 1, b);
    if (isValid(d)) return format(d, "yyyy-MM-dd");
  }

  // “Use by 12 Dec 2025”, “Best before 12/12/25”
  const m3 = s.match(
    /\b(?:use\s*by|best\s*before|expiry|exp|bb|bbd)[:\s-]*([A-Za-z0-9/.\-\s]+)/i
  );
  if (m3) {
    const tail = m3[1].replace(/[^\w/.\-\s]/g, " ").trim();
    const parts = tail.split(/\s+/).slice(0, 4).join(" ");
    // try several date-fns parse patterns
    const patterns = ["d/M/yy", "d/M/yyyy", "d MMM yyyy", "dd-MM-yyyy", "yyyy-MM-dd"];
    for (const p of patterns) {
      const d = parse(parts, p, new Date());
      if (isValid(d)) return format(d, "yyyy-MM-dd");
    }
  }

  // 25.10.19 (YY.MM.DD) or 2025.10.19 (YYYY.MM.DD)
  const mDot = s.match(/^(\d{2,4})\.(\d{1,2})\.(\d{1,2})$/);
  if (mDot) {
    const yRaw = Number(mDot[1]);
    const yyyy = mDot[1].length === 2 ? 2000 + yRaw : yRaw; // assume 20xx for 2-digit years
    const mm = Number(mDot[2]);
    const dd = Number(mDot[3]);
    const d = new Date(yyyy, mm - 1, dd);
    // Ensure no rollover (e.g., 2025-02-31 → Mar 3)
    if (isValid(d) && d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd) {
      return format(d, "yyyy-MM-dd");
    }
  }

  return null;
}

// --- heuristic: prefer short 1–3 word noun-ish phrases + avoid marketing & boilerplate
function guessName(text: string): string {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const STOP = new Set([
    "INGREDIENTS","NUTRITION","SERVING","STORAGE","MANUFACTURED","EXP","EXPIRY","BB","BBE","BEST","BEFORE","USE","BY",
    "OPEN","KEEP","REFRIGERATED","STORE","NET","ML","L","G","KG","DATE","BATCH","LOT","TIMELINE","OUTLINE","ICON",
    "HIGH","VITAMIN","C","NO","PRESERVATIVES","NOURISH","JUST","STYLE","USERS","CAMERA","ADAPTIVE"
  ]);

  // tokenize lines, keep those with a small count of alphabetic words, no long digits
  // prefer 1–3 words and allow combinations like "APPLE JUICE"
  const candidates: string[] = [];
  for (const line of lines) {
    if (/\d{3,}/.test(line)) continue; // likely nutrition/table numbers
    const words = line
      .replace(/[^\w\s\-]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) continue;

    // If line is too long or too short, skip
    if (words.length > 6) continue;

    const upper = words.map((w) => w.toUpperCase());
    const nonStop = upper.filter((w) => !STOP.has(w) && !/^\d+$/.test(w));

    // build a “producty” phrase: keep 1–3 non-stop words
    if (nonStop.length >= 1 && nonStop.length <= 4) {
      const phrase = nonStop.join(" ");
      // prefer phrases that contain common food terms when present
      const foodish = /(JUICE|MILK|YOGURT|YOGHURT|BREAD|SAUCE|PASTA|BEANS|SOUP|TEA|COFFEE|CEREAL|OATS|CHIPS|CRACKERS|BUTTER|CHEESE|YOGURT|WATER|SODA|COLA|APPLE|ORANGE|MANGO|BANANA|TOMATO|CHICKEN|BEEF|PORK|TOFU|NOODLE|RICE|OIL|TUNA|SALMON|SARDINE|CHOC|CHOCOLATE|BISCUIT|COOKIE|CANDY|HONEY|JAM|PEANUT|ALMOND|CASHEW|WALNUT)/i;
      const score = (foodish.test(phrase) ? 2 : 0) + (3 - Math.abs(nonStop.length - 2)); // prefer 2-word phrases
      candidates.push(`${score}|${phrase}`);
    }
  }

  if (!candidates.length) return "";

  // pick highest score, then longest
  candidates.sort((a, b) => {
    const [sa, pa] = a.split("|"); const [sb, pb] = b.split("|");
    const d = parseInt(sb, 10) - parseInt(sa, 10);
    if (d !== 0) return d;
    return pb.length - pa.length;
  });

  const best = candidates[0].split("|")[1];
  // proper case
  return best
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// --- main parser
export function deriveFromOCR(text: string, lines: string[]) {
  // expiry: take earliest valid date found (often the real expiry)
  const candidates = new Set<string>();
  for (const l of lines) {
    const ymd = tryParseDateToYMD(l);
    if (ymd) candidates.add(ymd);
  }
  const expiry = [...candidates].sort()[0] ?? null;
  const name = guessName(text);

  return { name, expiry };
}