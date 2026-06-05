import React, { useEffect, useState } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { StyleSheet, View, Text, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 🚀 นำเข้าเพื่อตรวจสถานะล็อกอินก่อนยอมให้แสดงหน้าเมนูหลัก

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  // 🛡️ ระบบ Guard ป้องกันลักไก่: ตรวจสอบสิทธิ์ตั้งแต่ก้าวแรกที่เข้าสู่โซนหน้าหลัก
  useEffect(() => {
    async function checkAuth() {
      try {
        const userSession = await AsyncStorage.getItem('user_session');
        // ⚠️ หากพบว่าไม่มีสถานะเซสชัน หรือล็อกเอาต์ไปแล้ว ให้ดีดกลับไปหน้าล็อกอินทันที ไม่ยอมให้จอดค้างที่หน้าหลัก
        if (!userSession || userSession !== 'authenticated') {
          router.replace('/login');
        } else {
          setIsReady(true); // ปลดล็อกให้แสดงผล UI เมนูด้านล่างอย่างปลอดภัย
        }
      } catch (err) {
        router.replace('/login');
      }
    }
    checkAuth();
  }, [pathname]); // 💡 คอยตรวจจับทุกครั้งที่มีการเปลี่ยนหน้าพยายามย้าย Route

  // 🎯 ปรับปรุงเส้นทาง (Route) ให้สอดคล้องกับกลุ่มโฟลเดอร์ (tabs) เพื่อให้ระบบจดจำโฟกัสแม่นยำ
  const tabs = [
    { id: 'index', route: '/(tabs)', label: 'หน้าหลัก', activeIcon: 'home' as const, inactiveIcon: 'home-outline' as const },
    { id: 'report', route: '/(tabs)/report', label: 'รายงาน', activeIcon: 'document-text' as const, inactiveIcon: 'document-text-outline' as const },
    { id: 'video', route: '/(tabs)/video', label: 'วิดีโอ', activeIcon: 'play' as const, inactiveIcon: 'play-outline' as const },
    { id: 'menu', route: '/(tabs)/menu', label: 'เมนู', activeIcon: 'grid' as const, inactiveIcon: 'grid-outline' as const },
  ];

  // ระหว่างที่ระบบ Guard กำลังคุ้ยหา Token ในเครื่อง ให้ขึ้น Loading สวยๆ บังหน้าจอหลักไว้ก่อน
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#004368" />
      </View>
    );
  }

  return (
    <View style={styles.masterContainer}>
      {/* 1. คอนโทรลเลอร์คุมหน้าจอหลักของ Expo Router */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // ซ่อนแถบดีไซน์ดั้งเดิมของระบบ
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="report" />
        <Tabs.Screen name="video" />
        <Tabs.Screen name="menu" />
      </Tabs>

      {/* 🌟 2. แผงแคปซูลลอย Custom ตัวจบ */}
      <View style={styles.floatingTabBar}>
        {tabs.map((tab) => {
          // 💡 เช็กสถานะโฟกัสผ่านรูปแบบ Absolute Group Route เพื่อป้องกันอาการปุ่มเบิ้ลหรือไอคอนไม่สว่าง
          const isFocused = pathname === tab.route || (tab.route === '/(tabs)' && pathname === '/');

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => router.navigate(tab.route as any)}
              activeOpacity={0.85}
              style={styles.tabButton}
            >
              {isFocused ? (
                <View style={styles.activeCapsule}>
                  <View style={styles.activeIconCircle}>
                    <Ionicons name={tab.activeIcon} size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.activeText} numberOfLines={1}>
                    {tab.label}
                  </Text>
                </View>
              ) : (
                <Ionicons name={tab.inactiveIcon} size={24} color="#64748B" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  floatingTabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A2B9CE', 
    borderRadius: 24,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 16,
    gap: 8,
    minWidth: 102, 
    justifyContent: 'center',
  },
  activeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#528AAE', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '600',
  },
});