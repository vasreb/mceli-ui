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

export interface VariantsConfigDto {
  inclusionRule?: 'OK_ONLY' | 'OK_AND_MIXED' | 'ALL';
  ttlDays?: number;
  autosuggestions: boolean;
  similar: boolean;
  questions: boolean;
}

export interface ReviewsConfigDto {
  startPage: number;
  pagesToScrape: number;
  reviewsPerPage: number;
  maxReviews: number;
  deviceType: string;
  uniqueOnly: boolean;
  sortBy: string;
  rating: number;
  ratingFilter: number[];
  language?: string[];
  recentDays?: number;
  endDate?: string;
}

export interface GenerationConfigDto {
  locale: string;
  serpTopK: number;
  serpSnapshotMaxAgeDays: number;
  ngramMinCount: number;
  clustering: ClusteringConfigDto;
  sanity: SanityConfigDto;
  variants?: VariantsConfigDto;
  appCards?: {
    ttlDays?: number;
  };
  reviews?: ReviewsConfigDto;
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
  baseQueriesCount: number;
  rootsCount: number;
  variantsCount: number;
  clustersCount: number;
  serpSnapshotsCount: number;
  baseQueriesSerpSnapshotsCount: number;
  rootsSerpSnapshotsCount: number;
}

export type AnalyzeOverviewDto = Record<string, unknown>;
export type AnalyzeTriggerResponseDto = Record<string, unknown>;

export interface SerpSnapshotListQueryDto {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: SerpSnapshotSortDto;
}

export interface SerpSnapshotSortDto {
  field: string;
  direction?: 'ASC' | 'DESC';
}

export interface ClusterMetricsListQueryDto {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: SerpSnapshotSortDto;
}

export interface VariantListQueryDto {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: SerpSnapshotSortDto;
  filter?: {
    rootId?: string;
  };
}

export interface VariantListItem {
  id: string;
  text: string;
  rootId: string | null;
  searchVolume: number | null;
  commercial: number | null;
  navigational: number | null;
  informational: number | null;
  competition: number | null;
  cpc: number | null;
  transactional: number | null;
}

export interface VariantListResponse {
  total: number;
  page: number;
  perPage: number;
  items: VariantListItem[];
}

export interface ReviewListQueryDto {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: SerpSnapshotSortDto;
  filter?: {
    appIds?: string[];
  };
}

export interface ReviewListItem {
  id: string;
  appId: string;
  rating: number | null;
  reviewer: string | null;
  date: string | null;
  body: string | null;
  helpfulCounts: number | null;
  language: string | null;
  reviewId: string | null;
  reviewUrl: string | null;
}

export interface ReviewListResponse {
  total: number;
  page: number;
  perPage: number;
  items: ReviewListItem[];
}

export interface SerpSnapshotMetrics {
  resultCount: number;
  uniqueAppsCount: number;
  duplicatesCount: number;
  uniqueDevelopersCount: number;
  topDeveloperShare: number;
  hhiDeveloper: number;
  keywordInTitleRate: number;
  scoreMedian: number | null;
  scoreP25: number | null;
  scoreAvg: number | null;
}

export interface SerpSnapshotDetails {
  id: string;
  queryText: string;
  locale: string;
  topK: number | null;
  topAppIds: string[];
  result: Record<string, unknown>;
  createdAt: string;
}

export interface SerpSnapshotItem {
  id: string;
  snapshot: SerpSnapshotDetails;
  metrics: SerpSnapshotMetrics;
}

export interface SerpSnapshotListResponse {
  total: number;
  page: number;
  perPage: number;
  items: SerpSnapshotItem[];
}

export interface AppSnapshotListQueryDto {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: SerpSnapshotSortDto;
  filter?: {
    rootId?: string;
    clusterId?: string;
  };
}

export interface AppSnapshotMetrics {
  installsMin: number;
  installsMax: number;
  iapRangeMin: number;
  iapRangeMax: number;
  iapRangeMid: number;
  iapPriceLevel: number | null;
  iapMoneyScore: number | null;
  iapPriceSpread?: number | null;
  iapRevenuePotentialProxy?: number | null;
  installsMid: number;
  rating: number;
  reviewsCount: number;
  ratingsCount: number;
  updatedAt: string;
  updateAgeDays: number;
  isFree: boolean;
  price: number;
  hasIAP: boolean;
  iapRange: string;
  hasAds: boolean;
  strengthScore: number;
  hist_total: number;
  hist_share_1: number;
  hist_share_2: number;
  hist_share_3: number;
  hist_share_4: number;
  hist_share_5: number;
  hist_share_neg: number;
  hist_share_pos: number;
  hist_share_mid: number;
  hist_avg: number;
  hist_trimmed_avg_2_4: number;
  hist_polar_extremes_share: number;
  hist_polar_5_minus_1: number;
  hist_neg_to_pos_ratio: number;
  hist_variance: number;
  hist_std: number;
  hist_entropy: number;
  hist_neg_weighted_by_reviews: number;
  hist_neg_count_est: number;
  hist_pain_score: number;
  anomalyScore: number;
  anomalyScore2: number;
}

export interface AppSnapshotItem {
  id: string;
  appId: string;
  metrics: AppSnapshotMetrics;
}

export interface AppSnapshotListResponse {
  total: number;
  page: number;
  perPage: number;
  items: AppSnapshotItem[];
}

export interface RootMetrics {
  root_opportunity_raw: number | null;
  root_manual_priority_raw: number | null;
  root_demand_reviews_sum: number | null;
  root_demand_installs_sum_mid: number | null;
  root_top3_share_reviews: number | null;
  root_hist_neg_share_weighted: number | null;
  root_iap_rate: number | null;
  iapRangeMid: number | null;
  root_iap_price_level_median: number | null;
  root_iap_price_level_p75: number | null;
  root_iap_money_score_weighted: number | null;
  root_iap_revenue_potential_sum?: number | null;
  root_money_iap_score_raw: number | null;
  root_money_iap_score_raw_gated?: number | null;
  root_money_factor_iap: number | null;
  root_opportunity_iap_raw: number | null;
  root_iap_presence?: number | null;
  root_ghost_share: number | null;
  root_staleness_median_days: number | null;
  root_hist_polar_std_weighted: number | null;
  root_demand_reviews_median: number | null;
  root_top1_share_reviews: number | null;
  root_hhi_reviews: number | null;
  root_top_strength_median_reviews: number | null;
  root_top_strength_p75_reviews: number | null;
  root_ads_rate: number | null;
  root_paid_rate: number | null;
  root_app_pain_score_avg: number | null;
  root_ghost_count: number | null;
  root_stale_high_installs_count: number | null;
  root_demand_score_raw: number | null;
  root_gap_score_raw: number | null;
  root_money_score_raw: number | null;
  root_monopoly_penalty_raw: number | null;
  root_staleness_p75_days: number | null;
  root_top_n: number | null;
  root_unique_apps_top_n: number | null;
  root_effective_apps_count: number | null;
  root_missing_app_cards_count: number | null;
  root_variants_count_total: number | null;
  root_variants_count_positive: number | null;
  root_variants_total_volume: number | null;
  root_variants_diversity_entropy_norm: number | null;
  root_variants_dominant_share: number | null;
}

export type RootSource = string;
export type RootSanityStatus = string;

export interface RootSnapshotItem {
  id: string;
  text: string;
  metrics: RootMetrics;
}

export interface RootSnapshotListResponse {
  total: number;
  page: number;
  perPage: number;
  items: RootSnapshotItem[];
}

export interface VariantListItem {
  id: string;
  text: string;
  rootId: string | null;
  searchVolume: number | null;
  commercial: number | null;
  navigational: number | null;
  informational: number | null;
  competition: number | null;
  cpc: number | null;
  transactional: number | null;
}

export interface VariantListResponse {
  total: number;
  page: number;
  perPage: number;
  items: VariantListItem[];
}

export interface RootSnapshotListQueryDto {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: SerpSnapshotSortDto;
  filter?: {
    clusterId?: string;
  };
}

export interface ClusterMetricsRecord {
  cluster_root_count: number;
  cluster_effective_roots_count: number;
  cluster_avg_effective_apps_per_root: number | null;
  cluster_total_effective_apps_across_roots: number;
  cluster_missing_app_cards_sum: number;
  cluster_app_card_coverage_rate: number | null;
  cluster_sanity_overlap_avg: number | null;
  cluster_sanity_overlap_weighted: number | null;
  cluster_sanity_overlap_median: number | null;
  cluster_sanity_overlap_p25: number | null;
  cluster_sanity_overlap_p75: number | null;
  cluster_cohesion_score: number | null;
  cluster_diversity_score: number | null;
  cluster_demand_installs_sum_mid_upper: number;
  cluster_demand_installs_sum_mid_lower: number | null;
  cluster_demand_installs_sum_mid_robust: number | null;
  cluster_demand_reviews_sum_upper: number;
  cluster_demand_reviews_sum_lower: number | null;
  cluster_demand_reviews_sum_robust: number | null;
  cluster_demand_reviews_median_weighted: number | null;
  cluster_demand_installs_median_mid_weighted: number | null;
  cluster_top1_share_reviews_weighted: number | null;
  cluster_top3_share_reviews_weighted: number | null;
  cluster_hhi_reviews_weighted: number | null;
  cluster_top_strength_median_reviews_weighted: number | null;
  cluster_top_strength_p75_reviews_weighted: number | null;
  cluster_staleness_median_days_weighted: number | null;
  cluster_staleness_p75_days_weighted: number | null;
  cluster_stale_high_installs_count_sum: number;
  cluster_iap_rate_weighted: number | null;
  cluster_ads_rate_weighted: number | null;
  cluster_paid_rate_weighted: number | null;
  cluster_root_iap_range_mid_avg: number | null;
  cluster_iap_money_score_weighted: number | null;
  cluster_iap_price_level_p75_robust: number | null;
  cluster_iap_price_level_median_weighted?: number | null;
  cluster_money_iap_score_raw: number | null;
  cluster_money_iap_score_raw_gated?: number | null;
  cluster_money_factor_iap: number | null;
  cluster_opportunity_iap_raw: number | null;
  cluster_iap_presence?: number | null;
  cluster_hist_neg_share_weighted: number | null;
  cluster_hist_polar_std_weighted: number | null;
  cluster_app_pain_score_avg_weighted: number | null;
  cluster_ghost_count_sum: number;
  cluster_ghost_share_weighted: number | null;
  cluster_demand_score_raw: number | null;
  cluster_gap_score_raw: number | null;
  cluster_money_score_raw: number | null;
  cluster_monopoly_penalty_raw: number | null;
  cluster_opportunity_raw: number | null;
  cluster_manual_priority_raw: number | null;
  cluster_best_root_opportunity_raw: number | null;
  cluster_best_root_manual_priority_raw: number | null;
  cluster_best_root_demand_reviews_sum: number | null;
  cluster_variants_diversity_entropy_norm: number | null;
}

export interface ClusterMetricsListItem {
  id: string;
  clusterId: string;
  label: string | null;
  rootIds: string[];
  metrics: ClusterMetricsRecord;
  updatedAt: string;
}

export interface ClusterMetricsListResponse {
  total: number;
  page: number;
  perPage: number;
  items: ClusterMetricsListItem[];
}

export interface RootInfoResponse {
  id: string;
  text: string;
  source: RootSource;
  baseQueryIds: string[];
  appsIds: string[];
  sanityStatus: RootSanityStatus;
  sanityOverlap: number;
  sanityCheckedAt: string | null;
  serpSnapshotId: string | null;
  createdAt: string;
}

export interface RootMetricsResponse {
  id: string;
  metrics: RootMetrics;
  updatedAt: string;
}

export interface AppCardSnapshotResponse extends AppSnapshotItem {
  data: Record<string, unknown>;
}

export interface AppCardSnapshotMetricsResponse {
  id: string;
  metrics: AppSnapshotMetrics;
  updatedAt: string;
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
  variants?: VariantDto[];
}

export interface VariantDto {
  text?: string;
  searchVolume?: number | null;
  competition?: number | null;
  cpc?: number | null;
  volume?: number | null;
  [key: string]: unknown;
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
  error?: string | null;
  errors?: string[];
  baseQueries?: string[] | BaseQueryItem[];
  clusters?: Cluster[];
  roots?: ClusterRoot[];
  parentId?: string;
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
  topK: number | null;
  topAppIds: string[];
  result: Record<string, unknown>;
}

export interface SerpSnapshotMetricsResponse {
  id: string;
  metrics: SerpSnapshotMetrics;
  updatedAt: string;
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
  variants?: {
    inclusionRule?: 'OK_ONLY' | 'OK_AND_MIXED' | 'ALL';
    ttlDays?: number;
    autosuggestions: boolean;
    similar: boolean;
    questions: boolean;
  };
  appCards?: {
    ttlDays: number;
  };
  reviews?: {
    startPage: number;
    pagesToScrape: number;
    reviewsPerPage: number;
    maxReviews: number;
    deviceType: string;
    uniqueOnly: boolean;
    sortBy: string;
    rating: number;
    ratingFilter: number[];
    language?: string[];
    recentDays?: number;
    endDate?: string;
  };
}

