import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
// 💡 คำนวณความกว้างของการ์ดวิดีโอแบบลบระยะขอบ Padding ให้พอดีสัดส่วนหน้าจอเป๊ะ ๆ
const cardWidth = (width - 44) / 2; 

export default function VideoPage() {
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [weekDays, setWeekDays] = useState<any[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  
  // 🟢 State สำหรับจัดการข้อมูลจริงจาก DB
  const [videoList, setVideoList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 🎯 ป้อน IP ของคอมพิวเตอร์/บอร์ด AI ที่อยู่ในวง Wi-Fi เดียวกันในรถยนต์
  // (ถ้าทดสอบบน Web ใช้ IP คอมพิวเตอร์ตรงๆ ได้เลย แต่ถ้าเทสผ่านมือถือจริงให้ใช้ IP ของเครื่องคอมฯ ที่รัน Python นะครับ)
  const videoStreamUrl = "http://192.168.1.50:5000/video_feed"; 

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // 📅 1. จัดการระบบปฏิทินให้สอดคล้องกับวันปัจจุบันและสัปดาห์ที่เลือกอย่างแม่นยำ
  useEffect(() => {
    const current = new Date(referenceDate);
    const currentDayOfWeek = current.getDay(); 
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    
    const monday = new Date(current);
    monday.setDate(current.getDate() + distanceToMonday);

    const days = [];
    const dayLabels = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      
      const year = nextDay.getFullYear();
      const month = String(nextDay.getMonth() + 1).padStart(2, '0');
      const date = String(nextDay.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${date}`;
      
      days.push({
        label: dayLabels[i],
        dateNumber: nextDay.getDate(),
        fullDateString: dateString, 
      });
    }

    setWeekDays(days);
    
    // 💡 ให้เลือกวันแรกของสัปดาห์ที่เปลี่ยนไปอัตโนมัติ เพื่อให้ข้อมูล Query อัปเดตตามทันที
    const matchedDay = days.find(d => d.fullDateString === selectedDateStr);
    if (!matchedDay && days.length > 0) {
      setSelectedDateStr(days[0].fullDateString);
    }
  }, [referenceDate]);

  // ตั้งค่าเริ่มต้นวันปัจจุบันครั้งแรกที่โหลดหน้าจอ
  useEffect(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDateStr(todayStr);
  }, []);

  // 🟢 2. ดึงข้อมูลวิดีโอจาก Supabase เมื่อวันที่เลือกเปลี่ยนไป
  useEffect(() => {
    if (!selectedDateStr) return;

    async function fetchVideosByDate() {
      try {
        setLoading(true);
        
        const startDate = `${selectedDateStr}T00:00:00.000Z`;
        
        const nextDayObj = new Date(selectedDateStr);
        nextDayObj.setDate(nextDayObj.getDate() + 1);
        const nextDayStr = `${nextDayObj.getFullYear()}-${String(nextDayObj.getMonth() + 1).padStart(2, '0')}-${String(nextDayObj.getDate()).padStart(2, '0')}`;
        const endDate = `${nextDayStr}T00:00:00.000Z`;

        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .gte('created_at', startDate)
          .lt('created_at', endDate)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setVideoList(data);
        } else {
          if (error) console.error('Supabase error:', error.message);
          setVideoList([]);
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVideosByDate();
  }, [selectedDateStr]);

  const handlePrevWeek = () => {
    const prev = new Date(referenceDate);
    prev.setDate(prev.getDate() - 7);
    setReferenceDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(referenceDate);
    next.setDate(next.getDate() + 7);
    setReferenceDate(next);
  };

  const renderMonthYear = () => {
    const monthThai = thaiMonths[referenceDate.getMonth()];
    const yearThai = referenceDate.getFullYear() + 543;
    return `${monthThai} ${yearThai}`;
  };

  const handlePlayVideo = (videoItem: any) => {
    console.log('กำลังเปิดเล่นวิดีโอ ID:', videoItem.id, 'YouTube ID:', videoItem.youtube_id);
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]} 
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical={true}
    >
      
      {/* 🔴 ส่วนที่เพิ่มใหม่: จอแสดงผล Live Stream ภาพสดจากกล้องหน้ารถแบบเรียลไทม์ */}
      <View style={styles.liveStreamSection}>
        <View style={styles.liveHeader}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTitle}>กล้องสตรีมสดตรวจจับพฤติกรรมเสี่ยง (Real-time)</Text>
        </View>
        <View style={styles.videoContainer}>
          <Image 
            source={{ uri: videoStreamUrl }} 
            style={styles.streamImage}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={styles.divider} />

      {/* 📅 แถบปฏิทิน (โค้ดเดิมของพี่) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>ประวัติวิดีโอย้อนหลัง</Text>
      </View>

      <View style={styles.calendarStrip}>
        <View style={styles.calendarHeaderRow}>
          <TouchableOpacity onPress={handlePrevWeek} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={20} color="#718096" />
          </TouchableOpacity>
          <Text style={styles.calendarMonthText}>{renderMonthYear()}</Text>
          <TouchableOpacity onPress={handleNextWeek} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-forward" size={20} color="#718096" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.daysRow}>
          {weekDays.map((day, idx) => {
            const isSelected = day.fullDateString === selectedDateStr; 
            
            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.dayBlock, isSelected && styles.dayBlockSelected]}
                onPress={() => setSelectedDateStr(day.fullDateString)} 
                activeOpacity={0.8}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>{day.label}</Text>
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>{day.dateNumber}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 📊 ส่วนแสดงรายการวิดีโอย้อนหลัง (โค้ดเดิมของพี่) */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#004368" />
        </View>
      ) : videoList.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="videocam-off-outline" size={48} color="#A0AEC0" />
          <Text style={styles.emptyText}>ไม่มีวิดีโอการขับขี่ในวันนี้</Text>
        </View>
      ) : (
        <View style={styles.videoGridContainer}>
          {videoList.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.videoCard}
              onPress={() => handlePlayVideo(item)}
              activeOpacity={0.85}
            >
              <View style={styles.thumbnailWrapper}>
                <Image 
                  source={{ uri: item.thumbnail_url || 'https://images.unsplash.com/photo-1542362567-b07eac79094d?q=80&w=400' }} 
                  style={styles.thumbnailImage} 
                />
                <View style={styles.overlayOverlay} />
                
                <View style={styles.playButtonCircle}>
                  <Ionicons name="play" size={16} color="#1E293B" style={{ marginLeft: 2 }} />
                </View>
              </View>

              <Text style={styles.videoTitleText} numberOfLines={1}>
                {item.title || 'ไม่ได้ระบุชื่อวิดีโอ'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 30, // จัดขอบบนให้รองรับ Notch ของมือถือ
  },
  // ─── Style ส่วน Live Stream ที่เพิ่มเข้ามาใหม่ ───
  liveStreamSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    marginBottom: 8,
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444', // จุดสีแดงแจ้งสถานะ Live บันทึกสด
    marginRight: 8,
  },
  liveTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  videoContainer: { 
    width: '100%', 
    height: 200, // สัดส่วนวิดีโอกำลังสวย ไม่บังส่วนประวัติข้างล่าง
    backgroundColor: '#000', 
    borderRadius: 12, 
    overflow: 'hidden',
  },
  streamImage: { 
    width: '100%', 
    height: '100%' 
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  sectionHeaderRow: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  // ─── Style ส่วนเดิมของพี่ ───
  calendarStrip: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  calendarMonthText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3748',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayBlock: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    minWidth: 38,
  },
  dayBlockSelected: {
    backgroundColor: '#004368', 
  },
  dayLabel: {
    fontSize: 11,
    color: '#A0AEC0',
    fontWeight: '600',
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: '#FFF',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
  },
  dayNumberSelected: {
    color: '#FFF',
  },
  videoGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  videoCard: {
    width: cardWidth,
    alignItems: 'center',
    marginBottom: 4,
  },
  thumbnailWrapper: {
    width: '100%',
    height: 105,
    borderRadius: 18,
    backgroundColor: '#CBD5E1',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  playButtonCircle: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  videoTitleText: {
    fontSize: 11,
    color: '#4A5568',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    width: '95%',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
    marginTop: 12,
  },
});