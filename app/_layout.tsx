import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { LoaderProvider } from "@/context/LoaderContext";
import { Slot } from "expo-router";
import React from "react";
import "react-native-gesture-handler";
import "react-native-reanimated";
import "./../global.css";

const RootLayout = () => {
  return (
    <LoaderProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Slot />
        </ErrorBoundary>
      </AuthProvider>
    </LoaderProvider>
  );
};

export default RootLayout;
