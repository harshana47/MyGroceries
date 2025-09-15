import { auth, db } from "@/firebase";
import { Grocery } from "@/types/grocery";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

const getUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");
  return user.uid;
};

export const groceriesRef = () =>
  collection(db, "users", getUserId(), "groceries");

export const groceryDoc = (id: string) =>
  doc(db, "users", getUserId(), "groceries", id);

export const historyRef = () =>
  collection(db, "users", getUserId(), "history");


export const createGrocery = async (grocery: Partial<Grocery>) => {
  await addDoc(groceriesRef(), {
    ...grocery,
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
};

export const getGroceryById = async (id: string): Promise<Grocery | null> => {
  const ref = groceryDoc(id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as Omit<Grocery, "id">),
  };
};

export const updateGrocery = async (id: string, grocery: Partial<Grocery>) => {
  const ref = groceryDoc(id); 
  await updateDoc(ref, {
    ...grocery,
    updatedAt: Date.now(),
  });
};

export const deleteGrocery = async (id: string) => {
  const ref = groceryDoc(id); 
  console.log("Deleting grocery with id:", id);
  try {
    await deleteDoc(ref);
    console.log("Successfully deleted:", id);
  } catch (err) {
    console.error("Delete failed:", err);
    throw err;
  }
};

export const toggleGroceryComplete = async (
  id: string,
  completed: boolean
) => {
  const ref = groceryDoc(id); 
  await updateDoc(ref, { completed });
};

export const moveToHistory = async (items: Grocery[]) => {
  for (const item of items) {
    const historyDocData = {
      ...item,
      movedAt: Date.now(),
    };
    await addDoc(historyRef(), historyDocData);
    if (item.id) await deleteDoc(groceryDoc(item.id));
  }
};
