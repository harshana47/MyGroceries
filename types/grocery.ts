// types/grocery.ts

export interface Grocery {
  id?: string; 
  name: string; 
  quantity: number; 
  unit?: string; 
  category?: string; 
  notes?: string; 
  createdAt?: number; 
  updatedAt?: number; 
  userId?: string; 
  completed?: boolean;
}
