import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (isSignedIn) {
    return <Redirect href={"/(tabs)"} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
