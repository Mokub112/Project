import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function ReportPage() {
  const router = useRouter();
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [filteredTrip, setFilteredTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('day');

  // 📅 ใช้คำนวณวันปัจจุบันของจริง
  const [currentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  // 🗓️ ฟังก์ชันจัดเรียงวันในสัปดาห์ปัจจุบัน (จันทร์ - อาทิตย์)
  const getFormattedCurrentWeek = () => {
    const current = new Date(currentDate);
    const dayIndex = current.getDay();
    const distanceToMonday = dayIndex === 0 ? -6 : 1 - dayIndex;
    const monday = new Date(current.setDate(current.getDate() + distanceToMonday));
    
    const daysNameTH = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      
      const year = nextDay.getFullYear();
      const month = String(nextDay.getMonth() + 1).padStart(2, '0');
      const date = String(nextDay.getDate()).padStart(2, '0');
      
      weekDays.push({
        dayName: daysNameTH[i],
        dayNum: nextDay.getDate(),
        dateString: `${year}-${month}-${date}`
      });
    }
    return weekDays;
  };

  const calendarWeeks = getFormattedCurrentWeek();

  // เซ็ตให้เลือกวันปัจจุบันของจริงตั้งแต่โหลดหน้าแรก
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setSelectedDateStr(`${y}-${m}-${d}`);
  }, []);

  // 🔄 ดึงข้อมูลจากฐานข้อมูล Supabase
  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true);
        
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        
        if (userId) {
          const { data, error } = await supabase
            .from('driving_reports') 
            .select('*')
            .eq('user_id', userId)
            .order('drive_date', { ascending: false });

          if (!error && data) {
            setAllTrips(data);
          }
        }
      } catch (error) {
        console.error("Error fetching report details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReportData();
  }, []);

  // 🔍 ฟิลเตอร์ข้อมูลทริปเมื่อผู้ใช้คลิกเปลี่ยนวันในปฏิทิน
  useEffect(() => {
    if (selectedDateStr) {
      const matched = allTrips.find(trip => {
        const tripDate = trip.drive_date || (trip.created_at ? trip.created_at.split('T')[0] : '');
        return tripDate === selectedDateStr;
      });
      setFilteredTrip(matched || null);
    }
  }, [selectedDateStr, allTrips]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004368" />
      </View>
    );
  }

  const displayScore = filteredTrip ? Number(filteredTrip.driving_score) : 0; 
  const displaySpeed = filteredTrip ? filteredTrip.avg_speed : 0;
  const displayDistance = filteredTrip ? filteredTrip.distance : 0;
  const displayTime = filteredTrip ? filteredTrip.duration_minutes : 0;

  // 📊 ลิงก์ข้อมูลแท่งกราฟ
  const mockChartData = calendarWeeks.map((day) => {
    const tripInDay = allTrips.find(t => (t.drive_date || t.created_at?.split('T')[0]) === day.dateString);
    return {
      label: day.dayName,
      value: tripInDay ? Number(tripInDay.driving_score) : 0,
      isCurrentSelected: day.dateString === selectedDateStr
    };
  });

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const currentMonthText = `${thaiMonths[currentDate.getMonth()]} ${currentDate.getFullYear() + 543}`;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]} 
      showsVerticalScrollIndicator={false}
    >
      
      {/* 🗓️ 1. โซนปฏิทินสไลด์ด้านบน */}
      <View style={styles.calendarCard}>
        <View style={styles.calendarMonthRow}>
          <Ionicons name="chevron-back" size={18} color="#A0AEC0" />
          <Text style={styles.calendarMonthText}>{currentMonthText}</Text>
          <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
        </View>
        
        <View style={styles.daysRow}>
          {calendarWeeks.map((item) => {
            const isSelected = item.dateString === selectedDateStr;
            return (
              <TouchableOpacity 
                key={item.dateString} 
                style={[styles.dayColumn, isSelected && styles.dayColumnActive]}
                onPress={() => setSelectedDateStr(item.dateString)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayNameText, isSelected && styles.dayNameTextActive]}>{item.dayName}</Text>
                <Text style={[styles.dayNumText, isSelected && styles.dayNumTextActive]}>{item.dayNum}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 📈 2. โซนโชว์เปอร์เซ็นต์คะแนนและ Progress Bar */}
      <View style={styles.scoreOverviewSection}>
        <View style={styles.scoreMainRow}>
          <Text style={styles.bigScoreText}>{displayScore}%</Text>
          <View>
            <Text style={styles.scoreTitleText}>คะแนนขับขี่</Text>
            <TouchableOpacity 
              style={styles.scoreDetailBadge}
              // 💡 เพิ่ม Type Assertion ป้องกันระบบ Expo Route บิวด์ติดขัดกรณีลิ้งค์ข้าม Nested Stack
              onPress={() => router.push('/driving-result' as any)} 
              activeOpacity={0.7}
            >
              <Text style={styles.scoreDetailBadgeText}>ผลการขับขี่</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${Math.min(displayScore, 100)}%` }]} />
        </View>
      </View>

      {/* 🚗 3. กลุ่มการ์ด 3 สหาย */}
      <View style={styles.tripleGridRow}>
        <View style={styles.miniStatCard}>
          <View style={styles.miniCardHeader}>
            <Ionicons name="speedometer-outline" size={16} color="#004368" />
            <Text style={styles.miniCardTitle}>ความเร็วเฉลี่ย</Text>
          </View>
          <Text style={styles.miniCardValue}>{displaySpeed}</Text>
          <Text style={styles.miniCardUnit}>กม./ชม.</Text>
        </View>

        <View style={styles.miniStatCard}>
          <View style={styles.miniCardHeader}>
            <Ionicons name="map-outline" size={16} color="#004368" />
            <Text style={styles.miniCardTitle}>ระยะทางรวม</Text>
          </View>
          <Text style={styles.miniCardValue}>{displayDistance}</Text>
          <Text style={styles.miniCardUnit}>กม.</Text>
        </View>

        <View style={styles.miniStatCard}>
          <View style={styles.miniCardHeader}>
            <Ionicons name="time-outline" size={16} color="#004368" />
            <Text style={styles.miniCardTitle}>เวลาที่ใช้</Text>
          </View>
          <Text style={styles.miniCardValue}>{displayTime}</Text>
          <Text style={styles.miniCardUnit}>นาที</Text>
        </View>
      </View>

      {/* 📊 4. โซนกล่องกราฟแท่งวิเคราะห์พฤติกรรม */}
      <View style={styles.chartWrapperCard}>
        <View style={styles.filterTabContainer}>
          <TouchableOpacity style={[styles.filterTabButton, activeTab === 'day' && styles.filterTabButtonActive]} onPress={() => setActiveTab('day')}>
            <Text style={[styles.filterTabText, activeTab === 'day' && styles.filterTabTextActive]}>วัน</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterTabButton, activeTab === 'week' && styles.filterTabButtonActive]} onPress={() => setActiveTab('week')}>
            <Text style={[styles.filterTabText, activeTab === 'week' && styles.filterTabTextActive]}>สัปดาห์</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterTabButton, activeTab === 'month' && styles.filterTabButtonActive]} onPress={() => setActiveTab('month')}>
            <Text style={[styles.filterTabText, activeTab === 'month' && styles.filterTabTextActive]}>เดือน</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.barChartContainer}>
          {mockChartData.map((item, index) => {
            // ปรับสูตรคำนวณความสูงขั้นต่ำให้พอดีกับเสากราฟ
            const barHeight = item.value > 0 ? (item.value / 100) * 90 : 8; 
            const isBarActive = item.isCurrentSelected;

            return (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.barTrackArea}>
                  {/* 💡 อัปเกรด: ย้ายตัวเลขขึ้นมาไว้เหนือหัวแท่งกราฟเพื่อป้องกัน Layout แตกหน้าจอมือถือ/เว็บ */}
                  <Text style={[styles.barTopValueText, isBarActive && { fontWeight: '700', color: '#004368' }]}>
                    {item.value > 0 ? `${item.value}%` : '-'}
                  </Text>
                  <View style={[
                    styles.barFillStick, 
                    { height: barHeight },
                    isBarActive ? styles.barFillStickActive : styles.barFillStickNormal
                  ]} />
                </View>
                <Text style={styles.chartLabelText}>{item.label}</Text>
              </View>
            );
          })}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  calendarCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  calendarMonthRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  calendarMonthText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5568',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  dayColumnActive: {
    backgroundColor: '#004368',
  },
  dayNameText: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '500',
    marginBottom: 6,
  },
  dayNameTextActive: {
    color: '#E2E8F0',
  },
  dayNumText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
  },
  dayNumTextActive: {
    color: '#FFF',
  },
  scoreOverviewSection: {
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  scoreMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  bigScoreText: {
    fontSize: 54,
    fontWeight: '800',
    color: '#004368',
  },
  scoreTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004368',
  },
  scoreDetailBadge: {
    backgroundColor: '#004368',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  scoreDetailBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5A8CAE',
    borderRadius: 7,
  },
  tripleGridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  miniCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  miniCardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#718096',
    textAlign: 'center'
  },
  miniCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#004368',
  },
  miniCardUnit: {
    fontSize: 10,
    color: '#A0AEC0',
    fontWeight: '500',
    marginTop: 2,
  },
  chartWrapperCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  filterTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  filterTabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  filterTabButtonActive: {
    backgroundColor: '#FFF',
    elevation: 1,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterTabTextActive: {
    color: '#004368',
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingHorizontal: 4,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrackArea: {
    height: 120,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  barFillStick: {
    width: 24,
    borderRadius: 12,
  },
  barFillStickNormal: {
    backgroundColor: '#A3BFD3',
  },
  barFillStickActive: {
    backgroundColor: '#4A7694',
  },
  barTopValueText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
  },
  chartLabelText: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
    marginTop: 8,
  },
});