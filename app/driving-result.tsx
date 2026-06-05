import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { G, Circle } from 'react-native-svg';

// กำหนดประเภทข้อมูลสำหรับบันทึกเหตุการณ์
interface EventLog {
  time: string;
  detail: string;
}

interface Incident {
  label: string;
  percentage: number;
  color: string;
}

export default function DrivingResultPage() {
  const router = useRouter();

  // 📊 🎯 ปรับปรุงจุดที่ 1: ตั้งค่าเริ่มต้นสัดส่วนเป็น 0% ทั้งหมด (หรือปล่อยเป็นอาร์เรย์ว่าง)
  const [incidentData, setIncidentData] = useState<Incident[]>([
    { label: 'เบรกกะทันหัน', percentage: 0, color: '#A3BFD3' },
    { label: 'ใช้โทรศัพท์มือถือ', percentage: 0, color: '#7E9CB9' },
    { label: 'เปลี่ยนเลนกะทันหัน', percentage: 0, color: '#4A7694' },
    { label: 'มองออกนอกหน้าต่าง', percentage: 0, color: '#092537' },
  ]);

  // 📝 🎯 ปรับปรุงจุดที่ 2: ล้างรายการบันทึกจำลองออกให้เหลืออาร์เรย์ว่าง []
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);

  // 🎯 ปรับปรุงจุดที่ 3: เคลียร์ตัวแปรสถิติตัวเลขให้เริ่มต้นจาก 0 จริง ๆ
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [driveDuration, setDriveDuration] = useState<number>(0);
  const [score, setScore] = useState<number>(100); // เริ่มต้นคะแนนเต็ม 100 เต็ม

  // เช็กว่ามีเหตุการณ์เกิดขึ้นจริง ๆ ไหม (ถ้าผลรวมเปอร์เซ็นต์เป็น 0 แปลว่ายังไม่มีสถิติ)
  const hasIncidentData = incidentData.some(item => item.percentage > 0);

  // คำนวณขอบเขตพิกัดชิ้นส่วนวงกลม SVG Pie Chart
  let currentOffset = 0;
  const computedPieSlices = incidentData.map((item) => {
    const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += item.percentage;
    return { ...item, strokeDasharray, strokeDashoffset };
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* 🔙 Navigation Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="chevron-back" size={22} color="#4A5568" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ผลการขับขี่</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="log-out-outline" size={16} color="#004368" style={{ transform: [{ rotate: '-90deg' }] }} />
          <Text style={styles.exportText}>ส่งออก</Text>
        </TouchableOpacity>
      </View>

      {/* 📄 1. การ์ดข้อมูลสรุปภาพรวม (ค่าเริ่มต้นสตาร์ทจาก 0 สะอาดหมดจด) */}
      <View style={styles.summaryCard}>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>ชื่อผู้ใช้งาน :</Text><Text style={styles.infoValue}>หมูกระทะคือนิพพาน</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>โทรศัพท์ :</Text><Text style={styles.infoValue}>0123456789</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>ทะเบียนรถ :</Text><Text style={styles.infoValue}>มกท 564</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>วันที่ :</Text><Text style={styles.infoValue}>5/5/2569</Text></View>
        
        <View style={styles.divider} />

        <View style={styles.infoRow}><Text style={styles.infoLabel}>ความเร็วสูงสุด :</Text><Text style={styles.infoValue}>{maxSpeed} กม./ชม.</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>ระยะทางรวม :</Text><Text style={styles.infoValue}>{totalDistance} ก.ม.</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>ระยะเวลาขับขี่ :</Text><Text style={styles.infoValue}>{driveDuration} นาที</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>เหตุการณ์เสี่ยง :</Text><Text style={[styles.infoValue, { color: eventLogs.length > 0 ? '#E53E3E' : '#004368' }]}>{eventLogs.length} ครั้ง</Text></View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>คะแนนการขับขี่ :</Text>
          <Text style={[styles.infoValue, { color: '#2F855A', fontWeight: '800' }]}>{score} / 100 (เกรด A)</Text>
        </View>
      </View>

      {/* 📝 2. บล็อกบันทึกเหตุการณ์เสี่ยงแยกตามเวลา */}
      <Text style={styles.sectionTitle}>บันทึกเหตุการณ์เสี่ยงภัย</Text>
      <View style={styles.logCard}>
        {eventLogs.length > 0 ? (
          <>
            <View style={styles.logTableHeader}>
              <Text style={[styles.tableHeaderColumn, { flex: 1.2 }]}>เวลา</Text>
              <Text style={[styles.tableHeaderColumn, { flex: 3 }]}>รายละเอียดการตรวจจับ</Text>
            </View>
            {eventLogs.map((log, index) => (
              <View key={index} style={styles.logTableRow}>
                <Text style={[styles.tableCellTime, { flex: 1.2 }]}>{log.time}</Text>
                <Text style={[styles.tableCellDetail, { flex: 3 }]}>{log.detail}</Text>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={32} color="#2F855A" />
            <Text style={styles.emptyLogText}>ยอดเยี่ยม! ไม่พบพฤติกรรมเสี่ยงภัยในการขับขี่รอบนี้</Text>
          </View>
        )}
      </View>

      {/* 📊 3. บล็อกสัดส่วนเหตุการณ์เสี่ยงภัย (กราฟวงกลม Pie Chart) */}
      <Text style={styles.sectionTitle}>สัดส่วนพฤติกรรมการขับขี่</Text>
      <View style={styles.pieChartCard}>
        <View style={styles.pieContainer}>
          <Svg height="120" width="120" viewBox="0 0 32 32">
            <G transform="rotate(-90 16 16)">
              {hasIncidentData ? (
                // แสดงสัดส่วนสีจริงเมื่อมีข้อมูลเข้ามา
                computedPieSlices.map((item, index) => (
                  <Circle
                    key={index}
                    cx="16"
                    cy="16"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="32"
                    strokeDasharray={item.strokeDasharray}
                    strokeDashoffset={item.strokeDashoffset}
                  />
                ))
              ) : (
                // 🌟 หากสถิติเป็น 0% ทั้งหมด ให้โชว์เป็นวงแหวนสีเทาคลีนว่างเปล่ารอการบันทึก
                <Circle
                  cx="16"
                  cy="16"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="#CBD5E1"
                  strokeWidth="32"
                />
              )}
            </G>
          </Svg>
        </View>

        {/* รายละเอียดระบุค่าสัดส่วนเป้าหมาย % ด้านขวา */}
        <View style={styles.legendContainer}>
          {incidentData.map((item, index) => (
            <View key={index} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View style={[styles.colorDot, { backgroundColor: hasIncidentData ? item.color : '#CBD5E1' }]} />
                <Text style={styles.legendLabel} numberOfLines={1}>{item.label}</Text>
              </View>
              <Text style={styles.legendPercentage}>{item.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backButton: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF',
    alignItems: 'center', justifyContent: 'center', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#2D3748' },
  exportButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E2E8F0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  exportText: { fontSize: 12, fontWeight: '600', color: '#004368' },
  summaryCard: { backgroundColor: '#DCE6EE', borderRadius: 20, padding: 20, marginBottom: 24 },
  infoRow: { flexDirection: 'row', marginBottom: 6 },
  infoLabel: { width: 110, fontSize: 13, fontWeight: '700', color: '#004368' },
  infoValue: { flex: 1, fontSize: 13, fontWeight: '700', color: '#004368' },
  divider: { height: 1, backgroundColor: '#CBD5E1', marginVertical: 12, opacity: 0.7 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#004368', marginBottom: 12, paddingHorizontal: 4 },
  logCard: { backgroundColor: '#DCE6EE', borderRadius: 20, padding: 16, marginBottom: 24 },
  logTableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#CBD5E1', paddingBottom: 8, marginBottom: 8 },
  tableHeaderColumn: { fontSize: 13, fontWeight: '700', color: '#004368' },
  logTableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: 'rgba(203, 213, 225, 0.4)' },
  tableCellTime: { fontSize: 12, fontWeight: '600', color: '#004368' },
  tableCellDetail: { fontSize: 12, fontWeight: '600', color: '#2D3748' },
  pieChartCard: { flexDirection: 'row', backgroundColor: '#DCE6EE', borderRadius: 20, padding: 20, alignItems: 'center', gap: 16 },
  pieContainer: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  legendContainer: { flex: 1, gap: 10 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legendLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 11, fontWeight: '600', color: '#004368', flex: 1 },
  legendPercentage: { fontSize: 11, fontWeight: '700', color: '#004368', width: 45, textAlign: 'right' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  emptyLogText: { fontSize: 12, fontWeight: '600', color: '#2F855A', textAlign: 'center' }
});