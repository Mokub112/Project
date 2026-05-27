import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Svg, { Path, Ellipse, Polyline } from "react-native-svg";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as SecureStore from 'expo-secure-store';

export default function FaceScanPage() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<"scanning" | "success">("scanning");
  const [scanTop, setScanTop] = useState(20);
  const directionRef = useRef(1);

  // 🔄 แอนิเมชันจำลองเส้นเลเซอร์วิ่งขึ้น-ลงบนกล่องกล้อง
  useEffect(() => {
    if (status !== "scanning") return;
    
    const interval = setInterval(() => {
      setScanTop((prev) => {
        if (prev >= 220) {
          directionRef.current = -1;
          return 219;
        } else if (prev <= 20) {
          directionRef.current = 1;
          return 21;
        }
        return prev + directionRef.current * 4;
      });
    }, 20);
    
    return () => clearInterval(interval);
  }, [status]);

  // ⏱️ จำลองการสแกนใบหน้า 4 วินาทีแล้วเปลี่ยนเป็นหน้าสถานะสำเร็จ
  useEffect(() => {
    if (permission?.granted && status === "scanning") {
      const timer = setTimeout(() => setStatus("success"), 4000);
      return () => clearTimeout(timer);
    }
  }, [permission, status]);

  function handleStart() {
    localStorage.setItem('user_session', 'authenticated');
    router.replace("/(tabs)");
  }

  // กำลังโหลดสิทธิ์เข้าถึงกล้อง
  if (!permission) {
    return (
      <View style={styles.mainContainer}>
        <ActivityIndicator size="large" color="#2B5278" />
      </View>
    );
  }

  // ถ้าผู้ใช้ยังไม่อนุญาตให้เข้าถึงกล้อง
  if (!permission.granted) {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.contentCard}>
          <Text style={styles.deniedText}>
            แอปพลิเคชันจำเป็นต้องขอเข้าถึงกล้องหน้าเพื่อวิเคราะห์ความปลอดภัยในการขับขี่
          </Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>อนุญาตเปิดใช้งานกล้อง</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentCard}>
        {status === "scanning" ? (
          <View style={styles.centerFlex}>
            {/* กล่องเฟรมครอบดีไซน์กล้อง */}
            <View style={styles.cameraBoxFrame}>
              <CameraView facing="front" style={StyleSheet.absoluteFillObject} />
              <View style={styles.cameraOverlay} />

              {/* มาร์กเกอร์เหลี่ยมสี่มุม */}
              <View style={[styles.cornerMarker, { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 }]} />
              <View style={[styles.cornerMarker, { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 }]} />
              <View style={[styles.cornerMarker, { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 }]} />
              <View style={[styles.cornerMarker, { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 }]} />

              {/* ลายเส้นโครงสร้างใบหน้า */}
              <View style={styles.faceLineWrapper}>
                <Svg width="130" height="130" viewBox="0 0 130 130" fill="none">
                  <Ellipse cx="65" cy="60" rx="42" ry="48" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 3"/>
                  <Ellipse cx="48" cy="52" rx="7" ry="5" stroke="#FFFFFF" strokeWidth="1.5"/>
                  <Ellipse cx="82" cy="52" rx="7" ry="5" stroke="#FFFFFF" strokeWidth="1.5"/>
                  <Path d="M65 60 L60 74 Q65 78 70 74 Z" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
                  <Path d="M50 86 Q65 96 80 86" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </Svg>
              </View>

              {/* เส้นสแกนวิ่งขึ้นลง */}
              <View style={[styles.scanLine, { top: scanTop }]} />
            </View>

            <Text style={styles.scanningTitle}>กำลังสแกนใบหน้าเพื่อความปลอดภัย...</Text>
            <View style={styles.instructionWrapper}>
              <Text style={styles.instructionText}>• จัดตำแหน่งใบหน้าให้อยู่ภายในกรอบสี่เหลี่ยม</Text>
              <Text style={styles.instructionText}>• แนะนำถอดหมวกหรือแว่นตาดำชั่วคราว</Text>
              <Text style={styles.instructionText}>• หันหน้าตรงมองกล้องนิ่งๆ ค้างไว้สักครู่</Text>
            </View>
          </View>
        ) : (
          <View style={styles.centerFlex}>
            {/* วงกลมเครื่องหมายติ๊กถูกเมื่อสแกนผ่าน */}
            <View style={styles.successBadgeCircle}>
              <Svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <Polyline points="20 6 9 17 4 12"/>
              </Svg>
            </View>

            <Text style={styles.successTitle}>สแกนใบหน้าสำเร็จ</Text>
            <Text style={styles.successSubtitle}>ระบบพิสูจน์อัตลักษณ์เสร็จสิ้น พร้อมออกเดินทางอย่างปลอดภัย</Text>

            <TouchableOpacity onPress={handleStart} activeOpacity={0.8} style={styles.startAppButton}>
              <Text style={styles.startAppButtonText}>เริ่มต้นเข้าสู่แอปพลิเคชัน</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  contentCard: {
    width: "100%",
    maxWidth: 400,
    minHeight: 480,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  centerFlex: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  deniedText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#2B5278",
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cameraBoxFrame: {
    position: "relative",
    width: 240,
    height: 240,
    marginBottom: 32,
    backgroundColor: "#000000",
    borderRadius: 24,
    overflow: "hidden",
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(43, 82, 120, 0.08)",
  },
  cornerMarker: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "rgba(255, 255, 255, 0.85)",
  },
  faceLineWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.65,
  },
  scanLine: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 3,
    backgroundColor: "#3B82F6",
    borderRadius: 2,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  scanningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2332",
    marginBottom: 12,
    textAlign: "center",
  },
  instructionWrapper: {
    flexDirection: "column",
    gap: 6,
  },
  instructionText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  successBadgeCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#2B5278",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A2332",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 36,
    textAlign: "center",
    lineHeight: 20,
  },
  startAppButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#2B5278",
    alignItems: "center",
    justifyContent: "center",
  },
  startAppButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});