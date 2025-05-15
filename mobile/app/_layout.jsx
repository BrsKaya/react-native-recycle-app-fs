import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import {useAuthStore} from "../store/authStore"
import { useEffect } from "react";
import { useFonts, Lobster_400Regular } from '@expo-google-fonts/lobster';


export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const {checkAuth, user, token, checkOnboarding, hasSeenOnboarding} = useAuthStore()

  useEffect(() => {
    checkAuth();
    checkOnboarding();
  }, [])

  //handle navigation based on the auth state
  useEffect(() => {
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!hasSeenOnboarding) {
      router.replace("/(auth)/onboarding");
    } else if(!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)");
    } else if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [user, token, segments, hasSeenOnboarding])

  

  return (
  <SafeAreaProvider>
    <SafeScreen>
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name = "(tabs)"/>
      <Stack.Screen name = "(auth)"/>
    </Stack>
    </SafeScreen>
    <StatusBar style= "dark" />
  </SafeAreaProvider>
  ) ;
}
