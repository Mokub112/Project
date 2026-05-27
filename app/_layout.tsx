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

// 💡 แก้ไข: บังคับให้หน้าเริ่มต้นของระบบรากวิ่งไปหาหน้าระบบลงชื่อเข้าใช้ (login) ก่อนเสมอ
export const unstable_settings = {
  initialRouteName: 'login', 
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
        {/* 💡 แก้ไข: ประกาศลงทะเบียนหน้าต่างๆ ที่อยู่นอกกลุ่ม tabs ให้ตัวนำทาง (Stack) รู้จักให้ครบถ้วน */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="permissions/index" options={{ headerShown: false }} />
        <Stack.Screen name="camera/index" options={{ headerShown: false }} />
        
        {/* กลุ่มหน้าหลักเมื่อสแกนผ่านหมดแล้ว */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}