import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../constants/Colors";

function RootLayoutNav() {
  const { user, isLoading, isFirstLaunch } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Only proceed when both auth state and storage state are derived
    if (isLoading || isFirstLaunch === null) return;

    if (isFirstLaunch) {
      if (segments[0] !== "onboarding") {
        router.replace("/onboarding" as any);
      }
    } else if (!user) {
      // If not logged in and not first launch, redirect AuthScreen
      if (segments[0] !== "(auth)" && segments[0] !== "AuthScreen") {
        router.replace("/AuthScreen" as any);
      }
    } else if (user) {
      // If logged in and NOT in tabs, redirect to the home screen in tabs
      if (segments[0] !== "(tabs)") {
        router.replace("/(tabs)/home" as any);
      }
    }
  }, [user, isLoading, segments, isFirstLaunch, router]);

  if (isLoading || isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
