import { db } from "@/firebase";
import { Grocery } from "@/types/grocery";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    updateDoc
} from "firebase/firestore";

export const groceriesRef = collection(db, "groceries")
export const historyRef = collection(db, "history");

// Create
export const createGrocery = async (grocery: Partial<Grocery>) => {
  await addDoc(groceriesRef, {
    ...grocery,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
}

// Read
export const getGroceryById = async (id: string): Promise<Grocery | null> => {
  const ref = doc(db, "groceries", id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null

  return {
    id: snap.id,
    ...(snap.data() as Omit<Grocery, "id">),
  }
}

// Update
export const updateGrocery = async (id: string, grocery: Partial<Grocery>) => {
  const ref = doc(db, "groceries", id)
  await updateDoc(ref, {
    ...grocery,
    updatedAt: Date.now(),
  })
}


export const deleteGrocery = async (id: string) => {
  const docRef = doc(db, "groceries", id);
  console.log("Deleting grocery with id:", id);
  try {
    await deleteDoc(docRef);
    console.log("Successfully deleted:", id);
  } catch (err) {
    console.error("Delete failed:", err);
    throw err;
  }
};

// Toggle complete
export const toggleGroceryComplete = async (id: string, completed: boolean) => {
  const ref = doc(db, "groceries", id);
  await updateDoc(ref, { completed });
};

export const moveToHistory = async (items: Grocery[]) => {
  for (const item of items) {
    const historyDoc = {
      ...item,
      movedAt: Date.now(),
    };
    // Create under history collection
    await addDoc(historyRef, historyDoc);
    // Delete from groceries
    if (item.id) await deleteDoc(doc(db, "groceries", item.id));
  }
};