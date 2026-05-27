import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { G, Circle } from 'react-native-svg';

export default function DrivingResultPage() {
  const router = useRouter();

  // ข้อมูลสัดส่วนเหตุการณ์ตามภาพต้นฉบับ
  const incidentData = [
    { label: 'เบรกกะทันหัน', percentage: 25, color: '#A3BFD3' },
    { label: 'ใช้โทรศัพท์มือถือ', percentage: 12.5, color: '#7E9CB9' },
    { label: 'เปลี่ยนเลนกะทันหัน', percentage: 25, color: '#4A7694' },
    { label: 'มองออกนอกหน้าต่าง', percentage: 37.5, color: '#092537' },
  ];

  // รายการบันทึกเหตุการณ์จำลอง
  const eventLogs = [
    { time: '10:30 น.', detail: 'การลดความเร็วอย่างรวดเร็ว' },
    { time: '10:30 น.', detail: 'ตรวจพบโทรศัพท์ในมือ' },
    { time: '10:30 น.', detail: 'ละสายตาจากถนน' },
    { time: '10:30 น.', detail: 'ตรวจพบโทรศัพท์ในมือ' },
    { time: '10:30 น.', detail: 'ตรวจพบโทรศัพท์ในมือ' },
  ];

  // 🥧 คำนวณขอบเขตชิ้นส่วนวงกลมสำหรับ SVG Pie Chart
  let accumulatedPercentage = 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* 🔙 Navigation Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#4A5568" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ผลการขับขี่</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="log-out-outline" size={16} color="#004368" style={{ transform: [{ rotate: '-90deg' }] }} />
          <Text style={styles.exportText}>ส่งออก</Text>
        </TouchableOpacity>
      </View>

      {/* 📄 1. การ์ดข้อมูลสรุปภาพรวม */}
      <View style={styles.summaryCard}>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>ชื่อผู้ใช้งาน :</Text><Text style={styles.infoValue}>หมูกระทะคือนิพพาน</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>โทรศัพท์ :</Text><Text style={styles.infoValue}>0123456789</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>ทะเบียนรถ :</Text><Text style={styles.infoValue}>มกท 564</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>วันที่ :</Text><Text style={styles.infoValue}>5/5/2569</Text></View>
        
        <View style={styles.divider} />

        <View style={styles.infoRow}><Text style={styles.infoLabel}>ความเร็ว :</Text><Text style={styles.infoValue}>120 กม./ชม.</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>ระยะทาง :</Text><Text style={styles.infoValue}>4 ก.ม.</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>เวลา :</Text><Text style={styles.infoValue}>3 นาที</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>เหตุการณ์เสี่ยง :</Text><Text style={[styles.infoValue, { color: '#E53E3E' }]}>4 ครั้ง</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>คะแนนการขับขี่ :</Text><Text style={styles.infoValue}>หมูกระทะคือนิพพาน</Text></View>
      </View>

      {/* 📝 2. บล็อกบันทึกเหตุการณ์เสี่ยงแยกตามเวลา */}
      <Text style={styles.sectionTitle}>บันทึกเหตุการณ์</Text>
      <View style={styles.logCard}>
        <View style={styles.logTableHeader}>
          <Text style={[styles.tableHeaderColumn, { flex: 1.2 }]}>เวลา</Text>
          <Text style={[styles.tableHeaderColumn, { flex: 3 }]}>รายละเอียด</Text>
        </View>
        {eventLogs.map((log, index) => (
          <View key={index} style={styles.logTableRow}>
            <Text style={[styles.tableCellTime, { flex: 1.2 }]}>{log.time}</Text>
            <Text style={[styles.tableCellDetail, { flex: 3 }]}>{log.detail}</Text>
          </View>
        ))}
      </View>

      {/* 📊 3. บล็อกสัดส่วนเหตุการณ์ (พร้อมกราฟวงกลม Pie Chart) */}
      <Text style={styles.sectionTitle}>สัดส่วนเหตุการณ์</Text>
      <View style={styles.pieChartCard}>
        <View style={styles.pieContainer}>
          {/* สร้าง Pie Chart แบบ Dynamic ด้วย SVG */}
          <Svg height="120" width="120" viewBox="0 0 32 32">
            <G transform="rotate(-90 16 16)">
              {incidentData.map((item, index) => {
                const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
                const strokeDashoffset = -accumulatedPercentage;
                accumulatedPercentage += item.percentage;
                return (
                  <Circle
                    key={index}
                    cx="16"
                    cy="16"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="32"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
            </G>
          </Svg>
        </View>

        {/* รายละเอียดคำอธิบาย % ด้านขวา */}
        <View style={styles.legendContainer}>
          {incidentData.map((item, index) => (
            <View key={index} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel}>{item.label}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  exportText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004368',
  },
  summaryCard: {
    backgroundColor: '#DCE6EE',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    width: 110,
    fontSize: 13,
    fontWeight: '700',
    color: '#004368',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#004368',
  },
  divider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 12,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#004368',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  logCard: {
    backgroundColor: '#DCE6EE',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  logTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderColumn: {
    fontSize: 13,
    fontWeight: '700',
    color: '#004368',
  },
  logTableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  tableCellTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004368',
  },
  tableCellDetail: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004368',
  },
  pieChartCard: {
    flexDirection: 'row',
    backgroundColor: '#DCE6EE',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  pieContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flex: 1,
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#004368',
    flex: 1,
  },
  legendPercentage: {
    fontSize: 11,
    fontWeight: '700',
    color: '#004368',
    width: 40,
    textAlign: 'right',
  },
});