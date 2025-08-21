import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { TimeTrackingProvider } from '@/providers/TimeTrackingProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <TimeTrackingProvider>
      <NotificationProvider>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            gestureEnabled: Platform.OS === 'ios',
            animation: Platform.OS === 'ios' ? 'slide_from_right' : 'fade'
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="+not-found" />
        </Stack>
       <StatusBar style="light" translucent backgroundColor="transparent" />
      </NotificationProvider>
    </TimeTrackingProvider>
  );
}