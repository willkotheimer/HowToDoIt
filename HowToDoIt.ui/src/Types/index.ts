export interface Category {
  id: number;
  categoryName: string;
}

export interface StepImage {
  id: number;
  imageUrl: string;
  workStepId: number;
  active?: number;
  sortOrder?: number;
}

export interface WorkStep {
  id: number;
  workSequenceId: number;
  title?: string;
  description?: string;
  sortOrder?: number;
  images?: StepImage[];
}

export interface WorkSequence {
  id: number;
  title: string;
  domain?: string;
  description?: string;
  categoryId?: number | null;
  category?: Category | null;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
  steps?: WorkStep[];
  // First step image, populated by the feed listing for card thumbnails.
  coverImageUrl?: string | null;
}

// Payloads for create/update (id assigned by the server on create).
export type WorkSequenceInput = Omit<WorkSequence, 'id' | 'category' | 'steps' | 'createdAt' | 'updatedAt'> & { id?: number };
export type WorkStepInput = Omit<WorkStep, 'id' | 'images' | 'sortOrder'> & { id?: number };

export interface AuthUser {
  uid: string;
  displayName?: string;
  email?: string;
}
