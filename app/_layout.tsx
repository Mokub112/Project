import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// ป้องกันไม่ให้ SplashScreen ปิดตัวเองก่อนฟอนต์โหลดเสร็จ
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // 1. โหลดฟอนต์ระบบ
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 2. ดักตรวจจับกรณีฟอนต์มีปัญหา หรือโหลดเสร็จแล้วให้ซ่อน SplashScreen
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // ถ้าฟอนต์ยังโหลดไม่เสร็จ ให้โชว์ตัวหมุนโหลดดิ้งรอไว้ก่อน
  if (!loaded) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#004368" />
      </View>
    );
  }

  // 3. แสดงโครงสร้างหลักของแอป (ครอบด้วย GestureHandler เพื่อป้องกันแอปเอ๋อ)
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC'
  }
});