import { makeAutoObservable } from 'mobx';

interface FormData {
  name: string;
  email: string;
  message: string;
}

class FormStore {
  formData: FormData | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setFormData(data: FormData) {
    this.formData = data;
  }

  clearFormData() {
    this.formData = null;
  }
}

export const formStore = new FormStore();

