export interface Category {
  id: number;
  categoryName: string;
}

export interface Chore {
  id?: number;
  Id?: number;
  Name?: string;
  name?: string;
  Description?: string;
  description?: string;
  HouseHoldId?: number;
  houseHoldId?: number;
  Category?: number;
  category?: number;
}

export interface Assignment {
  id?: number;
  assignmentId?: number;
  userId: number;
  week: number;
  isCompleted: boolean;
  rating: number;
  choreId: number;
  chorename?: string;
}

export interface HouseholdUser {
  id: number;
  firstname: string;
  firebaseKey?: string;
  email?: string;
  householdId?: number;
}

export interface ImageRecord {
  id: number;
  image: string;
  ChoreId?: number;
  Active?: number;
}

export interface AuthUser {
  uid: string;
  displayName?: string;
  email?: string;
}
