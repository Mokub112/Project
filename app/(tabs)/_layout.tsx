import React, { useEffect, useState } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { StyleSheet, View, Text, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  // 🛡️ ระบบ Guard ตรวจสอบสิทธิ์การเข้าใช้งานหน้าหลัก
  useEffect(() => {
    async function checkAuth() {
      try {
        const userSession = await AsyncStorage.getItem('user_session');
        if (!userSession || userSession !== 'authenticated') {
          router.replace('/login');
        } else {
          setIsReady(true); 
        }
      } catch (err) {
        router.replace('/login');
      }
    }
    checkAuth();
  }, [pathname]); 

  // 🎯 ปรับ Route เส้นทางเทียบฐานเพื่อให้จับตำแหน่งการกดลิงก์ได้แม่นยำ
  const tabs = [
    { id: 'index', route: '/', label: 'หน้าหลัก', activeIcon: 'home' as const, inactiveIcon: 'home-outline' as const },
    { id: 'report', route: '/report', label: 'รายงาน', activeIcon: 'document-text' as const, inactiveIcon: 'document-text-outline' as const },
    { id: 'video', route: '/video', label: 'วิดีโอ', activeIcon: 'play' as const, inactiveIcon: 'play-outline' as const },
    { id: 'menu', route: '/menu', label: 'เมนู', activeIcon: 'grid' as const, inactiveIcon: 'grid-outline' as const },
  ];

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#004368" />
      </View>
    );
  }

  return (
    <View style={styles.masterContainer}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // ซ่อนแถบเดิมของระบบ
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="report" />
        <Tabs.Screen name="video" />
        <Tabs.Screen name="menu" />
      </Tabs>

      {/* 🌟 2. แผงแคปซูลลอย Custom แท็บ */}
      <View style={styles.floatingTabBar}>
        {tabs.map((tab) => {
          // 💡 แก้ไขเงื่อนไขการเช็กโฟกัสใหม่: เทียบตรงๆ หรือใช้ตรวจสอบเส้นทางย่อยเพื่อให้ปุ่มสว่างตามจริง
          const isFocused = pathname === tab.route || (tab.route !== '/' && pathname.startsWith(tab.route));

          return (
            <TouchableOpacity
              key={tab.id}
              // เปลี่ยนมาใช้ router.push หรือสลับสล็อตผ่านแท็บของ expo-router โดยตรง
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