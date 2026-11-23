import { randomUUID } from "node:crypto";
import { ApiError } from "./errors.js";

/**
 * Evaluation runs take minutes, so they run in the background and are polled.
 * Only one run at a time. The last few runs are kept in memory (they are lost on restart,
 * the backend stores the finished record).
 */
export function createRunStore({ keep = 20 } = {}) {
  const runs = new Map();
  let runningId = null;

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
          run.status = "completed";
          run.result = result;
        })
        .catch((error) => {
          run.status = "failed";
          run.error = { code: error?.code ?? "ERROR", message: error?.message ?? "The evaluation failed." };
        })
        .finally(() => {
          run.finishedAt = new Date().toISOString();
          runningId = null;
        });
      return run;
    },
    get(id) {
      return runs.get(id) ?? null;
    },
    get running() {
      return runningId;
    },
  };
}