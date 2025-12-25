import { makeAutoObservable } from 'mobx';

export type CommentEntry = {
  text: string;
  color: string | null;
};

const STORAGE_PREFIX = 'analyze-comment:';

const readStorage = () => {
  if (typeof localStorage === 'undefined') {
    return new Map<string, CommentEntry>();
  }
  const map = new Map<string, CommentEntry>();
  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith(STORAGE_PREFIX)) {
      return;
    }
    try {
      const value = localStorage.getItem(key);
      if (!value) {
        return;
      }
      const parsed = JSON.parse(value) as CommentEntry;
      map.set(key.substring(STORAGE_PREFIX.length), parsed);
    } catch {
      // ignore
    }
  });
  return map;
};

export class CommentStore {
  entries = readStorage();

  constructor() {
    makeAutoObservable(this);
  }

  getEntry(id: string): CommentEntry | null {
    return this.entries.get(id) ?? null;
  }

  setEntry(id: string, entry: CommentEntry) {
    this.entries.set(id, entry);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(entry));
    }
  }

  removeEntry(id: string) {
    this.entries.delete(id);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
    }
  }
}

export const commentStore = new CommentStore();

