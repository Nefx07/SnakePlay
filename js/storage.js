// Best-score persistence.
//
// localStorage is not always reachable: some browsers refuse it for file://
// origins and private windows throw on write. The store probes once and
// degrades to an in-memory value so the game never breaks over a high score.

class ScoreStore {
  constructor(key) {
    this.key = key;
    this.memoryValue = 0;
    this.persistent = ScoreStore.isStorageReachable();
  }

  static isStorageReachable() {
    const probeKey = 'stardance-snake:probe';
    try {
      window.localStorage.setItem(probeKey, '1');
      window.localStorage.removeItem(probeKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  load() {
    if (!this.persistent) {
      return this.memoryValue;
    }
    const stored = Number.parseInt(window.localStorage.getItem(this.key), 10);
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  }

  save(value) {
    this.memoryValue = value;
    if (!this.persistent) {
      return;
    }
    window.localStorage.setItem(this.key, String(value));
  }
}
