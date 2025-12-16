import { makeAutoObservable } from 'mobx';
import { Generation } from './generationListStore';

class EditGenerationStore {
  generation: Generation | null = null;
  isLoading = false;
  error: string | null = null;
  isSaving = false;

  constructor() {
    makeAutoObservable(this);
  }

  async loadGeneration(uuid: string) {
    this.isLoading = true;
    this.error = null;
    try {
      // TODO: заменить на реальный API вызов
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.generation = {
        uuid,
        name: `Генерация ${uuid}`,
        description: `Описание генерации ${uuid}`,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка загрузки';
    } finally {
      this.isLoading = false;
    }
  }

  updateField(field: keyof Generation, value: string) {
    if (this.generation) {
      this.generation[field] = value;
      this.generation.updatedAt = new Date().toISOString();
    }
  }

  async saveGeneration() {
    if (!this.generation) return;

    this.isSaving = true;
    this.error = null;
    try {
      // TODO: заменить на реальный API вызов
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Успешное сохранение
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка сохранения';
      throw error;
    } finally {
      this.isSaving = false;
    }
  }

  async createGeneration(data: Omit<Generation, 'uuid' | 'createdAt' | 'updatedAt'>) {
    this.isSaving = true;
    this.error = null;
    try {
      // TODO: заменить на реальный API вызов
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newGeneration: Generation = {
        ...data,
        uuid: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.generation = newGeneration;
      return newGeneration.uuid;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка создания';
      throw error;
    } finally {
      this.isSaving = false;
    }
  }

  reset() {
    this.generation = null;
    this.error = null;
    this.isLoading = false;
    this.isSaving = false;
  }
}

export const editGenerationStore = new EditGenerationStore();

