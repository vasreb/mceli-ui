export interface ClusteringConfigDto {
  inclusionRule: 'OK_ONLY' | 'OK_AND_MIXED' | 'ALL';
  threshold?: number;
  serpTopK: number;
}

export interface SanityConfigDto {
  minRootResults: number;
  okOverlapThreshold: number;
  zeroOverlapIsBad: boolean;
  oneWordPolicy: 'FORCE_MIXED' | 'WARN' | 'ERROR' | 'IGNORE';
  serpTopK: number;
  dedup: boolean;
}

export interface GenerationConfigDto {
  locale: string;
  serpTopK: number;
  serpSnapshotMaxAgeDays: number;
  ngramMinCount: number;
  clustering: ClusteringConfigDto;
  sanity: SanityConfigDto;
}

export interface StartGenerationDto {
  baseQueries: string[];
  config: GenerationConfigDto;
  idempotencyKey?: string;
}

export interface ClusterGenerationDto {
  config: {
    clustering: ClusteringConfigDto;
  };
}

export interface GenerationStatsDto {
  baseQueriesSerpSnapshotsCount: number;
  rootsSerpSnapshotsCount: number;
}

export interface BaseQueryItem {
  id: string;
  text: string;
  serpSnapshotId: string;
}

export interface ClusterRoot {
  text: string;
  sanityOverlap: number;
  sanityStatus: string;
}

export interface Cluster {
  name?: string;
  label?: string;
  roots: ClusterRoot[];
}

export interface GenerationDTO {
  id: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  createdAt: string;
  config: GenerationConfigDto;
  stats: GenerationStatsDto;
  error: string | null;
  baseQueries?: string[] | BaseQueryItem[];
  clusters?: Cluster[];
  roots?: ClusterRoot[];
}

export interface ListGenerationsResponse {
  items: GenerationDTO[];
  total: number;
  page: number;
  perPage: number;
}

export interface ListGenerationsQueryDto {
  page?: number;
  perPage?: number;
}

export interface SerpSnapshotDTO {
  id: string;
  createdAt: string;
  queryText: string;
  locale: string;
  topK: number;
  topAppIds: string[];
  result: any;
}

export interface CreateSerpSnapshotDto {
  queryText: string;
  locale: string;
  topK: number;
  ttlDays?: number;
}

export interface GenerationDefaultsResponse {
  serpSnapshotMaxAgeDays: number;
  serpTopK: number;
  ngramMinCount: number;
  clustering: {
    serpTopK: number;
    threshold: number;
  };
  sanity: {
    minRootResults: number;
    okOverlapThreshold: number;
    zeroOverlapIsBad: boolean;
    oneWordPolicy: 'FORCE_MIXED' | 'WARN' | 'ERROR' | 'IGNORE';
    serpTopK: number;
    dedup: boolean;
  };
}

