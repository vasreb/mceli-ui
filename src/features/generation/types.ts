export interface GenerationFormData {
  id?: string;
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
  variants: {
    inclusionRule?: 'OK_ONLY' | 'OK_AND_MIXED' | 'ALL';
    ttlDays?: number;
    autosuggestions?: boolean;
    similar?: boolean;
    questions?: boolean;
  };
  appCards: {
    ttlDays?: number;
  };
  reviews: {
    startPage: number | undefined;
    pagesToScrape: number | undefined;
    reviewsPerPage: number | undefined;
    maxReviews: number | undefined;
    deviceType: string;
    uniqueOnly: boolean;
    sortBy: string;
    rating: number | undefined;
    ratingFilter: number[];
    language: string[];
    recentDays?: number | undefined;
    endDate?: string | undefined;
  };
}

