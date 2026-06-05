import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

// 🗂️ กำหนด Interface มารองรับข้อมูลจริงจากฐานข้อมูลป้องกัน Type Error
interface MedicalProfile {
  underlying_disease?: string | null;
  regular_medication?: string | null;
  blood_group?: string | null;
  drug_allergy?: string | null;
  hospital?: string | null;
}

interface EmergencyContact {
  id?: string | number;
  name?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  phone_number?: string | null;
}

export default function MenuPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  
  // 🟢 State สำหรับเก็บข้อมูลทางการแพทย์จริง
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile>({
    underlying_disease: '',
    regular_medication: '',
    blood_group: '',
    drug_allergy: '',
    hospital: '',
  });

  // 🟢 State สำหรับเก็บรายชื่อผู้ติดต่อฉุกเฉินจากเบสจริง
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    async function fetchMenuData() {
      try {
        setLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;

        if (userId) {
          // 1. ดึงข้อมูลจากตาราง medical_profiles ของพี่จริง ๆ
          const { data: medData, error: medError } = await supabase
            .from('medical_profiles')
            .select('underlying_disease, regular_medication, blood_group, drug_allergy, hospital')
            .eq('user_id', userId)
            .single();

          if (!medError && medData) {
            setMedicalProfile(medData);
          }

          // 2. ดึงข้อมูลจากตาราง emergency_contacts ของพี่จริง ๆ
          const { data: contactData, error: contactError } = await supabase
            .from('emergency_contacts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

          if (!contactError && contactData) {
            setEmergencyContacts(contactData);
          }
        }
      } catch (error) {
        console.error('Error fetching data from DB:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMenuData();
  }, []);

  // 📞 ฟังก์ชันกดโทรออก
  const handleEmergencyCall = (phoneNumber: string | null | undefined) => {
    if (!phoneNumber) return;
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          if (Platform.OS === 'web') {
            window.alert(`ระบบจำลองการโทรไปยังเบอร์: ${phoneNumber}`);
          } else {
            Alert.alert('ผิดพลาด', 'อุปกรณ์ของคุณไม่รองรับการโทรศัพท์');
          }
        }
      })
      .catch((err) => console.error('Error calling:', err));
  };

  // 🚪 ฟังก์ชันออกจากระบบ
  const handleSignOut = async () => {
    const performSignOut = async () => {
      try {
        setLoading(true);
        await supabase.auth.signOut();
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.localStorage.removeItem('user_id');
          window.localStorage.removeItem('user_email');
        }
        router.replace('/login');
      } catch (error) {
        if (Platform.OS === 'web') {
          window.alert('เกิดข้อผิดพลาด ไม่สามารถออกจากระบบได้');
        } else {
          Alert.alert('ผิดพลาด', 'ไม่สามารถออกจากระบบได้');
        }
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) await performSignOut();
    } else {
      Alert.alert('ยืนยันการออกจากระบบ', 'คุณต้องการออกจากระบบใช่หรือไม่?', [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ออกจากระบบ', style: 'destructive', onPress: performSignOut },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004368" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]} 
      showsVerticalScrollIndicator={false}
    >
      
      <Text style={styles.mainHeaderTitle}>เมนู</Text>

      {/* 🏥 1. ข้อมูลทางการแพทย์ (ดึงจาก medical_profiles) */}
      <View style={styles.medicalCardWithBorder}>
        <Text style={styles.cardMainHeader}>ข้อมูลทางการแพทย์ (ฉุกเฉิน)</Text>
        
        <View style={styles.medDataRow}>
          <Text style={styles.medLabel}>โรคประจำตัว :</Text>
          <Text style={styles.medValue}>{medicalProfile.underlying_disease || '-'}</Text>
        </View>

        <View style={styles.medDataRow}>
          <Text style={styles.medLabel}>ยาประจำตัว :</Text>
          <Text style={styles.medValue}>{medicalProfile.regular_medication || '-'}</Text>
        </View>

        <View style={styles.medDataRow}>
          <Text style={styles.medLabel}>หมู่เลือด :</Text>
          <Text style={styles.medValue}>{medicalProfile.blood_group || '-'}</Text>
        </View>

        <View style={styles.medDataRow}>
          <Text style={styles.medLabel}>แพ้ยา :</Text>
          <Text style={styles.medValue}>{medicalProfile.drug_allergy || '-'}</Text>
        </View>

        <View style={styles.medDataRow}>
          <Text style={styles.medLabel}>โรงพยาบาลประจำ :</Text>
          <Text style={styles.medValue}>{medicalProfile.hospital || '-'}</Text>
        </View>
      </View>

      {/* 👥 2. ผู้ติดต่อฉุกเฉิน (ดึงจาก emergency_contacts) */}
      <View style={styles.contactCardWithBorder}>
        <Text style={styles.cardMainHeaderCenter}>ติดต่อ (ฉุกเฉิน)</Text>
        
        {emergencyContacts.length === 0 ? (
          <Text style={styles.emptyContactText}>ยังไม่มีรายชื่อผู้ติดต่อฉุกเฉิน</Text>
        ) : (
          emergencyContacts.map((contact, index) => (
            <View key={contact.id || index}>
              <View style={styles.contactRow}>
                <View style={styles.contactLeftBlock}>
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={22} color="#94A3B8" />
                  </View>
                  <View>
                    <Text style={styles.contactNameText}>{contact.name || contact.contact_name || 'ไม่ระบุชื่อ'}</Text>
                    <Text style={styles.contactPhoneText}>{contact.phone || contact.phone_number || '-'}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.callButtonCircle} 
                  onPress={() => handleEmergencyCall(contact.phone || contact.phone_number)} 
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
              {index < emergencyContacts.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))
        )}
      </View>

      {/* 🪪 3. เมนูคู่ขนาน */}
      <View style={styles.subMenuGridRow}>
        <TouchableOpacity style={styles.subGridButtonWithBorder} activeOpacity={0.8}>
          <Text style={styles.subGridButtonText}>ใบขับขี่</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.subGridButtonWithBorder} activeOpacity={0.8}>
          <Text style={styles.subGridButtonText}>ประกันภัย</Text>
        </TouchableOpacity>
      </View>

      {/* 🔴 4. ปุ่มออกจากระบบกว้างเต็ม 100% สวยงามตรงตามดีไซน์ */}
      <View style={styles.logoutWrapper}>
        <TouchableOpacity style={styles.dangerSignOutButton} onPress={handleSignOut} activeOpacity={0.85}>
          <Text style={styles.dangerSignOutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scrollContent: { padding: 20, paddingTop: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7FAFC' },
  mainHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', textAlign: 'center', marginBottom: 24 },
  medicalCardWithBorder: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#E2E8F0', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  cardMainHeader: { fontSize: 14, fontWeight: '700', color: '#334155', textAlign: 'center', marginBottom: 16 },
  cardMainHeaderCenter: { fontSize: 14, fontWeight: '700', color: '#334155', textAlign: 'center', marginBottom: 14 },
  medDataRow: { flexDirection: 'row', marginBottom: 8 },
  medLabel: { width: 125, fontSize: 13, fontWeight: '600', color: '#475569' },
  medValue: { flex: 1, fontSize: 13, fontWeight: '500', color: '#64748B' },
  contactCardWithBorder: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#E2E8F0', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  contactLeftBlock: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  contactNameText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  contactPhoneText: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 1 },
  callButtonCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#4CD964', alignItems: 'center', justifyContent: 'center', elevation: 1 },
  rowDivider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 10 },
  emptyContactText: { textAlign: 'center', color: '#94A3B8', fontSize: 13, paddingVertical: 10 },
  subMenuGridRow: { flexDirection: 'row', gap: 14, marginBottom: 32 },
  subGridButtonWithBorder: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4,
  },
  subGridButtonText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  logoutWrapper: { alignItems: 'center', width: '100%' },
  dangerSignOutButton: {
    backgroundColor: '#E53E3E', width: '100%', borderRadius: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  dangerSignOutText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});