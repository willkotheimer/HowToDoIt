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

export interface Profile {
  id?: number;
  name: string;
  householdId: number;
}

export interface ProfileChore {
  id?: number;
  profileId: number;
  choreId: number;
  chore?: Chore;
}

export interface ProfileAssignment {
  id?: number;
  profileId: number;
  userId: number;
  week: number;
  householdId: number;
  profile?: Profile;
}

export interface HouseholdSettings {
  id?: number;
  householdId: number;
  maxChoresPerProfile: number;
  rolloverEnabled: boolean;
}
