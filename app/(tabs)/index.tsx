import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function DashboardPage() {
  const router = useRouter();
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  // 📅 ใช้ Date ของจริง ณ ปัจจุบัน
  const [currentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(''); // เก็บ yyyy-mm-dd ที่เลือก

  // 🗓️ ฟังก์ชันคำนวณหารายชื่อวันในสัปดาห์ปัจจุบัน (จันทร์ - อาทิตย์) ตรงตามปฏิทินจริง
  const getFormattedCurrentWeek = () => {
    const current = new Date(currentDate);
    const dayIndex = current.getDay();
    // ปรับให้วันจันทร์เป็นวันแรกของสัปดาห์ (ถ้าเป็นวันอาทิตย์ให้ถอยไป 6 วัน)
    const distanceToMonday = dayIndex === 0 ? -6 : 1 - dayIndex; 
    
    const monday = new Date(current.setDate(current.getDate() + distanceToMonday));
    
    const daysNameTH = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      
      // ฟอร์แมตให้อยู่ในรูปแบบ ISO (YYYY-MM-DD) สำหรับเอาไว้ใช้เทียบความถูกต้องของข้อมูล
      const year = nextDay.getFullYear();
      const month = String(nextDay.getMonth() + 1).padStart(2, '0');
      const date = String(nextDay.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${date}`;

      weekDays.push({
        dayName: daysNameTH[i],
        dayNum: nextDay.getDate(),
        dateString: dateString
      });
    }
    return weekDays;
  };

  const calendarWeeks = getFormattedCurrentWeek();

  // ตั้งค่าเลือกวันปัจจุบันของจริงเป็นค่าเริ่มต้นเมื่อเปิดแอปครั้งแรก
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setSelectedDateStr(`${y}-${m}-${d}`);
  }, []);

  // 🔄 ดึงข้อมูลพฤติกรรมการขับขี่จากฐานข้อมูล Supabase
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        let { data: { user } } = await supabase.auth.getUser();
        
        // 💡 แก้ไขจุดบอด: ดักตรวจสอบ typeof window ก่อนเรียกใช้ localStorage เพื่อไม่ให้ระบบบิวด์พังคาเซิร์ฟเวอร์
        if (!user && typeof window !== 'undefined') {
          const savedEmail = localStorage.getItem('user_email');
          const savedId = localStorage.getItem('user_id');
          if (savedEmail) {
            user = { email: savedEmail, id: savedId } as any;
          }
        }
        
        if (user) {
          setUserData(user);

          // ดึงประวัติการเดินทางทั้งหมดของผู้ใช้รายนี้
          const { data, error } = await supabase
            .from('trips') 
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setAllTrips(data);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // 🔍 คอยตรวจจับเมื่อมีการเปลี่ยนวันบนปฏิทิน แล้วทำการกรองข้อมูลทริปเฉพาะของวันนั้น
  useEffect(() => {
    if (selectedDateStr) {
      const filtered = allTrips.filter(trip => {
        const tripDate = trip.created_at ? trip.created_at.split('T')[0] : trip.date;
        return tripDate === selectedDateStr;
      });
      setFilteredTrips(filtered);
    }
  }, [selectedDateStr, allTrips]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004368" />
      </View>
    );
  }

  const hasData = filteredTrips.length > 0;
  const displayData = hasData ? filteredTrips[0] : { speed: 0, distance: 0, score: '-', location: 'ไม่มีประวัติเดินทาง', time: '--:--' };

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const currentMonthText = `${thaiMonths[currentDate.getMonth()]} ${currentDate.getFullYear() + 543}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* 👤 Header ส่วนบน */}
      <View style={styles.headerRow}>
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color="#004368" />
          </View>
          <View>
            <Text style={styles.userLabel}>ผู้ใช้บัญชี</Text>
            <Text style={styles.userName}>
              {userData?.user_metadata?.full_name || userData?.email || "หมูกระทะคือนิพพาน"}
            </Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="calendar-outline" size={18} color="#1A2332" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="options-outline" size={18} color="#1A2332" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🟦 คะแนนขับขี่ล่าสุด */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreLeft}>
          <View style={styles.alertTitleRow}>
            <Ionicons name="warning" size={14} color="#FBBF24" />
            <Text style={styles.alertTitle}>คะแนนขับขี่ล่าสุด</Text>
          </View>
          <Text style={styles.alertSubtitle}>
            {hasData ? "ประมวลผลความปลอดภัยเรียบร้อย" : "ไม่พบประวัติการเดินทาง\nของวันที่คุณเลือก"}
          </Text>
        </View>
        <View style={styles.scoreBadgeCircle}>
          <Text style={styles.scoreNumber}>{displayData.score}</Text>
        </View>
      </View>

      {/* ⚪ บล็อคแสดงความเร็วและระยะทาง */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>ความเร็วเฉลี่ย</Text>
            <View style={styles.miniIconCircle}>
              <Ionicons name="speedometer-outline" size={14} color="#718096" />
            </View>
          </View>
          <Text style={styles.statValue}>
            {displayData.speed} <Text style={styles.statUnit}>กม./ชม.</Text>
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>ระยะทางรวม</Text>
            <View style={styles.miniIconCircle}>
              <Ionicons name="car-outline" size={14} color="#718096" />
            </View>
          </View>
          <Text style={styles.statValue}>
            {displayData.distance} <Text style={styles.statUnit}>กม.</Text>
          </Text>
        </View>
      </View>

      {/* 🔘 ปุ่มเริ่มเดินทาง */}
      <View style={styles.centerButtonWrapper}>
        <TouchableOpacity 
          style={styles.startTripButton} 
          // 💡 แก้ไขจุดสำคัญ: เปลี่ยนเส้นทางให้วิ่งกลับไปเปิดที่โฟลเดอร์กล้องสแกนหรือสิทธิ์ภายนอกให้สัมพันธ์กับแอปจริง
          onPress={() => router.replace('destination' as any)}
          activeOpacity={0.85}>
          <Text style={styles.startTripText}>เริ่มเดินทาง</Text>
        </TouchableOpacity>
      </View>

      {/* 📅 ปฏิทินแสดงผลของจริง */}
      <View style={styles.historyHeaderRow}>
        <Text style={styles.historyTitle}>ประวัติการเดินทาง</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>แสดงทั้งหมด</Text>
        </TouchableOpacity>
      </View>

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

      {/* 🏠 การ์ดสรุปประวัติจุดหมายปลายทางของแต่ละวัน */}
      <TouchableOpacity style={styles.destinationCard} activeOpacity={hasData ? 0.9 : 1}>
        <View style={styles.destinationLeft}>
          <View style={[styles.homeIconBox, !hasData && { backgroundColor: '#CBD5E1' }]}>
            <Ionicons name={hasData ? "home" : "location-off"} size={20} color="#FFF" />
          </View>
          <View>
            <Text style={styles.destinationTitle}>{displayData.location}</Text>
            <View style={styles.destinationMetaRow}>
              <Text style={styles.metaSubLabel}>วันที่</Text>
              <Text style={styles.metaSubValue}>
                {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '-'}
              </Text>
              
              <Text style={[styles.metaSubLabel, { marginLeft: 12 }]}>ระยะทาง</Text>
              <Text style={styles.metaSubValue}>{displayData.distance} กม.</Text>
              
              <Text style={[styles.metaSubLabel, { marginLeft: 12 }]}>เวลา</Text>
              <Text style={styles.metaSubValue}>{displayData.time}</Text>
            </View>
          </View>
        </View>
        {hasData && <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 110 }, // 💡 ขยายความสูงด้านล่างกันบังแคปซูลเมนู
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7FAFC' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  userLabel: { fontSize: 11, color: '#A0AEC0', fontWeight: '500' },
  userName: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  scoreCard: { width: '100%', backgroundColor: '#004368', borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  scoreLeft: { flexDirection: 'column', gap: 4 },
  alertTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertTitle: { color: '#FFF', fontSize: 11, fontWeight: '600', opacity: 0.9 },
  alertSubtitle: { color: '#FFF', fontSize: 15, fontWeight: '700', lineHeight: 22 },
  scoreBadgeCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', borderWidth: 5, borderColor: '#ED8936', alignItems: 'center', justifyContent: 'center' },
  scoreNumber: { fontSize: 22, fontWeight: '800', color: '#2D3748' },
  statsGrid: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 18, padding: 16, elevation: 2 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: 13, fontWeight: '600', color: '#718096' },
  miniIconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EDF2F7', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 26, fontWeight: '700', color: '#2D3748' },
  statUnit: { fontSize: 12, fontWeight: '500', color: '#A0AEC0' },
  centerButtonWrapper: { alignItems: 'center', marginBottom: 24 },
  startTripButton: { backgroundColor: '#004368', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 36, alignItems: 'center', justifyContent: 'center' },
  startTripText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  historyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  historyTitle: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  seeAllText: { fontSize: 12, color: '#4A5568', fontWeight: '600' },
  calendarCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 14, elevation: 2 },
  calendarMonthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingHorizontal: 4 },
  calendarMonthText: { fontSize: 13, fontWeight: '700', color: '#4A5568' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayColumn: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12 },
  dayColumnActive: { backgroundColor: '#4A5568' },
  dayNameText: { fontSize: 11, color: '#718096', fontWeight: '500', marginBottom: 6 },
  dayNameTextActive: { color: '#E2E8F0' },
  dayNumText: { fontSize: 15, fontWeight: '700', color: '#2D3748' },
  dayNumTextActive: { color: '#FFF' },
  destinationCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 18, elevation: 2 },
  destinationLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  homeIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#4A6B82', alignItems: 'center', justifyContent: 'center' },
  destinationTitle: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  destinationMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaSubLabel: { fontSize: 10, color: '#A0AEC0', marginRight: 4 },
  metaSubValue: { fontSize: 10, fontWeight: '600', color: '#718096' },
});