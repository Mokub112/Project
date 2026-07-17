import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

interface EmergencyContactInput {
  id?: string | number; // ถ้ามีใน DB จะมี id เป็น string/number ถ้าเป็นของใหม่ที่ยังไม่ได้บันทึกอาจยังไม่มี
  contact_name: string;
  phone_number: string;
}

export default function EditMenuPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  // สเตตฟอร์ม ข้อมูลทางการแพทย์
  const [congenitalDisease, setCongenitalDisease] = useState('');
  const [regularMedication, setRegularMedication] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [drugAllergy, setDrugAllergy] = useState('');
  const [regularHospital, setRegularHospital] = useState('');

  // สเตตฟอร์ม รายชื่อติดต่อฉุกเฉิน
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContactInput[]>([]);

  useEffect(() => {
    async function loadCurrentData() {
      try {
        setLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUid = sessionData?.session?.user?.id;

        if (currentUid) {
          setUserId(currentUid);

          // ดึงข้อมูลการแพทย์เดิม
          const { data: medData } = await supabase
            .from('medical_profiles')
            .select('*')
            .eq('user_id', currentUid)
            .maybeSingle();

          if (medData) {
            setCongenitalDisease(medData.congenital_disease || '');
            setRegularMedication(medData.regular_medication || '');
            setBloodGroup(medData.blood_group || '');
            setDrugAllergy(medData.drug_allergy || '');
            setRegularHospital(medData.regular_hospital || '');
          }

          // ดึงผู้ติดต่อฉุกเฉินเดิม
          const { data: contactData } = await supabase
            .from('emergency_contacts')
            .select('id, contact_name, phone_number')
            .eq('user_id', currentUid)
            .order('created_at', { ascending: true });

          if (contactData) {
            setEmergencyContacts(contactData);
          }
        }
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCurrentData();
  }, []);

  // ฟังก์ชันเพิ่มฟิลด์ผู้ติดต่อใหม่เปล่าๆ ในหน้าจอ
  const addNewContactField = () => {
    setEmergencyContacts([...emergencyContacts, { contact_name: '', phone_number: '' }]);
  };

  // ฟังก์ชันอัปเดตข้อความในฟิลด์ผู้ติดต่อตาม Index
  const updateContactValue = (index: number, key: 'contact_name' | 'phone_number', value: string) => {
    const updated = [...emergencyContacts];
    updated[index][key] = value;
    setEmergencyContacts(updated);
  };

  // ฟังก์ชันลบผู้ติดต่อออกจากหน้าจอลิสต์
  const removeContactField = (index: number) => {
    const updated = [...emergencyContacts];
    updated.splice(index, 1);
    setEmergencyContacts(updated);
  };

  // ฟังก์ชันบันทึกข้อมูลทั้งหมดลงฐานข้อมูล
  const handleSaveAll = async () => {
    if (!userId) return;

    try {
      setSaving(true);

      // 1. บันทึก/อัปเดต ข้อมูลทางการแพทย์ (ใช้ upsert)
      const { error: medError } = await supabase
        .from('medical_profiles')
        .upsert({
          user_id: userId,
          congenital_disease: congenitalDisease,
          regular_medication: regularMedication,
          blood_group: bloodGroup,
          drug_allergy: drugAllergy,
          regular_hospital: regularHospital,
        }, { onConflict: 'user_id' });

      if (medError) throw medError;

      // 2. จัดการข้อมูลผู้ติดต่อฉุกเฉิน (วิธีที่ปลอดภัยและง่ายที่สุด: ลบของเก่าออกทั้งหมดก่อน แล้วกรอกข้อมูลชุดล่าสุดเข้าไปใหม่)
      const { error: deleteError } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // คัดกรองรายชื่อเฉพาะตัวที่มีการพิมพ์ชื่อหรือเบอร์ติดต่อจริง ไม่บันทึกฟิลด์เปล่า
      const validContacts = emergencyContacts
        .filter(c => c.contact_name.trim() !== '' || c.phone_number.trim() !== '')
        .map(c => ({
          user_id: userId,
          contact_name: c.contact_name.trim(),
          phone_number: c.phone_number.trim(),
        }));

      if (validContacts.length > 0) {
        const { error: insertError } = await supabase
          .from('emergency_contacts')
          .insert(validContacts);

        if (insertError) throw insertError;
      }

      if (Platform.OS === 'web') {
        window.alert('บันทึกข้อมูลเรียบร้อยแล้ว');
      } else {
        Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว');
      }
      router.back(); // พากลับไปหน้าหลัก
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#004368" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* ส่วนหัวหน้าจอ */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>แก้ไขข้อมูลโปรไฟล์ฉุกเฉิน</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ฟอร์มข้อมูลทางการแพทย์ */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🏥 ข้อมูลทางการแพทย์</Text>

        <Text style={styles.inputLabel}>โรคประจำตัว</Text>
        <TextInput
          style={styles.textInput}
          placeholder="ระบุโรคประจำตัว (ถ้ามี)"
          value={congenitalDisease}
          onChangeText={setCongenitalDisease}
        />

        <Text style={styles.inputLabel}>ยาประจำตัว</Text>
        <TextInput
          style={styles.textInput}
          placeholder="ระบุชื่อยาและขนาดที่ต้องทานประจำ"
          value={regularMedication}
          onChangeText={setRegularMedication}
        />

        <Text style={styles.inputLabel}>หมู่เลือด</Text>
        <TextInput
          style={styles.textInput}
          placeholder="เช่น A, B, O, AB"
          value={bloodGroup}
          onChangeText={setBloodGroup}
        />

        <Text style={styles.inputLabel}>ประวัติแพ้ยา</Text>
        <TextInput
          style={styles.textInput}
          placeholder="ระบุชื่อยาที่แพ้ (ถ้ามี)"
          value={drugAllergy}
          onChangeText={setDrugAllergy}
        />

        <Text style={styles.inputLabel}>โรงพยาบาลประจำ</Text>
        <TextInput
          style={styles.textInput}
          placeholder="โรงพยาบาลหลักที่เข้ารับการรักษา"
          value={regularHospital}
          onChangeText={setRegularHospital}
        />
      </View>

      {/* ฟอร์มผู้ติดต่อฉุกเฉิน */}
      <View style={styles.sectionCard}>
        <View style={styles.contactHeaderRow}>
          <Text style={styles.sectionTitle}>👥 ผู้ติดต่อฉุกเฉิน</Text>
          <TouchableOpacity style={styles.addContactButton} onPress={addNewContactField}>
            <Ionicons name="add-circle" size={18} color="#004368" />
            <Text style={styles.addContactText}>เพิ่มรายชื่อ</Text>
          </TouchableOpacity>
        </View>

        {emergencyContacts.length === 0 ? (
          <Text style={styles.emptyAlertText}>ไม่มีรายชื่อผู้ติดต่อ กรุณากดเพิ่มรายชื่อด้านบน</Text>
        ) : (
          emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactItemBlock}>
              <View style={styles.contactItemHeader}>
                <Text style={styles.contactIndexText}>บุคคลที่ {index + 1}</Text>
                <TouchableOpacity onPress={() => removeContactField(index)}>
                  <Ionicons name="trash-outline" size={18} color="#E53E3E" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.textInput}
                placeholder="ชื่อผู้ติดต่อ / ความสัมพันธ์"
                value={contact.contact_name || ''}
                onChangeText={(text) => updateContactValue(index, 'contact_name', text)}
              />

              <TextInput
                style={styles.textInput}
                placeholder="เบอร์โทรศัพท์ติดต่อ"
                keyboardType="phone-pad"
                value={contact.phone_number || ''}
                onChangeText={(text) => updateContactValue(index, 'phone_number', text)}
              />
            </View>
          ))
        )}
      </View>

      {/* ปุ่มกดบันทึกข้อมูล */}
      <TouchableOpacity 
        style={[styles.saveButton, saving && { opacity: 0.7 }]} 
        onPress={handleSaveAll}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={styles.saveButtonText}>บันทึกข้อมูลทั้งหมด</Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scrollContent: { padding: 20, paddingTop: 40, paddingBottom: 60 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 4 },
  textInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 10, fontSize: 13, color: '#334155', marginBottom: 12 },
  contactHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addContactButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  addContactText: { fontSize: 11, fontWeight: '700', color: '#004368' },
  contactItemBlock: { borderLeftWidth: 3, borderLeftColor: '#004368', paddingLeft: 12, marginBottom: 16 },
  contactItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  contactIndexText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  emptyAlertText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', paddingVertical: 14 },
  saveButton: { backgroundColor: '#004368', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 2 },
  saveButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});