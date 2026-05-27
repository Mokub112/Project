import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

// 🛠️ โหลดไลบรารีเฉพาะตอนที่รันบนมือถือเท่านั้น เพื่อป้องกันไม่ให้หน้าเว็บพัง
let MapView: any = View;
let Marker: any = View;
let MapViewDirections: any = View;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  const MapsObj = require('react-native-maps');
  MapView = MapsObj.default;
  Marker = MapsObj.Marker;
  PROVIDER_GOOGLE = MapsObj.PROVIDER_GOOGLE;
  MapViewDirections = require('react-native-maps-directions').default;
}

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

export default function MapPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const destName = (params.destination_name as string) || 'บ้าน';
  const destLat = params.lat ? parseFloat(params.lat as string) : 13.7563;
  const destLng = params.lng ? parseFloat(params.lng as string) : 100.5018;

  const [currentLocation] = useState({ latitude: 13.7367, longitude: 100.5231 });
  const [distance, setDistance] = useState('45.2');
  const [duration, setDuration] = useState('47');

  return (
    <View style={styles.container}>
      
      {/* 🗺️ ส่วนแสดงแผ่นแผนที่ */}
      {Platform.OS === 'web' ? (
        // 💻 สิ่งที่จะแสดงผลเมื่อเปิดบนหน้าเว็บ (Web Fallback) เพื่อไม่ให้บึ้ม
        <View style={styles.webMapPlaceholder}>
          <Ionicons name="map" size={64} color="#CBD5E1" />
          <Text style={styles.webMapText}>ระบบแผนที่ Google Maps จะแสดงผลสมบูรณ์เมื่อรันบนมือถือจริง</Text>
          <Text style={styles.webMapSubText}>กำลังนำทางไป: {destName}</Text>
        </View>
      ) : (
        // 📱 สิ่งที่จะแสดงผลบนมือถือเครื่องจริง
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: (currentLocation.latitude + destLat) / 2,
            longitude: (currentLocation.longitude + destLng) / 2,
            latitudeDelta: Math.abs(currentLocation.latitude - destLat) * 1.5,
            longitudeDelta: Math.abs(currentLocation.longitude - destLng) * 1.5,
          }}
        >
          <Marker coordinate={currentLocation} title="ที่อยู่ปัจจุบัน" />
          <Marker coordinate={{ latitude: destLat, longitude: destLng }} title={destName} pinColor="red" />
          
          <MapViewDirections
            origin={currentLocation}
            destination={{ latitude: destLat, longitude: destLng }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#000000"
            onReady={(result: any) => {
              setDistance(result.distance.toFixed(1));
              setDuration(Math.ceil(result.duration).toString());
            }}
          />
        </MapView>
      )}

      {/* 🔙 ปุ่มย้อนกลับ */}
      <TouchableOpacity style={styles.backButtonCircle} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#475569" />
      </TouchableOpacity>

      {/* 🪟 กล่องแสดงที่อยู่ด้านบน */}
      <View style={styles.topRouteCard}>
        <View style={styles.routeRow}>
          <View style={[styles.statusDot, { backgroundColor: '#4CD964' }]} />
          <Text style={styles.routeLabel} numberOfLines={1}>จาก: <Text style={styles.routeValue}>ที่อยู่ปัจจุบัน</Text></Text>
        </View>
        <View style={styles.routeLineKink} />
        <View style={styles.routeRow}>
          <View style={[styles.statusDot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.routeLabel} numberOfLines={1}>ไป: <Text style={styles.routeValue}>{destName}</Text></Text>
        </View>
      </View>

      {/* 🗂️ แผงควบคุมข้อมูลด้านล่าง */}
      <View style={styles.bottomSheetCard}>
        <View style={styles.sheetHandle} />
        
        <View style={styles.driverProfileRow}>
          <View style={styles.driverLeftBlock}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }} 
              style={styles.driverAvatar} 
            />
            <View>
              <Text style={styles.driverNameText}>หมูกระทะคือนิพพาน</Text>
              <Text style={styles.driverSubText}>ผู้ขับขี่</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.searchRestBtn}>
            <Text style={styles.searchRestText}>ค้นหาจุดพัก</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsMetricsRow}>
          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>ความเร็ว</Text>
            <Text style={styles.metricValue}>110 <Text style={styles.metricUnit}>กม./ชม.</Text></Text>
          </View>
          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>ระยะทาง</Text>
            <Text style={styles.metricValue}>{distance} <Text style={styles.metricUnit}>กม.</Text></Text>
          </View>
          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>เวลา</Text>
            <Text style={styles.metricValue}>{duration} <Text style={styles.metricUnit}>นาที</Text></Text>
          </View>
        </View>

        <View style={styles.actionButtonRow}>
          <TouchableOpacity style={styles.slideEndButton} activeOpacity={0.85}>
            <View style={styles.questionCircleBadge}>
              <Text style={styles.questionText}>?</Text>
            </View>
            <Text style={styles.slideEndText}>สไลด์เพื่อสิ้นสุดการเดินทาง</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emergencyRedBtn} activeOpacity={0.85}>
            <Text style={styles.emergencyText}>เหตุฉุกเฉิน</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E2E8F0' },
  map: { width: width, height: height },
  webMapPlaceholder: { flex: 1, height: height, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EDF2F7', paddingHorizontal: 40 },
  webMapText: { fontSize: 14, fontWeight: '700', color: '#64748B', textAlign: 'center', marginTop: 16 },
  webMapSubText: { fontSize: 13, color: '#94A3B8', marginTop: 6, fontWeight: '500' },
  backButtonCircle: {
    position: 'absolute', top: 54, left: 16, width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', zIndex: 10,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  topRouteCard: {
    position: 'absolute', top: 96, left: 20, right: 20, backgroundColor: '#FFF',
    borderRadius: 18, padding: 16, zIndex: 5, borderWidth: 1, borderColor: '#EDF2F7',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  routeLabel: { fontSize: 12, color: '#718096', fontWeight: '500' },
  routeValue: { color: '#1A202C', fontWeight: '700' },
  routeLineKink: { width: 1, height: 16, backgroundColor: '#E2E8F0', marginLeft: 3, marginVertical: 2 },
  bottomSheetCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF',
    borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.1, shadowRadius: 12,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
  driverProfileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  driverLeftBlock: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#CBD5E1' },
  driverNameText: { fontSize: 13, fontWeight: '700', color: '#1A202C' },
  driverSubText: { fontSize: 11, color: '#A0AEC0', fontWeight: '500', marginTop: 1 },
  searchRestBtn: { backgroundColor: '#004368', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  searchRestText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  statsMetricsRow: { flexDirection: 'row', backgroundColor: '#F7FAFC', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 10, marginBottom: 20 },
  metricColumn: { flex: 1, alignItems: 'center' },
  metricLabel: { fontSize: 11, color: '#718096', fontWeight: '600', marginBottom: 4 },
  metricValue: { fontSize: 22, fontWeight: '800', color: '#1A202C' },
  metricUnit: { fontSize: 11, color: '#718096', fontWeight: '500' },
  actionButtonRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  slideEndButton: {
    flex: 1, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#4CD964',
    flexDirection: 'row', alignItems: 'center', paddingLeft: 4, gap: 10,
  },
  questionCircleBadge: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#4CD964', alignItems: 'center', justifyContent: 'center' },
  questionText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  slideEndText: { color: '#4CD964', fontSize: 12, fontWeight: '700' },
  emergencyRedBtn: { backgroundColor: '#FF3B30', height: 48, borderRadius: 24, paddingHorizontal: 22, justifyContent: 'center', alignItems: 'center' },
  emergencyText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});