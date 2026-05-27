import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface MyBottomSheetProps {
  children: React.ReactNode;
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function MyBottomSheet({ children, title, isOpen, onClose }: MyBottomSheetProps) {
  // สร้าง Ref เพื่อควบคุม Bottom Sheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  // กำหนดจุดที่ Sheet จะหยุดได้ (Snap points) เป็นเปอร์เซ็นต์ของหน้าจอ
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // ฟังก์ชันสำหรับเปิด/ปิด Sheet (จำลอง Logic การทำงาน)
  // ในการใช้งานจริง มักจะใช้ Logic จากคอมโพเนนต์ภายนอกมาควบคุม
  
  return (
    // การใช้ @gorhom/bottom-sheet จำเป็นต้องครอบด้วย GestureHandlerRootView เสมอ
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 p-4 bg-gray-50">
        {/* เนื้อหาหลักของหน้าจออยู่ตรงนี้ */}
        <Text className="text-gray-600 text-sm">
          นี่คือเนื้อหาหลักของหน้าจอ...
        </Text>
      </View>

      {/* คอมโพเนนต์ Bottom Sheet ที่แท้จริง */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1} // เริ่มต้นแสดงผลที่ snapPoint ที่ 1 (50%)
        snapPoints={snapPoints}
        enablePanDownToClose={true} // อนุญาตให้รูดลงเพื่อปิด
        // ปรับแต่งหน้าตาของ handle (ขีดเล็ก ๆ ด้านบน)
        handleIndicatorStyle={{ backgroundColor: "#D1D5DB" }} // gray-300
      >
        <BottomSheetView className="flex-1 p-6">
          {title && (
            <Text className="text-lg font-bold text-gray-800 mb-4">{title}</Text>
          )}
          {/* เนื้อหาภายใน Bottom Sheet */}
          {children}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}