import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircularScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function CircularScore({ score, size = 120, strokeWidth = 10 }: CircularScoreProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (circumference * score) / 100;
  const scoreColor = score >= 80 ? "#16A34A" : score >= 50 ? "#CA8A04" : "#DC2626";

  return (
    <View style={[{ width: size, height: size }, styles.container]}>
      {/* เปลี่ยนจากแท็ก svg/circle เป็น <Svg> และ <Circle> จาก react-native-svg */}
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* วงกลมพื้นหลัง */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* วงกลมแสดงคะแนน */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {/* ข้อความคะแนนตรงกลาง */}
      <View style={StyleSheet.absoluteFillObject} className="items-center justify-center">
        <Text className="text-4xl font-extrabold text-gray-800">{score}</Text>
        <Text className="text-xs text-gray-400 font-medium">/ 100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});