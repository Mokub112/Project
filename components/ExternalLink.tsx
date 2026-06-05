import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 🌟 เพิ่มไอคอนยกระดับความสวยงาม

interface TripCardProps {
  date: string;
  distance: string;
  duration: string;
  score: number;
  onPress?: () => void;
}

export default function TripCard({ date, distance, duration, score, onPress }: TripCardProps) {
  
  // 🎯คำนวณสไตล์และสีของป้ายคะแนน (Badge) อัตโนมัติให้สอดคล้องกับ CircularScore
  const getScoreStyle = (currentScore: number) => {
    if (currentScore >= 80) {
      return { bg: "bg-green-50", text: "text-green-600", border: "border-green-100" };
    } else if (currentScore >= 50) {
      return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" };
    } else {
      return { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" };
    }
  };

  const badgeStyle = getScoreStyle(score);

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white p-5 rounded-3xl border border-gray-100 mb-3 shadow-sm mx-1"
    >
      {/* Header ของการ์ด (ส่วนวันที่ และคะแนนหลากสี) */}
      <View style={{ flexDirection: 'row', justifyContent: 'between', alignItems: 'center' }} className="flex-row justify-between items-center mb-3 border-b border-gray-50 pb-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text className="text-sm font-semibold text-gray-600">{date}</Text>
        </View>
        
        {/* เปลี่ยนสีตามคะแนนจริงอัตโนมัติ */}
        <View className={`${badgeStyle.bg} ${badgeStyle.border} border px-3 py-1 rounded-full`}>
          <Text className={`text-xs font-bold ${badgeStyle.text}`}>{score} คะแนน</Text>
        </View>
      </View>

      {/* ข้อมูลระยะทาง เวลา และปุ่มนำทางไปดูผลลัพธ์ */}
      <View className="flex-row justify-between items-center">
        {/* ระยะทาง */}
        <View className="flex-1">
          <Text className="text-xs text-gray-400 font-medium">ระยะทาง</Text>
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons name="navigate-outline" size={14} color="#4B5563" />
            <Text className="text-base font-bold text-gray-800">{distance}</Text>
          </View>
        </View>
        
        {/* เวลาที่ใช้ */}
        <View className="flex-1 items-center">
          <Text className="text-xs text-gray-400 font-medium">เวลาที่ใช้</Text>
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons name="time-outline" size={14} color="#4B5563" />
            <Text className="text-base font-bold text-gray-800">{duration}</Text>
          </View>
        </View>

        {/* 🌟 ไอคอนลูกศรชี้บอกใบ้ให้กดดูหน้า DrivingResultPage */}
        <View className="pl-2">
          <View className="w-8 height-8 rounded-full bg-gray-50 items-center justify-center border border-gray-100">
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}