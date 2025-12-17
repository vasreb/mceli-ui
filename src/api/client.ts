import type {
  StartGenerationDto,
  GenerationDTO,
  ListGenerationsResponse,
  ListGenerationsQueryDto,
  ClusterGenerationDto,
  SerpSnapshotDTO,
  CreateSerpSnapshotDto,
  GenerationDefaultsResponse,
} from './types';

const API_BASE_URL = import.meta.env.API_BASE_URL || 'http://localhost:3000';

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
};

