import { makeAutoObservable, runInAction } from 'mobx';
import { api } from '../../../api/client';
import type {
  GenerationDTO,
  StartGenerationDto,
  ClusterGenerationDto,
  GenerationDefaultsResponse,
} from '../../../api/types';

interface FetchReviewsConfig {
  appIds?: string[];
}

export interface GenerationData extends GenerationDTO {
  baseQueries: string[] | Array<{ id: string; text: string; serpSnapshotId: string }>;
  errors: string[];
}

class EditGenerationStore {
  generation: GenerationData | null = null;
  defaults: GenerationDefaultsResponse | null = null;
  appIds: string[] | null = null;
  isLoadingAppIds = false;
  appIdsError: string | null = null;
  isFetchingReviews = false;
  fetchReviewsError: string | null = null;
  isLoading = false;
  isLoadingDefaults = false;
  error: string | null = null;
  isSaving = false;
  activeTab: 'overview' | 'baseQueries' | 'clusters' | 'roots' | 'variants' | 'json' | 'apps' = 'json';
  isTestMode = false;

  constructor() {
    makeAutoObservable(this);
    this.loadDefaults();
  }

  loadDefaults = async () => {
    runInAction(() => {
    this.isLoadingDefaults = true;
    });
    try {
      const defaults = await api.getGenerationDefaults();
      runInAction(() => {
        this.defaults = defaults;
      });
    } catch (error) {
      console.error('Failed to load defaults:', error);
      // Используем значения по умолчанию если не удалось загрузить
    } finally {
      runInAction(() => {
      this.isLoadingDefaults = false;
      });
    }
  }

  loadGeneration = async (id: string) => {
    runInAction(() => {
    this.isLoading = true;
    this.error = null;
      this.appIds = null;
      this.appIdsError = null;
    });
    try {
      const data = await api.getGeneration(id);
      runInAction(() => {
      this.generation = {
        ...data,
        baseQueries: data.baseQueries || [],
          errors: this.formatErrors(data.errors),
      };
      });
    } catch (error) {
      runInAction(() => {
      this.error = error instanceof Error ? error.message : 'Ошибка загрузки';
      });
    } finally {
      runInAction(() => {
      this.isLoading = false;
      });
    }
  }

  startGeneration = async (data: StartGenerationDto): Promise<string> => {
    runInAction(() => {
    this.isSaving = true;
    this.error = null;
    });
    try {
      if (this.isTestMode) {
        console.log('[TEST MODE] startGeneration(data):', JSON.stringify(data, null, 2));
        return '';
      } else {
        const result = await api.startGeneration(data);
        runInAction(() => {
        this.generation = {
          ...result,
          baseQueries: result.baseQueries || data.baseQueries,
            errors: this.formatErrors(result.errors),
        };
        });
        return result.id;
      }
    } catch (error) {
      runInAction(() => {
      this.error = error instanceof Error ? error.message : 'Ошибка создания';
      });
      throw error;
    } finally {
      runInAction(() => {
      this.isSaving = false;
      });
    }
  }

  rerunGeneration = async (id: string, data: StartGenerationDto) => {
    runInAction(() => {
    this.isSaving = true;
    this.error = null;
    });
    try {
      if (this.isTestMode) {
        console.log('[TEST MODE] rerunGeneration(id:', id, ', data):', JSON.stringify(data, null, 2));
      } else {
        const result = await api.rerunGeneration(id, data);
        runInAction(() => {
        this.generation = {
          ...result,
          baseQueries: result.baseQueries || data.baseQueries,
            errors: this.formatErrors(result.errors),
        };
        });
      }
    } catch (error) {
      runInAction(() => {
      this.error = error instanceof Error ? error.message : 'Ошибка перезапуска';
      });
      throw error;
    } finally {
      runInAction(() => {
      this.isSaving = false;
      });
    }
  }

  regenerateClusters = async (id: string, data: ClusterGenerationDto) => {
    runInAction(() => {
    this.isSaving = true;
    this.error = null;
    });
    try {
      const result = await api.regenerateClusters(id, data);
      runInAction(() => {
      this.generation = {
        ...result,
        baseQueries: this.generation?.baseQueries || result.baseQueries || [],
        errors: result.errors || [],
      };
      });
    } catch (error) {
      runInAction(() => {
      this.error = error instanceof Error ? error.message : 'Ошибка пересчета кластеров';
      });
      throw error;
    } finally {
      runInAction(() => {
      this.isSaving = false;
      });
    }
  }

  loadAppIds = async (id: string) => {
    runInAction(() => {
      this.isLoadingAppIds = true;
      this.appIdsError = null;
    });
    try {
      const appIds = await api.getAppIds(id);
      runInAction(() => {
        this.appIds = appIds;
      });
    } catch (error) {
      runInAction(() => {
        this.appIdsError = error instanceof Error ? error.message : 'Ошибка загрузки';
      });
    } finally {
      runInAction(() => {
        this.isLoadingAppIds = false;
      });
    }
    };
  fetchReviews = async (config?: FetchReviewsConfig, generationId?: string) => {
    const targetId = generationId ?? this.generation?.id;
    if (!targetId) {
      return;
    }
    runInAction(() => {
      this.isFetchingReviews = true;
      this.fetchReviewsError = null;
    });
    try {
      await api.fetchReviews(targetId, config);
    } catch (error) {
      runInAction(() => {
        this.fetchReviewsError = error instanceof Error ? error.message : 'Ошибка запроса';
      });
    } finally {
      runInAction(() => {
        this.isFetchingReviews = false;
      });
    }
  }

  setActiveTab = (tab: 'overview' | 'baseQueries' | 'clusters' | 'roots' | 'variants' | 'json' | 'apps') => {
    this.activeTab = tab;
  }

  setTestMode = (enabled: boolean) => {
    this.isTestMode = enabled;
  }

  reset = () => {
    this.generation = null;
    this.error = null;
    this.isLoading = false;
    this.isSaving = false;
    this.activeTab = 'json';
    this.appIds = null;
    this.appIdsError = null;
    this.isLoadingAppIds = false;
    this.isFetchingReviews = false;
    this.fetchReviewsError = null;
  }

  private formatErrors = (errors: unknown): string[] => {
    if (!Array.isArray(errors)) {
      return [];
    }
    return errors.map((error) => {
      if (typeof error === 'string') {
        return error;
      }
      if (error && typeof error === 'object') {
        const stage = (error as Record<string, any>).stage;
        const message = (error as Record<string, any>).message;
        if (stage && message) {
          return `${stage}: ${message}`;
        }
        if (message) {
          return message;
        }
        if ((error as Record<string, any>).trace) {
          return (error as Record<string, any>).trace;
        }
        return JSON.stringify(error);
      }
      return String(error);
    });
  }
}

export const editGenerationStore = new EditGenerationStore();
