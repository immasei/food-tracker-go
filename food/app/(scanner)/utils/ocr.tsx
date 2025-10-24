// (scanner)/utils/ocr.tsx
import * as FileSystem from "expo-file-system";

export type OcrLine = { text: string; confidence?: number };
export type OcrResult = {
  // full raw text, normalised
  text: string;
  // 1 entry per text line
  lines: OcrLine[];
};

const GOOGLE_KEY = "AIzaSyBKHxLnQVBtu7eNqFkkZMWm1VbXp2xGDKU";

export async function cloudOCR(photo: any): Promise<OcrResult> {

	// 1) convert to base64 (you already do this; kept here for clarity)
	let base64 = photo.base64 as string | undefined;
	if (!base64 && photo.uri) {
		base64 = await FileSystem.readAsStringAsync(photo.uri, {
				encoding: "base64",
		});
	}

	// 2) call Google Vision images:annotate
	const url = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_KEY}`;
	const body = {
		requests: [
			{
				image: { content: base64 },
				features: [{ type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 }],
				imageContext: {
					languageHints: ["en"] // add more hints if needed
				}
			}
		]
	};

	const resp = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	const json = await resp.json();

	if (!resp.ok || json.error) {
		throw new Error(json?.error?.message || `Vision error ${resp.status}`);
	}

	// response: text
	const first = json?.responses?.[0];
	const raw: string =
		first?.fullTextAnnotation?.text ??
		first?.textAnnotations?.[0]?.description ??
		"";
	const text = normalizeOcrNoise(raw);

	// response: lines
	const r0 = json.responses?.[0];
	let lines: string[] = [];

	if (r0?.fullTextAnnotation?.text) {
		lines = String(r0.fullTextAnnotation.text).split(/\r?\n/).filter(Boolean);
	} else if (Array.isArray(r0?.textAnnotations) && r0.textAnnotations.length) {
		// textAnnotations[0].description is the whole text
		lines = String(r0.textAnnotations[0].description).split(/\r?\n/).filter(Boolean);
	}


	return { text, lines: lines.map((text) => ({ text })) };
}

function normalizeOcrNoise(text: string): string {
  let t = text.replace(/\r/g, "").replace(/\t/g, " ");
  // uppercase for simpler matching, keep original line breaks for name heuristics
  // but do replacements on a case-insensitive basis:
  t = t
    .replace(/[–—]/g, "-")
    .replace(/■/g, "-")
    .replace(/[|]/g, "I");

  // digit/letter swaps often seen on dates/batches
  // (do conservative replacements; avoid touching inside words like "JUST")
  t = t.replace(/(?<=\b|\D)O(?=\d)/g, "0"); // O -> 0 when next char is digit
  t = t.replace(/(?<=\D|^)0(?=[A-Z])/g, "O"); // 0 -> O when next is letter
  t = t.replace(/(?<=\b|\D)I(?=\d)/g, "1");
  t = t.replace(/(?<=\b|\D)S(?=\d)/g, "5");
  t = t.replace(/(?<=\b|\D)B(?=\d)/g, "8");
  return t;
}