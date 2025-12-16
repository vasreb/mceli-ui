import { makeAutoObservable } from 'mobx';
import { api } from '../../../api/client';

export type GenerationStatus = 'pending' | 'running' | 'done' | 'failed';

export interface Generation {
  id: string;
  status: GenerationStatus;
  createdAt: string;
  baseQueries: string[];
  metrics: {
    baseQueries: number;
    rootQueries: number;
    variantQueries: number;
    clusterQueries: number;
  };
  serpSnapshots: number;
  locale: string;
  error?: string;
}

class GenerationListStore {
  generations: Generation[] = [];
  isLoading = false;
  error: string | null = null;
  searchQuery = '';
  statusFilter: GenerationStatus | 'all' = 'all';
  localeFilter: string = 'all';
  onlyErrors = false;
  page = 0;
  rowsPerPage = 25;
  total = 0;

  constructor() {
    makeAutoObservable(this);
    this.loadGenerations();
  }

  async loadGenerations() {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await api.listGenerations({
        page: this.page + 1,
        perPage: this.rowsPerPage,
      });
      
      this.generations = response.items.map((item) => ({
        id: item.id,
        status: item.status,
        createdAt: item.createdAt,
        baseQueries: item.baseQueries || [],
        metrics: {
          baseQueries: item.baseQueries?.length || 0,
          rootQueries: item.stats.rootsSerpSnapshotsCount || 0,
          variantQueries: 0, // TODO: добавить когда будет в API
          clusterQueries: 0, // TODO: добавить когда будет в API
        },
        serpSnapshots: item.stats.baseQueriesSerpSnapshotsCount || 0,
        locale: item.config.locale,
        error: item.error || undefined,
      }));
      
      this.total = response.total;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка загрузки';
    } finally {
      this.isLoading = false;
    }
  }

  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  setStatusFilter(status: GenerationStatus | 'all') {
    this.statusFilter = status;
  }

  setLocaleFilter(locale: string) {
    this.localeFilter = locale;
  }

  setOnlyErrors(value: boolean) {
    this.onlyErrors = value;
  }

  setPage(page: number) {
    this.page = page;
    this.loadGenerations();
  }

  setRowsPerPage(rowsPerPage: number) {
    this.rowsPerPage = rowsPerPage;
    this.page = 0;
    this.loadGenerations();
  }

  getFilteredGenerations(): Generation[] {
    // Фильтрация на клиенте для поиска и локальных фильтров
    // Серверная пагинация уже применена в loadGenerations
    let filtered = [...this.generations];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.id.toLowerCase().includes(query) ||
          g.baseQueries.some((bq) => bq.toLowerCase().includes(query))
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((g) => g.status === this.statusFilter);
    }

    if (this.localeFilter !== 'all') {
      filtered = filtered.filter((g) => g.locale === this.localeFilter);
    }

    if (this.onlyErrors) {
      filtered = filtered.filter((g) => g.status === 'failed');
    }

    return filtered;
  }

  getLocales(): string[] {
    const locales = new Set(this.generations.map((g) => g.locale));
    return Array.from(locales).sort();
  }

  async deleteGeneration(id: string) {
    try {
      // TODO: добавить DELETE endpoint если будет
      await new Promise((resolve) => setTimeout(resolve, 300));
      this.generations = this.generations.filter((g) => g.id !== id);
      this.total--;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка удаления';
    }
  }
}

export const generationListStore = new GenerationListStore();
