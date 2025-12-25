import type {
  StartGenerationDto,
  GenerationDTO,
  ListGenerationsResponse,
  ListGenerationsQueryDto,
  ClusterGenerationDto,
  Cluster,
  SerpSnapshotDTO,
  CreateSerpSnapshotDto,
  GenerationDefaultsResponse,
  AnalyzeOverviewDto,
  AnalyzeTriggerResponseDto,
  SerpSnapshotListQueryDto,
  SerpSnapshotListResponse,
  SerpSnapshotMetricsResponse,
  AppSnapshotListQueryDto,
  AppSnapshotListResponse,
  AppCardSnapshotResponse,
  AppCardSnapshotMetricsResponse,
  RootSnapshotListQueryDto,
  RootSnapshotListResponse,
  RootInfoResponse,
  RootMetricsResponse,
  ClusterMetricsListQueryDto,
  ClusterMetricsListResponse,
  VariantListQueryDto,
  VariantListResponse,
  ReviewListQueryDto,
  ReviewListResponse,
} from './types';

const API_BASE_URL = 'http://192.168.10.103:3000';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // POST /generation/start
  startGeneration: (data: StartGenerationDto): Promise<GenerationDTO> => {
    return request<GenerationDTO>('/generation/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // POST /generation/:id/cluster
  regenerateClusters: (id: string, data: ClusterGenerationDto): Promise<GenerationDTO> => {
    return request<GenerationDTO>(`/generation/${id}/cluster`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // POST /generation/:id/rerun
  rerunGeneration: (id: string, data: StartGenerationDto): Promise<GenerationDTO> => {
    return request<GenerationDTO>(`/generation/${id}/rerun`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /generation/:id
  getGeneration: (id: string): Promise<GenerationDTO> => {
    return request<GenerationDTO>(`/generation/${id}`);
  },

  // GET /generation/:id/clusters
  getGenerationClusters: (id: string): Promise<Cluster[]> => {
    return request<Cluster[]>(`/generation/${id}/clusters`);
  },

  // GET /generation/:id/analyze/overview
  getAnalyzeOverview: (id: string): Promise<AnalyzeOverviewDto> => {
    return request<AnalyzeOverviewDto>(`/generation/${id}/analyze/overview`);
  },

  // GET /generation/:id/analyze/serps
  getAnalyzeSerps: (
    id: string,
    params?: SerpSnapshotListQueryDto
  ): Promise<SerpSnapshotListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.perPage !== undefined) {
      queryParams.append('perPage', params.perPage.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.sortBy) {
      queryParams.append('sortBy.field', params.sortBy.field);
      if (params.sortBy.direction) {
        queryParams.append('sortBy.direction', params.sortBy.direction);
      }
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/generation/${id}/analyze/serps?${queryString}`
      : `/generation/${id}/analyze/serps`;
    return request<SerpSnapshotListResponse>(endpoint);
  },

  // POST /generation/:id/analyze
  triggerAnalyze: (id: string): Promise<AnalyzeTriggerResponseDto> => {
    return request<AnalyzeTriggerResponseDto>(`/generation/${id}/analyze`, {
      method: 'POST',
    });
  },

  // GET /generation/:id/analyze/app-snapshots
  getAnalyzeAppSnapshots: (
    id: string,
    params?: AppSnapshotListQueryDto
  ): Promise<AppSnapshotListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.perPage !== undefined) {
      queryParams.append('perPage', params.perPage.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.sortBy) {
      queryParams.append('sortBy.field', params.sortBy.field);
      if (params.sortBy.direction) {
        queryParams.append('sortBy.direction', params.sortBy.direction);
      }
    }
    if (params?.filter?.rootId) {
      queryParams.append('filter.rootId', params.filter.rootId);
    }
    if (params?.filter?.clusterId) {
      queryParams.append('filter.clusterId', params.filter.clusterId);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/generation/${id}/analyze/app-snapshots?${queryString}`
      : `/generation/${id}/analyze/app-snapshots`;
    return request<AppSnapshotListResponse>(endpoint);
  },

  getAnalyzeRoots: (
    id: string,
    params?: RootSnapshotListQueryDto
  ): Promise<RootSnapshotListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.perPage !== undefined) {
      queryParams.append('perPage', params.perPage.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.sortBy) {
      queryParams.append('sortBy.field', params.sortBy.field);
      if (params.sortBy.direction) {
        queryParams.append('sortBy.direction', params.sortBy.direction);
      }
    }
    if (params?.filter?.clusterId) {
      queryParams.append('filter.clusterId', params.filter.clusterId);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/generation/${id}/analyze/roots?${queryString}`
      : `/generation/${id}/analyze/roots`;
    return request<RootSnapshotListResponse>(endpoint);
  },
  getAnalyzeClusters: (
    id: string,
    params?: ClusterMetricsListQueryDto
  ): Promise<ClusterMetricsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.perPage !== undefined) {
      queryParams.append('perPage', params.perPage.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.sortBy) {
      queryParams.append('sortBy.field', params.sortBy.field);
      if (params.sortBy.direction) {
        queryParams.append('sortBy.direction', params.sortBy.direction);
      }
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/generation/${id}/analyze/clusters?${queryString}`
      : `/generation/${id}/analyze/clusters`;
    return request<ClusterMetricsListResponse>(endpoint);
  },
  getAnalyzeVariants: (
    id: string,
    params?: VariantListQueryDto
  ): Promise<VariantListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.perPage !== undefined) {
      queryParams.append('perPage', params.perPage.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.sortBy) {
      queryParams.append('sortBy.field', params.sortBy.field);
      if (params.sortBy.direction) {
        queryParams.append('sortBy.direction', params.sortBy.direction);
      }
    }
    if (params?.filter?.rootId) {
      queryParams.append('filter.rootId', params.filter.rootId);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/generation/${id}/analyze/variants?${queryString}`
      : `/generation/${id}/analyze/variants`;
    return request<VariantListResponse>(endpoint);
  },
  // GET /generation/:id/analyze/reviews
  getAnalyzeReviews: (
    id: string,
    params?: ReviewListQueryDto
  ): Promise<ReviewListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.perPage !== undefined) {
      queryParams.append('perPage', params.perPage.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.sortBy) {
      queryParams.append('sortBy.field', params.sortBy.field);
      if (params.sortBy.direction) {
        queryParams.append('sortBy.direction', params.sortBy.direction);
      }
    }
    if (params?.filter?.appIds) {
      queryParams.append('filter.appIds', params.filter.appIds.join(','));
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/generation/${id}/analyze/reviews?${queryString}`
      : `/generation/${id}/analyze/reviews`;
    return request<ReviewListResponse>(endpoint);
  },
  getAnalyzeRootInfo: (rootId: string): Promise<RootInfoResponse> => {
    return request<RootInfoResponse>(`/root/${rootId}`);
  },
  getAnalyzeRootMetrics: (
    rootId: string
  ): Promise<RootMetricsResponse> => {
    return request<RootMetricsResponse>(`/root/${rootId}/metrics`);
  },

  getAppCardSnapshot: (id: string): Promise<AppCardSnapshotResponse> => {
    return request<AppCardSnapshotResponse>(`/app-card-snapshot/${id}`);
  },

  getAppCardSnapshotMetrics: (id: string): Promise<AppCardSnapshotMetricsResponse> => {
    return request<AppCardSnapshotMetricsResponse>(`/app-card-snapshot/${id}/metrics`);
  },

  // GET /generation
  listGenerations: (params?: ListGenerationsQueryDto): Promise<ListGenerationsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/generation?${queryString}` : '/generation';
    
    return request<ListGenerationsResponse>(endpoint);
  },

  // GET /serpSnapshot/:id
  getSerpSnapshot: (id: string): Promise<SerpSnapshotDTO> => {
    return request<SerpSnapshotDTO>(`/serpSnapshot/${id}`);
  },

  // GET /serpSnapshot/:id/metrics
  getSerpSnapshotMetrics: (id: string): Promise<SerpSnapshotMetricsResponse | null> => {
    return request<SerpSnapshotMetricsResponse | null>(`/serpSnapshot/${id}/metrics`);
  },

  // POST /serpSnapshot
  createSerpSnapshot: (data: CreateSerpSnapshotDto): Promise<SerpSnapshotDTO> => {
    return request<SerpSnapshotDTO>('/serpSnapshot', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /generation/defaults
  getGenerationDefaults: (): Promise<GenerationDefaultsResponse> => {
    return request<GenerationDefaultsResponse>('/generation/defaults');
  },
  fetchReviews: (id: string, config?: { appIds?: string[] }): Promise<void> => {
    return request<void>(`/generation/${id}/fetch-reviews`, {
      method: 'POST',
      headers: config ? { 'Content-Type': 'application/json' } : undefined,
      body: config ? JSON.stringify(config) : undefined,
    });
  },
  getAppIds: (id: string): Promise<string[]> => {
    return request<string[]>(`/generation/${id}/app-ids`);
  },
};

