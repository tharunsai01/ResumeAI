export class BusyError extends Error {
    constructor() {
      super("The queue for model calls is full.");
      this.name = "BusyError";
      this.code = "BUSY";
    }
  }
  
  /**
   * Runs at most `maxConcurrent` tasks at once; the rest wait in a queue.
   * When the queue is also full, new tasks are refused with BusyError.
   */
  export function createLimiter({ maxConcurrent = 2, maxQueue = 50 } = {}) {
    let active = 0;
    const queue = [];
  
    const pump = () => {
      while (active < maxConcurrent && queue.length > 0) {
        const task = queue.shift();
        active++;
        task().finally(() => {
          active--;
          pump();
        });
      }
    };
  
    return {
      run(fn) {
        return new Promise((resolve, reject) => {
          if (active >= maxConcurrent && queue.length >= maxQueue) {
            reject(new BusyError());
            return;
          }
          queue.push(() => Promise.resolve().then(fn).then(resolve, reject));
          pump();
        });
      },
      get stats() {
        return { active, queued: queue.length, maxConcurrent, maxQueue };
      },
    };
  }