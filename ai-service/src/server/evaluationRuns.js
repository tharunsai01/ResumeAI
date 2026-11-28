import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { ApiError } from "./errors.js";

/**
 * Evaluation runs take minutes, so they run in the background and are polled.
 * Only one run at a time. The last few runs are kept in memory (older runs are lost on restart,
 * the most recent finished report is stored on disk when configured).
 */
export function createRunStore({ keep = 20, reportFile } = {}) {
  const runs = new Map();
  let runningId = null;
  if (reportFile) {
    try {
      const stored = JSON.parse(readFileSync(reportFile, "utf8"));
      if (stored?.id && stored.status === "completed") runs.set(stored.id, stored);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  return {
    start(task) {
      if (runningId) throw new ApiError(409, "EVALUATION_BUSY", "An evaluation is already running.");
      const run = {
        id: `run_${randomUUID().slice(0, 8)}`,
        status: "running",
        startedAt: new Date().toISOString(),
        finishedAt: null,
        progress: [],
        result: null,
        error: null,
      };
      runs.set(run.id, run);
      runningId = run.id;
      while (runs.size > keep) runs.delete(runs.keys().next().value);

      const log = (message) => {
        run.progress.push(message);
        if (run.progress.length > 50) run.progress.shift();
      };
      task({ log })
        .then((result) => {
          const completed = { ...run, status: "completed", result, finishedAt: new Date().toISOString() };
          if (reportFile) {
            const pendingFile = `${reportFile}.tmp`;
            writeFileSync(pendingFile, JSON.stringify(completed), { mode: 0o600 });
            renameSync(pendingFile, reportFile);
          }
          Object.assign(run, completed);
        })
        .catch((error) => {
          run.status = "failed";
          run.error = { code: error?.code ?? "ERROR", message: error?.message ?? "The evaluation failed." };
        })
        .finally(() => {
          run.finishedAt ??= new Date().toISOString();
          runningId = null;
        });
      return run;
    },
    latest() {
      return Array.from(runs.values()).at(-1) ?? null;
    },
    get(id) {
      return runs.get(id) ?? null;
    },
    get running() {
      return runningId;
    },
  };
}