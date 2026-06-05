import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 🚀 นำเข้า AsyncStorage เพื่อเคลียร์สิทธิ์ความปลอดภัยให้ตรงกับหน้า Login

const { width } = Dimensions.get("window");

// ============================================================
// ICONS (แปลงเป็น React Native SVG เรียบร้อย)
// ============================================================

function CameraIcon() {
  return (
    <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2B5278" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <Circle cx="12" cy="13" r="4"/>
    </Svg>
  );
}

function GPSIcon() {
  return (
    <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2B5278" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <Circle cx="12" cy="10" r="3"/>
    </Svg>
  );
}

function SensorIcon() {
  return (
    <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2B5278" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <Path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <Path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <Circle cx="12" cy="20" r="1" fill="#2B5278"/>
    </Svg>
  );
}

const permissions = [
  {
    icon: <CameraIcon />,
    title: "Camera",
    description: "ใช้ในการเข้าถึงข้อมูลรูปภาพ/วิดีโอ เพื่อระบบ AI ตรวจจับใบหน้า",
  },
  {
    icon: <GPSIcon />,
    title: "GPS",
    description: "บันทึกเส้นทาง จุดเสี่ยง และคำนวณตำแหน่งแสดงจุดพักรถ",
  },
  {
    icon: <SensorIcon />,
    title: "Sensors",
    description: "ใช้ร่วมกับ GPS เพื่อคำนวณทิศทางหรือตรวจจับแรงกระแทกอุบัติเหตุ",
  },
];

export default function PermissionsPage() {
  const router = useRouter();

  // 🟢 ฟังก์ชันเมื่อผู้ใช้กดอนุญาตสิทธิ์
  async function handleAllow() {
    try {
      // 🛡️ ปั๊ม Session ความปลอดภัยลงตัวเครื่อง เพื่อแจ้งให้โครงสร้างแอปหลักรู้ว่าผู้ใช้มีสิทธิ์เข้าถึงแล้ว ไม่ดีดกลับหน้า login
      await AsyncStorage.setItem("user_session", "authenticated");
      router.replace("/camera"); // มุ่งหน้าสู่โฟลเดอร์เปิดกล้องสแกนใบหน้า
    } catch (error) {
      console.error("AsyncStorage Error: ", error);
      router.replace("/camera");
    }
  }

  // 🔴 ฟังก์ชันเมื่อผู้ใช้กดปฏิเสธสิทธิ์
  async function handleDeny() {
    try {
      // เคลียร์ค่า Session ออกเพื่อความปลอดภัยเมื่อถูกปฏิเสธเข้าใช้งานอุปกรณ์
      await AsyncStorage.removeItem("user_session");
      router.replace("/login");
    } catch (error) {
      router.replace("/login");
    }
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer} 
      style={styles.mainContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cardContainer}>

        {/* บล็อกจัดวางโลโก้ผสมผสานด้านบน */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            {/* กล้องตรงกลาง */}
            <View style={styles.absoluteIcon}>
              <Svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#2B5278" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <Circle cx="12" cy="13" r="4"/>
              </Svg>
            </View>
            {/* GPS มุมขวาบน */}
            <View style={[styles.absoluteIcon, { top: 16, right: 16 }]}>
              <Svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2B5278" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <Circle cx="12" cy="10" r="3"/>
              </Svg>
            </View>
            {/* Sensor มุมล่าง */}
            <View style={[styles.absoluteIcon, { bottom: 16 }]}>
              <Svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2B5278" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                <Path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                <Path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                <Circle cx="12" cy="20" r="1" fill="#2B5278"/>
              </Svg>
            </View>
          </View>
        </View>

        {/* ส่วนข้อมูลหัวข้อข้อความ */}
        <Text style={styles.titleText}>
          ขออนุญาตเข้าถึงเพื่อความปลอดภัย
        </Text>
        <Text style={styles.subtitleText}>
          เพื่อให้ระบบเฝ้าระวังและแจ้งเตือนอุบัติเหตุทำงานได้เต็มประสิทธิภาพ กรุณาอนุญาตการเข้าถึงข้อมูลระบบ
        </Text>

        {/* รายการแสดงแถบรายการข้อมูลแต่ละสิทธิ์ (Permissions List) */}
        <View style={styles.listContainer}>
          {permissions.map(({ icon, title, description }) => (
            <View key={title} style={styles.listItem}>
              <View style={styles.iconContainer}>
                {icon}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>{title}</Text>
                <Text style={styles.itemDescription}>{description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ชุดปุ่มกดดำเนินการควบคุม */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleAllow}
            activeOpacity={0.8}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>อนุญาตการเข้าถึง</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleDeny}
            activeOpacity={0.8}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>ไม่อนุญาตการเข้าถึง</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

// ============================================================
// STYLESHEET 
// ============================================================

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    paddingTop: 48,
    alignItems: "center",
  },
  cardContainer: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: "#EAF2FB",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  absoluteIcon: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A2332",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  listContainer: {
    flexDirection: "column",
    gap: 20,
    marginBottom: 32,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EAF2FB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A2332",
  },
  itemDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 16,
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#2B5278",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
});