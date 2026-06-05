import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// สร้างอินเตอร์เฟซระบุประเภทข้อมูลสำหรับรองรับการเพิ่มพิกัดจริง
interface Destination {
  id: string;
  title: string;
  date: string;
  distance: string;
  time: string;
}

export default function DestinationPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // 🎯 เคลียร์ค่าก้อนอาร์เรย์สมมติทิ้งทั้งหมด เพื่อให้หน้าจอเริ่มต้นว่างเปล่าคลีน ๆ ตามสั่งครับพี่!
  const [destinations, setDestinations] = useState<Destination[]>([]);

  // ฟังก์ชันจำลองสำหรับปุ่มกดเครื่องหมายบวก (+) เพื่อเพิ่มจุดหมายใหม่เข้าสเตทจริง
  const handleAddNewDestination = () => {
    const newPlace: Destination = {
      id: Date.now().toString(),
      title: 'จุดหมายใหม่ที่บันทึก',
      date: 'วันนี้',
      distance: '0.0 กม.',
      time: '--:-- น.'
    };
    setDestinations([newPlace, ...destinations]);
  };

  // Logic ระบบค้นหา: ทำงานกลั่นกรองแบบ Real-time เช่นเดิม
  const filteredDestinations = destinations.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      {/* 👤 Header ส่วนบน: จัดการปุ่มย้อนกลับให้คงที่ปลอดภัย */}
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.circularHeaderButton} 
          onPress={() => router.replace('/(tabs)')} 
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#475569" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>เลือกจุดหมายปลายทาง</Text>
        
        {/* ปุ่มบวกสำหรับเพิ่มพิกัดทางลัด */}
        <TouchableOpacity 
          style={styles.circularHeaderButton} 
          activeOpacity={0.7}
          onPress={handleAddNewDestination}
        >
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
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={{ marginRight: 8 }}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.mapIconBtn} 
            activeOpacity={0.6}
            onPress={() => router.push('/map')}
          >
            <Ionicons name="map-outline" size={20} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 📜 รายการจุดหมายปลายทาง (Scrollable List) */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {destinations.length === 0 ? (
          // 🌟 กรณีที่ 1: หน้าจอคลีนบริสุทธิ์ ยังไม่มีข้อมูลใด ๆ ในเครื่องเลย
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="map-outline" size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyMainText}>ยังไม่มีประวัติจุดหมายปลายทาง</Text>
            <Text style={styles.emptySubText}>คุณสามารถค้นหาตำแหน่งด้านบน หรือกดปุ่มเครื่องหมายบวกเพื่อบันทึกสถานที่โปรดได้ครับ</Text>
            
            <TouchableOpacity 
              style={styles.addFirstPlaceBtn}
              activeOpacity={0.8}
              onPress={handleAddNewDestination}
            >
              <Ionicons name="add-circle-outline" size={18} color="#FFF" />
              <Text style={styles.addFirstPlaceText}>เพิ่มจุดหมายแรก</Text>
            </TouchableOpacity>
          </View>
        ) : filteredDestinations.length > 0 ? (
          // กรณีที่ 2: มีข้อมูลประวัติการบันทึกอยู่ และแสดงผลการกรองค้นหาตามจริง
          filteredDestinations.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.destinationItemCard} 
              activeOpacity={0.7}
              onPress={() => router.push('/map')} 
            >
              <View style={styles.cardInternalRow}>
                
                <View style={styles.homeIconBlueBox}>
                  <Ionicons 
                    name={item.title.includes('บ้าน') ? "home" : "location-sharp"} 
                    size={22} 
                    color="#FFF" 
                  />
                </View>

                <View style={styles.destinationDetailContent}>
                  <View style={styles.titleAndArrowRow}>
                    <Text style={styles.destinationTitleText}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </View>
                  
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
          ))
        ) : (
          // กรณีที่ 3: ผู้ใช้พิมพ์ค้นหาชื่อสถานที่อยู่ แต่ระบบค้นหาในอาร์เรย์แล้วไม่พบคำตรงกัน
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={44} color="#94A3B8" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyMainText}>ไม่พบจุดหมายปลายทางที่ค้นหา</Text>
            <Text style={styles.emptySubText}>ลองตรวจสอบตัวอักษรหรือพิมพ์ใหม่อีกครั้งครับพี่</Text>
          </View>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', 
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
    backgroundColor: '#34577C', 
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyMainText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  addFirstPlaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#004368',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
  },
  addFirstPlaceText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});