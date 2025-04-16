import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import "../global.css";
import { TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { initFFmpeg } from '@/services/videoProcessor';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const router = useRouter();
  const themeColors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    // Initialize FFmpeg when the layout mounts
    initFFmpeg().catch(err => {
      console.error("Root FFmpeg init failed:", err);
      // Don't throw here, just log the error
      // This allows the app to continue even if FFmpeg fails to initialize
    });

    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Main Screen */}
        <Stack.Screen
          name="index"
          options={{
            headerTitleAlign: 'center',
            title: 'V I D I A R Y',
            headerTitleStyle: {
              fontFamily: 'SpaceMono',
              fontSize: 20,
            },
            headerStyle: {
              backgroundColor: themeColors.background,
            },
            headerTintColor: themeColors.text,
          }}
        />

        {/* Video Screens */}
        <Stack.Screen name="video/[id]" options={{ title: 'Video Details' }} />
        <Stack.Screen name="video/edit/[id]" options={{ title: 'Edit Video' }} />

        {/* Crop Modal Screens */}
        <Stack.Screen
          name="modal/crop/index"
          options={{
            presentation: 'modal',
            title: 'Select Video',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <IconSymbol name="xmark" size={22} color={themeColors.tint} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="modal/crop/crop"
          options={{
            presentation: 'modal',
            title: 'Crop Video (5s)',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <IconSymbol name="chevron.left" size={22} color={themeColors.tint} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="modal/crop/metadata"
          options={{
            presentation: 'modal',
            title: 'Add Details',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <IconSymbol name="chevron.left" size={22} color={themeColors.tint} />
              </TouchableOpacity>
            ),
          }}
        />

        {/* Not Found Screen */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default RootLayout;