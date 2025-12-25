import type { SerpSnapshotMetrics } from '@/api/types';

export const SERP_METRIC_FIELDS: Array<[string, string, (metrics: SerpSnapshotMetrics) => unknown]> = [
  ['scoreP25', 'Score P25', (metrics) => metrics.scoreP25 ?? '—'],
  ['keywordInTitleRate', 'Keyword in title', (metrics) => metrics.keywordInTitleRate],
  ['hhiDeveloper', 'HHI', (metrics) => metrics.hhiDeveloper],
  ['topDeveloperShare', 'Top dev share', (metrics) => metrics.topDeveloperShare],
  ['uniqueDevelopersCount', 'Unique developers', (metrics) => metrics.uniqueDevelopersCount],
  ['scoreMedian', 'Score median', (metrics) => metrics.scoreMedian ?? '—'],
  ['resultCount', 'Result count', (metrics) => metrics.resultCount],
  ['uniqueAppsCount', 'Unique apps', (metrics) => metrics.uniqueAppsCount],
  ['duplicatesCount', 'Duplicates', (metrics) => metrics.duplicatesCount],
  ['scoreAvg', 'Score avg', (metrics) => metrics.scoreAvg ?? '—'],
];

