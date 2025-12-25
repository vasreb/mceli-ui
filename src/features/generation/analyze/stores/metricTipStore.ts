import { makeAutoObservable } from 'mobx';
import type { MetricInfo } from '../components/types';
import { PALETTE_COLORS } from '../components/palette';

const STORAGE_KEY_PREFIX = 'metric-tip-color-';

export class MetricTipStore {
  colors = new Map<string, string | null>();
  private metricKeyCache = new Map<string, string[]>();

  constructor() {
    makeAutoObservable(this);
  }

  private storageKey(metric: string) {
    return `${STORAGE_KEY_PREFIX}${metric}`;
  }

  setColor(metric: string, color: string | null) {
    const existing = this.colors.get(metric);
    if (existing === color) {
      return;
    }
    this.colors.set(metric, color);
    if (typeof localStorage !== 'undefined') {
      if (color) {
        localStorage.setItem(this.storageKey(metric), color);
      } else {
        localStorage.removeItem(this.storageKey(metric));
      }
    }
    this.metricKeyCache.clear();
  }

  getColor(metric: string) {
    if (!this.colors.has(metric) && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey(metric));
      if (stored) {
        this.colors.set(metric, stored);
      }
    }
    return this.colors.get(metric) ?? null;
  }

  getSortedTips(tips: MetricInfo[]) {
    const coloredGroups = new Map<string, MetricInfo[]>();
    const regular: MetricInfo[] = [];
    tips.forEach((tip) => {
      const color = this.getColor(tip.metric);
      if (color) {
        const group = coloredGroups.get(color) ?? [];
        group.push(tip);
        coloredGroups.set(color, group);
      } else {
        regular.push(tip);
      }
    });
    const sorted: MetricInfo[] = [];
    const paletteSeen = new Set<string>();
    PALETTE_COLORS.forEach((color) => {
      const group = coloredGroups.get(color);
      if (group) {
        sorted.push(...group);
        paletteSeen.add(color);
      }
    });
    coloredGroups.forEach((group, color) => {
      if (!paletteSeen.has(color)) {
        sorted.push(...group);
      }
    });
    return [...sorted, ...regular];
  }

  getMetricKeys(tips: MetricInfo[]) {
    const cached = this.metricKeyCache.get(tips);
    if (cached) {
      return cached;
    }
    const computed = this.getSortedTips(tips).map((tip) => tip.metric);
    this.metricKeyCache.set(tips, computed);
    return computed;
  }
}

