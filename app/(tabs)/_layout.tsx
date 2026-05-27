import { Tabs, useRouter, usePathname } from 'expo-router';
import { StyleSheet, View, Text, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const router = useRouter();
  
  // 💡 เปลี่ยนมาใช้ usePathname เช็กเส้นทางจาก URL ตรงๆ แม่นยำที่สุดในสามโลกครับพี่
  const pathname = usePathname();

  // 🎯 ลิสต์รายชื่อแท็บและแมพเส้นทางให้ตรงตามตำแหน่งไฟล์จริงของพี่
  const tabs = [
    { id: 'index', route: '/', label: 'หน้าหลัก', activeIcon: 'home' as const, inactiveIcon: 'home-outline' as const },
    { id: 'report', route: '/report', label: 'รายงาน', activeIcon: 'document-text' as const, inactiveIcon: 'document-text-outline' as const },
    { id: 'video', route: '/video', label: 'วิดีโอ', activeIcon: 'play' as const, inactiveIcon: 'play-outline' as const },
    { id: 'menu', route: '/menu', label: 'เมนู', activeIcon: 'grid' as const, inactiveIcon: 'grid-outline' as const },
  ];

  return (
    <View style={styles.masterContainer}>
      {/* 1. คอนโทรลเลอร์คุมหน้าจอหลักของ Expo Router (ซ่อนแถบเก่าทิ้ง 100%) */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, 
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="report" />
        <Tabs.Screen name="video" />
        <Tabs.Screen name="menu" />
      </Tabs>

      {/* 🌟 2. แผงแคปซูลลอย Custom ตัวจบ สัดส่วนเป๊ะ ไม่โดนบีบเบี้ยว */}
      <View style={styles.floatingTabBar}>
        {tabs.map((tab) => {
          // 💡 เช็กสถานะโฟกัสตรงๆ จากเส้นทาง Pathname ชัวร์ที่สุด ไม่มีเด้งกลับมั่วซั่ว
          const isFocused = pathname === tab.route;

          return (
            <TouchableOpacity
              key={tab.id}
              // ใช้ router.navigate เพื่อสลับหน้าภายในชุด Tabs อย่างนุ่มนวล
              onPress={() => router.navigate(tab.route)}
              activeOpacity={0.85}
              style={styles.tabButton}
            >
              {isFocused ? (
                // ✨ ตอนเลือกแท็บ: ขยายร่างเป็นแคปซูลสีฟ้าพาสเทลสวยงาม ตัวหนังสือไม่แหว่ง
                <View style={styles.activeCapsule}>
                  <View style={styles.activeIconCircle}>
                    <Ionicons name={tab.activeIcon} size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.activeText} numberOfLines={1}>
                    {tab.label}
                  </Text>
                </View>
              ) : (
                // 💤 ตอนไม่ได้เลือก: โชว์ไอคอนเส้นขอบเทาเรียบๆ จัดวางกึ่งกลางช่องพอดี
                <Ionicons name={tab.inactiveIcon} size={24} color="#64748B" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// 🎨 สไตล์แบบลอยพรีเมียม สัดส่วนเป๊ะไม่มีการดึงกันพัง
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
    backgroundColor: '#A2B9CE', // สีฟ้าพาสเทลตามดีไซน์เป๊ะๆ
    borderRadius: 24,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 16,
    gap: 8,
    minWidth: 102, // กันฟอนต์โดนบีบแหว่ง
    justifyContent: 'center',
  },
  activeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#528AAE', // วงกลมน้ำเงินฟ้าเข้มล้อมไอคอนด้านใน
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '600',
  },
});