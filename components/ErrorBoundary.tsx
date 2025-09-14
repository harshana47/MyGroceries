import React from "react";
import { Text, View } from "react-native";

type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, message: String(error?.message || error) };
  }

  componentDidCatch(error: any, info: any) {
    console.error("App error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0b1220",
            padding: 16,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              fontSize: 18,
              marginBottom: 8,
            }}
          >
            Something went wrong
          </Text>
          <Text style={{ color: "#cbd5e1", textAlign: "center" }}>
            {this.state.message}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
