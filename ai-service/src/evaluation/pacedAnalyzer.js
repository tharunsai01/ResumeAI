import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { SYSTEM_PROMPT } from "../extraction/prompt.js";

const isRateLimit = (error) => /rate limit/i.test(error?.message ?? "");

/**
 * Wraps an analyze function for long evaluation runs on a rate-limited API:
 *  - pauses before every real model call (paceMs)
 *  - when the API says "rate limit", waits (waitMs) and tries again, up to maxWaits times
 *  - saves every result to cacheDir, so a rerun after a failure only repeats the calls that did not finish
 * analyzer(text, { sample }) - repeated samples of the SAME text (stability and control runs) must be real
 * separate calls, so the sample number is part of the saved result's key (default 0).
 * The key also includes the model name and the prompt, so changing either invalidates old results.
 */
export function createPacedAnalyzer({
  analyze,
  cacheDir = null,
  paceMs = 3000,
  waitMs = 60000,
  maxWaits = 4,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  onEvent = () => {},
}) {
  const stats = { calls: 0, cached: 0, waits: 0 };
  const cacheFile = (text, sample) =>
    cacheDir
      ? path.join(cacheDir, `${createHash("sha256").update(`${config.groq.model}\n${SYSTEM_PROMPT}\n${sample}\n${text}`).digest("hex")}.json`)
      : null;

  async function run(text, options = {}) {
    const file = cacheFile(text, options.sample ?? 0);
    if (file) {
      try {
        const hit = JSON.parse(await readFile(file, "utf8"));
        stats.cached++;
        return hit;
      } catch {
        // not cached yet
      }
    }

    for (let attempt = 0; ; attempt++) {
      await sleep(paceMs);
      try {
        stats.calls++;
        const result = await analyze(text);
        if (file) {
          await mkdir(cacheDir, { recursive: true });
          await writeFile(file, JSON.stringify(result));
        }
        return result;
      } catch (error) {
        if (!isRateLimit(error)) throw error;
        if (attempt >= maxWaits) {
          throw new Error(
            `Groq rate limit still reached after ${attempt} waits. The free tier may be used up for now: rerun later (finished calls are saved) or set a different GROQ_MODEL.`
          );
        }
        stats.waits++;
        onEvent(`rate limited - waiting ${Math.round(waitMs / 1000)} s (wait ${attempt + 1} of ${maxWaits})`);
        await sleep(waitMs);
      }
    }
  }

  run.stats = stats;
  return run;
}