import { makeAutoObservable } from 'mobx';
import { api } from '../../../api/client';
import type {
  GenerationDTO,
  StartGenerationDto,
  ClusterGenerationDto,
  GenerationDefaultsResponse,
} from '../../../api/types';

export interface GenerationData extends GenerationDTO {
  baseQueries: string[] | Array<{ id: string; text: string; serpSnapshotId: string }>;
}

class EditGenerationStore {
  generation: GenerationData | null = null;
  defaults: GenerationDefaultsResponse | null = null;
  isLoading = false;
  isLoadingDefaults = false;
  error: string | null = null;
  isSaving = false;
  activeTab: 'overview' | 'baseQueries' | 'clusters' | 'roots' | 'json' = 'json';
  isTestMode = false;

  constructor() {
    makeAutoObservable(this);
    this.loadDefaults();
  }

  async loadDefaults() {
    this.isLoadingDefaults = true;
    try {
      this.defaults = await api.getGenerationDefaults();
    } catch (error) {
      console.error('Failed to load defaults:', error);
      // Используем значения по умолчанию если не удалось загрузить
    } finally {
      this.isLoadingDefaults = false;
    }
  }

  async loadGeneration(id: string) {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await api.getGeneration(id);
      // baseQueries могут быть строками или объектами - сохраняем как есть
      this.generation = {
        ...data,
        baseQueries: data.baseQueries || [],
      };
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка загрузки';
    } finally {
      this.isLoading = false;
    }
  }

  async startGeneration(data: StartGenerationDto): Promise<string> {
    this.isSaving = true;
    this.error = null;
    try {
      if (this.isTestMode) {
        console.log('[TEST MODE] startGeneration(data):', JSON.stringify(data, null, 2));
        return '';
      } else {
        const result = await api.startGeneration(data);
        this.generation = {
          ...result,
          baseQueries: result.baseQueries || data.baseQueries,
        };
        return result.id;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка создания';
      throw error;
    } finally {
      this.isSaving = false;
    }
  }

  async rerunGeneration(id: string, data: StartGenerationDto) {
    this.isSaving = true;
    this.error = null;
    try {
      if (this.isTestMode) {
        console.log('[TEST MODE] rerunGeneration(id:', id, ', data):', JSON.stringify(data, null, 2));
      } else {
        const result = await api.rerunGeneration(id, data);
        this.generation = {
          ...result,
          baseQueries: result.baseQueries || data.baseQueries,
        };
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка перезапуска';
      throw error;
    } finally {
      this.isSaving = false;
    }
  }

  async regenerateClusters(id: string, data: ClusterGenerationDto) {
    this.isSaving = true;
    this.error = null;
    try {
      const result = await api.regenerateClusters(id, data);
      this.generation = {
        ...result,
        baseQueries: this.generation?.baseQueries || result.baseQueries || [],
      };
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка пересчета кластеров';
      throw error;
    } finally {
      this.isSaving = false;
    }
  }

  setActiveTab(tab: 'overview' | 'baseQueries' | 'clusters' | 'roots' | 'json') {
    this.activeTab = tab;
  }

  setTestMode(enabled: boolean) {
    this.isTestMode = enabled;
  }

  reset() {
    this.generation = null;
    this.error = null;
    this.isLoading = false;
    this.isSaving = false;
    this.activeTab = 'json';
  }
}

export const editGenerationStore = new EditGenerationStore();
