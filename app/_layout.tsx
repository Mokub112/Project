import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';

export {
  ErrorBoundary,
} from 'expo-router';

// 💡 จุดที่ 1: แก้จาก 'login' เป็น 'login/index'
export const unstable_settings = {
  initialRouteName: 'login/index', 
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 💡 จุดที่ 2: แก้ตรง name จาก "login" เป็น "login/index" */}
        <Stack.Screen name="login/index" options={{ headerShown: false }} />
        <Stack.Screen name="permissions/index" options={{ headerShown: false }} />
        <Stack.Screen name="camera/index" options={{ headerShown: false }} />
        
        {/* กลุ่มหน้าหลักเมื่อสแกนผ่านหมดแล้ว */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}