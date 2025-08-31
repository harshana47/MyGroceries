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

// 🔑 Helper to get current user id
const getUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");
  return user.uid;
};

// References
export const groceriesRef = () =>
  collection(db, "users", getUserId(), "groceries");

export const groceryDoc = (id: string) =>
  doc(db, "users", getUserId(), "groceries", id);

export const historyRef = () =>
  collection(db, "users", getUserId(), "history");

// ---------------- CRUD ----------------

// Create
export const createGrocery = async (grocery: Partial<Grocery>) => {
  await addDoc(groceriesRef(), {
    ...grocery,
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
};

// Read single
export const getGroceryById = async (id: string): Promise<Grocery | null> => {
  const ref = groceryDoc(id); // ✅ user-specific
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as Omit<Grocery, "id">),
  };
};

// Update
export const updateGrocery = async (id: string, grocery: Partial<Grocery>) => {
  const ref = groceryDoc(id); // ✅ user-specific
  await updateDoc(ref, {
    ...grocery,
    updatedAt: Date.now(),
  });
};

// Delete
export const deleteGrocery = async (id: string) => {
  const ref = groceryDoc(id); // ✅ user-specific
  console.log("Deleting grocery with id:", id);
  try {
    await deleteDoc(ref);
    console.log("Successfully deleted:", id);
  } catch (err) {
    console.error("Delete failed:", err);
    throw err;
  }
};

// Toggle complete
export const toggleGroceryComplete = async (
  id: string,
  completed: boolean
) => {
  const ref = groceryDoc(id); // ✅ user-specific
  await updateDoc(ref, { completed });
};

// Move items to history
export const moveToHistory = async (items: Grocery[]) => {
  for (const item of items) {
    const historyDocData = {
      ...item,
      movedAt: Date.now(),
    };
    await addDoc(historyRef(), historyDocData); // ✅ save under user’s history
    if (item.id) await deleteDoc(groceryDoc(item.id)); // ✅ remove from user’s groceries
  }
};
