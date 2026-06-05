import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Platform, Alert, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

let MapView: any = View;
let Marker: any = View;
let MapViewDirections: any = View;
let PROVIDER_GOOGLE: any = null;
let Location: any = null;

if (Platform.OS !== 'web') {
  const MapsObj = require('react-native-maps');
  MapView = MapsObj.default;
  Marker = MapsObj.Marker;
  PROVIDER_GOOGLE = MapsObj.PROVIDER_GOOGLE;
  MapViewDirections = require('react-native-maps-directions').default;
  Location = require('expo-location');
}

const { width, height } = Dimensions.get('window');
// ⚠️ ใส่คีย์ Google Maps ของพี่ตรงนี้ เพื่อให้ระบบคำนวณระยะทาง/เวลาทำงานได้จริงนะครับ
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE'; 

export default function MapPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const destName = (params.destination_name as string) || 'จุดหมายปลายทาง';
  const destLat = params.lat ? parseFloat(params.lat as string) : 13.7563;
  const destLng = params.lng ? parseFloat(params.lng as string) : 100.5018;

  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // 🎯 ปรับปรุงจุดนี้: เคลียร์ค่าเริ่มต้นจากเดิม 45.2 และ 47 ให้สตาร์ทที่ 0 ทั้งหมด!
  const [speed, setSpeed] = useState<number>(0);
  const [distance, setDistance] = useState<string>('0.0');
  const [duration, setDuration] = useState<string>('0');
  const [loadingLocation, setLoadingLocation] = useState(true);

  const pan = useRef(new Animated.ValueXY()).current;
  const SWIPEABLE_LIMIT = 160; 

  // 🛰️ ระบบดึงพิกัดและเฝ้าติดตามความเร็วรถสด ๆ ผ่าน GPS (Live Tracking)
  useEffect(() => {
    let locationSubscription: any = null;

    async function startLocationTracking() {
      if (Platform.OS === 'web') {
        setCurrentLocation({ latitude: 13.7367, longitude: 100.5231 });
        setSpeed(0);
        setLoadingLocation(false);
        return;
      }

      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCurrentLocation({ latitude: 13.7367, longitude: 100.5231 });
          setLoadingLocation(false);
          return;
        }

        // ดึงตำแหน่งครั้งแรกเพื่อปักหมุดเปิดแผ่นแผนที่
        let initialLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCurrentLocation({
          latitude: initialLoc.coords.latitude,
          longitude: initialLoc.coords.longitude,
        });
        setLoadingLocation(false);

        // 🏎️ ฟังก์ชัน Watch: จับการขยับเขยื้อนของตัวรถเพื่อดึงความเร็วเรียลไทม์
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000, // อัปเดตข้อมูลความเร็วทุก ๆ 2 วินาที
            distanceInterval: 1, // หรือขยับรถทุก ๆ 1 เมตร
          },
          (loc: any) => {
            // อัปเดตพิกัดปัจจุบันบนแผ่นที่ตามรถที่กำลังวิ่ง
            setCurrentLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });

            // คำนวณความเร็ว (ค่าจากระบบจะเป็นเมตรต่อวินาที m/s ต้องคูณ 3.6 เพื่อแปลงเป็น กม./ชม.)
            if (loc.coords.speed && loc.coords.speed > 0) {
              const kmh = Math.round(loc.coords.speed * 3.6);
              setSpeed(kmh);
            } else {
              setSpeed(0); // ถ้ารถจอดติดไฟแดงหรือจอดนิ่ง ๆ ให้ความเร็วเป็น 0 กม./ชม.
            }
          }
        );

      } catch (err) {
        console.error(err);
        setCurrentLocation({ latitude: 13.7367, longitude: 100.5231 });
        setLoadingLocation(false);
      }
    }

    startLocationTracking();

    // เคลียร์หน่วยความจำและปิดสตรีม GPS เมื่อผู้ใช้ปิดหน้าจอนี้ออกไป
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // ตัวจับการรูดสไลด์จบงาน
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx <= SWIPEABLE_LIMIT) {
          pan.x.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx >= SWIPEABLE_LIMIT - 30) {
          Animated.timing(pan.x, { toValue: SWIPEABLE_LIMIT, duration: 100, useNativeDriver: false }).start(() => {
            Alert.alert('สิ้นสุดการเดินทาง', 'ระบบบันทึกเวลาและรายงานการขับขี่เรียบร้อยแล้วครับ', [
              { 
                text: 'ตกลง', 
                onPress: () => {
                  pan.x.setValue(0);
                  router.replace('/(tabs)');
                } 
              }
            ]);
          });
        } else {
          Animated.spring(pan.x, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  function handleEmergency() {
    Alert.alert('ติดต่อเหตุฉุกเฉิน', 'คุณต้องการโทรออกสายด่วน 191 หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'โทรทันที', style: 'destructive' }
    ]);
  }

  return (
    <View style={styles.container}>
      
      {/* 🗺️ แผ่นแผนที่ */}
      {Platform.OS === 'web' ? (
        <View style={styles.webMapPlaceholder}>
          <Ionicons name="map" size={64} color="#CBD5E1" />
          <Text style={styles.webMapText}>ระบบแผนที่ Google Maps จะแสดงผลสมบูรณ์เมื่อรันบนมือถือจริง</Text>
          <Text style={styles.webMapSubText}>กำลังนำทางไป: {destName}</Text>
        </View>
      ) : loadingLocation || !currentLocation ? (
        <View style={styles.webMapPlaceholder}>
          <Text style={styles.webMapText}>กำลังตรวจสอบสัญญาณ GPS นำทางสักครู่ครับพี่...</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: (currentLocation.latitude + destLat) / 2,
            longitude: (currentLocation.longitude + destLng) / 2,
            latitudeDelta: Math.abs(currentLocation.latitude - destLat) * 1.8,
            longitudeDelta: Math.abs(currentLocation.longitude - destLng) * 1.8,
          }}
        >
          <Marker coordinate={currentLocation} title="ตำแหน่งของคุณ" />
          <Marker coordinate={{ latitude: destLat, longitude: destLng }} title={destName} pinColor="red" />
          
          {GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' && (
            <MapViewDirections
              origin={currentLocation}
              destination={{ latitude: destLat, longitude: destLng }}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={4}
              strokeColor="#004368"
              onReady={(result: any) => {
                setDistance(result.distance.toFixed(1));
                setDuration(Math.ceil(result.duration).toString());
              }}
            />
          )}
        </MapView>
      )}

      {/* 🔙 ปุ่มย้อนกลับ */}
      <TouchableOpacity style={styles.backButtonCircle} onPress={() => router.replace('/(tabs)')}>
        <Ionicons name="chevron-back" size={22} color="#475569" />
      </TouchableOpacity>

      {/* 🪟 บล็อกระบุเส้นทางด้านบน */}
      <View style={styles.topRouteCard}>
        <View style={styles.routeRow}>
          <View style={[styles.statusDot, { backgroundColor: '#4CD964' }]} />
          <Text style={styles.routeLabel} numberOfLines={1}>จาก: <Text style={styles.routeValue}>ตำแหน่งปัจจุบันของคุณ</Text></Text>
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
          <TouchableOpacity style={styles.searchRestBtn} activeOpacity={0.7}>
            <Text style={styles.searchRestText}>ค้นหาจุดพัก</Text>
          </TouchableOpacity>
        </View>

        {/* 📊 บล็อกแสดงสถิติเรียงค่าความจริง (ความเร็วรถจะซิงค์ตาม GPS จริงแล้วครับ) */}
        <View style={styles.statsMetricsRow}>
          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>ความเร็ว</Text>
            <Text style={styles.metricValue}>{speed} <Text style={styles.metricUnit}>กม./ชม.</Text></Text>
          </View>
          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>ระยะทาง</Text>
            <Text style={styles.metricValue}>{distance} <Text style={styles.metricUnit}>กม.</Text></Text>
          </View>
          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>เวลาเหลือ</Text>
            <Text style={styles.metricValue}>{duration} <Text style={styles.metricUnit}>นาที</Text></Text>
          </View>
        </View>

        <View style={styles.actionButtonRow}>
          <View style={styles.slideEndButtonContainer}>
            <Text style={styles.slideEndBackgroundText} numberOfLines={1}>
              สไลด์เพื่อสิ้นสุดภารกิจ
            </Text>
            <Animated.View 
              style={[styles.questionCircleBadge, { transform: [{ translateX: pan.x }] }]}
              {...panResponder.panHandlers}
            >
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </Animated.View>
          </View>

          <TouchableOpacity style={styles.emergencyRedBtn} activeOpacity={0.85} onPress={handleEmergency}>
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
  actionButtonRow: { flexDirection: 'row', gap: 12, alignItems: 'center', width: '100%' },
  slideEndButtonContainer: {
    flex: 1, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#4CD964',
    backgroundColor: '#F0FDF4', justifyContent: 'center', position: 'relative', overflow: 'hidden'
  },
  slideEndBackgroundText: { position: 'absolute', left: 52, color: '#4CD964', fontSize: 11, fontWeight: '700', zIndex: 1 },
  questionCircleBadge: { 
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#4CD964', 
    alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 2, zIndex: 2
  },
  emergencyRedBtn: { backgroundColor: '#FF3B30', height: 48, borderRadius: 24, paddingHorizontal: 22, justifyContent: 'center', alignItems: 'center' },
  emergencyText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});