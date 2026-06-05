import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { G, Circle } from "react-native-svg";

interface CircularScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function CircularScore({ score, size = 120, strokeWidth = 10 }: CircularScoreProps) {
  // คำนวณหาเส้นรอบวงตามหลักคณิตศาสตร์
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // คำนวณจุดตัดของเส้นคะแนน ยิ่งคะแนนเยอะ ออฟเซ็ตยิ่งน้อย เส้นยิ่งยาว
  const strokeDashoffset = circumference - (circumference * Math.min(Math.max(score, 0), 100)) / 100;
  
  // ตัดเกรดสีตามช่วงคะแนน (ปลอดภัย-เขียว, เตือน-เหลือง, อันตราย-แดง)
  const scoreColor = score >= 80 ? "#16A34A" : score >= 50 ? "#CA8A04" : "#DC2626";

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 🌟 ย้ายคำสั่งหมุน -90 องศาขึ้นมาไว้ที่กลุ่ม <G> เพื่อให้หัวเส้นเริ่มจากเที่ยงตรงเป๊ะทุกอุปกรณ์ */}
        <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {/* วงกลมพื้นหลัง (สีเทาจาง) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* วงกลมแสดงความก้าวหน้าของคะแนนจริง */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" // ปลายเส้นมนสวยงามตามภาพดีไซน์
            fill="none"
          />
        </G>
      </Svg>

      {/* 🎯 [แก้ไขแล้ว] บล็อกข้อความตรงกลาง จัดกึ่งกลางด้วย StyleSheet แท้ๆ หมดปัญหาข้อความเด้งหลุดขอบ */}
      <View style={[StyleSheet.absoluteFillObject, styles.textOverlay]}>
        <Text style={styles.scoreText}>{score}</Text>
        <Text style={styles.maxScoreText}>/ 100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
  },
  textOverlay: {
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1E293B", // gray-800
    lineHeight: 40,
  },
  maxScoreText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF", // gray-400
    marginTop: 2,
  },
});