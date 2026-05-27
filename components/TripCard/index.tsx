import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface TripCardProps {
  date: string;
  distance: string;
  duration: string;
  score: number;
  onPress?: () => void;
}

export default function TripCard({ date, distance, duration, score, onPress }: TripCardProps) {
  return (
    // เปลี่ยนจากปุ่มกดเป็น TouchableOpacity สำหรับประสบการณ์ Native ที่แท้จริง
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white p-5 rounded-3xl border border-gray-100 mb-3 shadow-sm mx-1"
    >
      {/* Header ของการ์ด */}
      <View className="flex-row justify-between items-center mb-3 border-b border-gray-50 pb-3">
        <Text className="text-sm font-semibold text-gray-700">{date}</Text>
        
        {/* ส่วนแสดงคะแนนเป็นสีเขียว */}
        <View className="bg-green-50 px-3 py-1 rounded-full">
          <Text className="text-xs font-bold text-green-600">{score} คะแนน</Text>
        </View>
      </View>

      {/* ข้อมูลระยะทางและเวลา */}
      <View className="flex-row justify-between">
        <View className="flex-1">
          <Text className="text-xs text-gray-400">ระยะทาง</Text>
          <Text className="text-base font-semibold text-gray-800 mt-1">{distance}</Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-xs text-gray-400">เวลาที่ใช้</Text>
          <Text className="text-base font-semibold text-gray-800 mt-1">{duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}