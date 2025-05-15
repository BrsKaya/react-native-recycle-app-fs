import { Stack } from 'expo-router';
import {useAuthStore} from "../../../store/authStore"
import { useEffect } from "react";

export default function EventsLayout() {

  const {checkAuth, user, token}= useAuthStore()

  useEffect(() => {
    checkAuth();
  }, [])
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}