export interface GenerationFormData {
  baseQueriesText: string;
  locale: string;
  serpSnapshotMaxAgeDays: number | undefined;
  serpTopK: number | undefined;
  ngramMinCount: number | undefined;
  idempotencyKey: string;
  clustering: {
    serpTopK: number | undefined;
    inclusionRule: 'OK_ONLY' | 'OK_AND_MIXED' | 'ALL';
    threshold: number | undefined;
  };
  sanity: {
    minRootResults: number | undefined;
    okOverlapThreshold: number | undefined;
    zeroOverlapIsBad: boolean;
    oneWordPolicy: 'FORCE_MIXED' | 'WARN' | 'ERROR' | 'IGNORE';
    serpTopK: number | undefined;
    dedup: boolean;
  };
}

