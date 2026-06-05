import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";

interface MyBottomSheetProps {
  children: React.ReactNode;
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function MyBottomSheet({ children, title, isOpen = false, onClose }: MyBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  // กำหนดจุดหยุดของแผ่นสไลด์ (25% สถิติตอนขับรถ, 50% รายละเอียด, 90% เต็มจอ)
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // 🎯 ดักฟังค่า isOpen จากหน้าจอหลัก ถ้ามีการเปลี่ยนค่า ให้แผ่นขยับขึ้น/ลง ตามสั่งทันที
  useEffect(() => {
    if (!bottomSheetRef.current) return;

    if (isOpen) {
      bottomSheetRef.current.snapToIndex(1); // เปิดขึ้นมาค้างไว้ที่ระดับกลาง (50%)
    } else {
      bottomSheetRef.current.close(); // สั่งรูดเก็บปิดลงไปด้านล่าง
    }
  }, [isOpen]);

  // ฟังก์ชันจัดการตอนที่ผู้ใช้ใช้นิ้วปัดแผ่นสไลด์ลงจนปิดเอง
  const handleSheetChanges = (index: number) => {
    if (index === -1 && onClose) {
      onClose(); // ส่งสัญญาณกลับไปบอกหน้าหลักว่าแผ่นปิดแล้วนะ
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isOpen ? 1 : -1} // -1 คือซ่อนแผ่นสไลด์ไว้ใต้จอตอนเริ่มต้น
      snapPoints={snapPoints}
      enablePanDownToClose={true} // อนุญาตให้รูดลงเพื่อปิด
      onChange={handleSheetChanges}
      handleIndicatorStyle={{ backgroundColor: "#D1D5DB" }} // ตัวขีดจับรูดด้านบน
      // 🌟 เพิ่ม Backdrop เพื่อเวลาเปิดแผ่นขึ้นมาเต็มจอ จะมีฉากสีดำจางๆ ช่วยดันให้แผ่นเด่นขึ้น
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.3} />
      )}
    >
      <BottomSheetView style={styles.sheetContent}>
        {title && (
          <Text style={styles.sheetTitleText}>{title}</Text>
        )}
        {/* นำเนื้อหาจากหน้าหลักมาแสดงผลข้างในแผ่นสไลด์นี้ */}
        <View style={styles.childrenWrapper}>
          {children}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sheetTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  childrenWrapper: {
    flex: 1,
  }
});