import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export default function CalendarSlider() {
  const [selectedDate, setSelectedDate] = useState(3); // สมมติวันที่ 3 เป็นค่าเริ่มต้น

  // สร้างข้อมูลจำลองสำหรับวันที่ 1-7
  const dates = Array.from({ length: 7 }, (_, i) => ({
    dayName: ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."][i],
    dateNumber: i + 1,
  }));

  return (
    // เปลี่ยนจากการวนลูป div เป็น ScrollView แนวดอน เพื่อให้เลื่อนได้
    <ScrollView 
      horizontal={true} 
      showsHorizontalScrollIndicator={false} 
      className="flex-row gap-3 py-2 px-1 mb-4"
    >
      {dates.map(({ dayName, dateNumber }) => {
        const isSelected = selectedDate === dateNumber;
        return (
          // เปลี่ยนปุ่มกดเป็น TouchableOpacity
          <TouchableOpacity
            key={dateNumber}
            onPress={() => setSelectedDate(dateNumber)}
            className={`items-center justify-center w-12 h-16 rounded-2xl ${
              isSelected ? "bg-[#2B5278]" : "bg-white"
            } shadow-sm border ${isSelected ? "border-[#2B5278]" : "border-gray-100"}`}
          >
            <Text
              className={`text-xs ${
                isSelected ? "text-white font-medium" : "text-gray-400"
              }`}
            >
              {dayName}
            }
            </Text>
            <Text
              className={`text-xl mt-1 font-bold ${
                isSelected ? "text-white" : "text-gray-800"
              }`}
            >
              {dateNumber}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}