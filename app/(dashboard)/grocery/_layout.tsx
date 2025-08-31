// app/dashboard/grocery/_layout.tsx
import { Stack } from "expo-router";

export default function GroceryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
