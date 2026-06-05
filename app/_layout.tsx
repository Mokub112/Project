import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';

// สั่งคงหน้า Splash Screen ไว้ก่อนจนกว่าฟอนต์จะโหลดเสร็จ
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // โหลดฟอนต์ระบบตัวเริ่มต้น
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // ตรวจสอบสถานะการดาวน์โหลดฟอนต์
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      setIsAuthChecked(true); // ปลดล็อกหน้าโหลดดิ้งเมื่อระบบพร้อม
    }
  }, [loaded, error]);

  // ระหว่างที่ฟอนต์ยังโหลดไม่เสร็จ ให้แสดงหน้าหมุนโหลดดิ้งคลีน ๆ รอไว้ก่อน
  if (!loaded || !isAuthChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' }}>
        <ActivityIndicator size="large" color="#004368" />
      </View>
    );
  }

  // เมื่อระบบสัมผัสและฟอนต์พร้อม เรนเดอร์โครงสร้างแอปพลิเคชันหลัก
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}