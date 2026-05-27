import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DestinationPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // 🏠 จำลองข้อมูลรายการจุดหมายปลายทาง "บ้าน" 4 รายการตามดีไซน์ Figma
  const [destinations, setDestinations] = useState([
    { id: '1', title: 'บ้าน', date: '5 มี.ค. 2026', distance: '45.2 กม.', time: '10:30 น.' },
    { id: '2', title: 'บ้าน', date: '4 มี.ค. 2026', distance: '45.2 กม.', time: '10:30 น.' },
    { id: '3', title: 'บ้าน', date: '5 มี.ค. 2026', distance: '45.2 กม.', time: '10:30 น.' },
    { id: '4', title: 'บ้าน', date: '4 มี.ค. 2026', distance: '45.2 กม.', time: '10:30 น.' },
  ]);

  return (
    <View style={styles.container}>
      
      {/* 👤 Header ส่วนบน: ปุ่มย้อนกลับ, หัวข้อ, และปุ่มบวก */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.circularHeaderButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#475569" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>เลือกจุดหมายปลายทาง</Text>
        
        <TouchableOpacity style={styles.circularHeaderButton} activeOpacity={0.7}>
          <Ionicons name="add" size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* 🔍 กล่องค้นหาจุดหมายปลายทาง (Search Bar) */}
      <View style={styles.searchContainerWrapper}>
        <View style={styles.searchInnerBox}>
          <Ionicons name="location" size={20} color="#E53E3E" style={styles.pinIcon} />
          <TextInput
            style={styles.searchInputField}
            placeholder="ไปที่ไหน?"
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.mapIconBtn} activeOpacity={0.6}>
            <Ionicons name="map-outline" size={20} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 📜 รายการจุดหมายปลายทาง (Scrollable List) */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {destinations.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.destinationItemCard} 
            activeOpacity={0.9}
            onPress={() => router.push('/map')} // 🗺️ กดแล้วจะลิ้งก์ไปหน้าแผนที่ถัดไป (โฟลเดอร์ map ของพี่)
          >
            <View style={styles.cardInternalRow}>
              
              {/* ซีกซ้าย: ไอคอนรูปบ้านสีน้ำเงินเข้ม */}
              <View style={styles.homeIconBlueBox}>
                <Ionicons name="home" size={24} color="#FFF" />
              </View>

              {/* ซีกขวา: ข้อมูลรายละเอียดทั้งหมด */}
              <View style={styles.destinationDetailContent}>
                <View style={styles.titleAndArrowRow}>
                  <Text style={styles.destinationTitleText}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </View>
                
                {/* แถวข้อมูลสถิติย่อยด้านล่าง */}
                <View style={styles.metaDataInfoRow}>
                  <View style={styles.metaDataColumn}>
                    <Text style={styles.metaLabelText}>วันที่</Text>
                    <Text style={styles.metaValueText}>{item.date}</Text>
                  </View>
                  
                  <View style={styles.metaDataColumn}>
                    <Text style={styles.metaLabelText}>ระยะทาง</Text>
                    <Text style={styles.metaValueText}>{item.distance}</Text>
                  </View>
                  
                  <View style={styles.metaDataColumn}>
                    <Text style={styles.metaLabelText}>เวลา</Text>
                    <Text style={styles.metaValueText}>{item.time}</Text>
                  </View>
                </View>

              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', // พื้นหลังสีเทาอ่อน สบายตาอิงตาม Mockup
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 54,
    marginBottom: 16,
  },
  circularHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    // ทำเงาขอบปุ่มกลมด้านบน
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  searchContainerWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInnerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  pinIcon: {
    marginRight: 8,
  },
  searchInputField: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
    height: '100%',
  },
  mapIconBtn: {
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  destinationItemCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // ทำมิติเงาซ้อนหลังการ์ดแต่ละใบให้ลอยนูนสวยงาม
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardInternalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeIconBlueBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#34577C', // สีฟ้าน้ำเงินสไตล์ไอคอนบ้านในรูปดีไซน์
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  destinationDetailContent: {
    flex: 1,
  },
  titleAndArrowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  destinationTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34577C',
  },
  metaDataInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  metaDataColumn: {
    flexDirection: 'column',
  },
  metaLabelText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  metaValueText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
});