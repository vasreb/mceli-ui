import { makeAutoObservable } from 'mobx';

export interface Generation {
  uuid: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

class GenerationListStore {
  generations: Generation[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadGenerations();
  }

  async loadGenerations() {
    this.isLoading = true;
    this.error = null;
    try {
      // TODO: заменить на реальный API вызов
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.generations = [
        {
          uuid: '1',
          name: 'Генерация 1',
          description: 'Описание генерации 1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          uuid: '2',
          name: 'Генерация 2',
          description: 'Описание генерации 2',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ];
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка загрузки';
    } finally {
      this.isLoading = false;
    }
  }

  async deleteGeneration(uuid: string) {
    try {
      // TODO: заменить на реальный API вызов
      await new Promise((resolve) => setTimeout(resolve, 300));
      this.generations = this.generations.filter((g) => g.uuid !== uuid);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка удаления';
    }
  }
}

export const generationListStore = new GenerationListStore();

