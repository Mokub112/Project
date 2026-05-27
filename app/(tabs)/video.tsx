import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase'; // 🟢 นำเข้า supabase client

const { width } = Dimensions.get('window');
const cardWidth = (width - 44) / 2; 

export default function VideoPage() {
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<any[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  
  // 🟢 State สำหรับจัดการข้อมูลจริงจาก DB
  const [videoList, setVideoList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // 📅 1. จัดการปฏิทิน (ส่งฟอร์แมต YYYY-MM-DD เพื่อเอาไปค้นหาในฐานข้อมูลได้ง่าย)
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
    
    if (!selectedDateStr) {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      setSelectedDateStr(todayStr);
    }
  }, [referenceDate]);

  // 🟢 2. ดึงข้อมูลวิดีโอจาก Supabase เมื่อ `selectedDateStr` (วันที่เลือก) เปลี่ยนไป
  useEffect(() => {
    if (!selectedDateStr) return;

    async function fetchVideosByDate() {
      try {
        setLoading(true);
        
        // ดึง User Session ปัจจุบัน
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;

        if (userId) {
          // ดึงข้อมูลจากตาราง วิดีโอ โดยเช็กเงื่อนไข user_id และ วันที่บันทึกวิดีโอ
          const { data, error } = await supabase
            .from('driving_videos') // ⚠️ พี่สามารถเปลี่ยนชื่อตารางให้ตรงกับใน DB จริงของพี่ได้ตรงนี้ครับ
            .select('*')
            .eq('user_id', userId)
            .eq('video_date', selectedDateStr) // ค้นหาวิดีโอเฉพาะวันที่เลือก
            .order('created_at', { ascending: false });

          if (!error && data) {
            setVideoList(data);
          } else {
            setVideoList([]); // ถ้า Error หรือไม่เจอ ให้เป็นอาเรย์ว่าง
          }
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVideosByDate();
  }, [selectedDateStr]);

  // ฟังก์ชันสลับสัปดาห์
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

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]} // ดันพื้นที่หนีแถบล่างชัวร์ ๆ
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical={true}
    >

      {/* 📅 แถบปฏิทิน */}
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

      {/* 📊 ส่วนแสดงตารางรายการวิดีโอ */}
      {loading ? (
        // แสดงตัวโหลดติ้ว ๆ ตอนดึงข้อมูล
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#004368" />
        </View>
      ) : videoList.length === 0 ? (
        // 💡 ถ้าวันนั้นไม่มีวิดีโอในฐานข้อมูล จะแสดงข้อความนี้แทน ไม่ปล่อยให้จอโล่งเปล่าประโยชน์
        <View style={styles.centerContainer}>
          <Ionicons name="videocam-off-outline" size={48} color="#A0AEC0" />
          <Text style={styles.emptyText}>ไม่มีวิดีโอการขับขี่ในวันนี้</Text>
        </View>
      ) : (
        // มีข้อมูลจริง โชว์ลิสต์ตามปกติ
        <View style={styles.videoGridContainer}>
          {videoList.map((item) => (
            <View key={item.id} style={styles.videoCard}>
              
              <View style={styles.thumbnailWrapper}>
                {/* 💡 เปลี่ยนเป็น item.thumbnail_url หรือ item.video_url (ถ้ามี) จาก DB ได้เลย */}
                <Image 
                  source={{ uri: item.thumbnail_url || 'https://images.unsplash.com/photo-1542362567-b07eac79094d?q=80&w=400' }} 
                  style={styles.thumbnailImage} 
                />
                <View style={styles.overlayOverlay} />
                
                <TouchableOpacity style={styles.playButtonCircle} activeOpacity={0.8}>
                  <Ionicons name="play" size={16} color="#1E293B" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              </View>

              {/* แสดงชื่อไฟล์จากคอลัมน์ใน DB เช่น item.title หรือ item.video_name */}
              <Text style={styles.videoTitleText} numberOfLines={1}>
                {item.title || item.video_name || 'ไม่ได้ระบุชื่อวิดีโอ'}
              </Text>
            </View>
          ))}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 50,
  },
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
    fontSize: 10,
    color: '#718096',
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
    width: '90%',
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