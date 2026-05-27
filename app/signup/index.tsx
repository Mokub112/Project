import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase'; 

export default function SignUpPage() {
  const router = useRouter();
  
  // 📝 รับค่า State ทั้ง 5 ช่องตามดีไซน์คู่แฝด
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔐 ฟังก์ชันจัดการสมัครสมาชิกผ่าน Supabase
  async function handleSignUp() {
    if (!username || !phone || !email || !password || !confirmPassword) {
      Alert.alert('กรุณากรอกข้อมูล', 'โปรดกรอกข้อมูลให้ครบถ้วนทุกช่องครับพี่');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'โปรดตรวจสอบรหัสผ่านทั้งสองช่องให้ตรงกันครับ');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            username: username.trim(),
            phone: phone.trim(),
          }
        }
      });

      if (error) {
        Alert.alert('สมัครสมาชิกไม่สำเร็จ', error.message);
        return;
      }

      Alert.alert('สำเร็จ 🎉', 'ระบบได้ส่งอีเมลยืนยันตัวตนไปให้ท่านแล้ว!');
      router.replace('/login');
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อระบบได้');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        {/* 📑 Tab สลับหน้าสไตล์เดียวกับหน้า Sign in เป๊ะๆ */}
        <View style={styles.tabHeader}>
          <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.6}>
            <Text style={styles.tabText}>Sign in</Text>
          </TouchableOpacity>
          <View>
            <Text style={[styles.tabText, styles.activeTab]}>Sign up</Text>
          </View>
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join us to start your journey</Text>

        {/* 👤 ช่องกรอก Username */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="your username"
            placeholderTextColor="#94A3B8"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        {/* 📞 ช่องกรอก Phone number */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="08X-XXX-XXXX"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* ✉️ ช่องกรอก Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your-email@gmail.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* 🔑 ช่องกรอก Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* 🔒 ช่องกรอก Confirm password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* 🔘 แถวปุ่ม Social และปุ่มวงกลมส่งข้อมูล */}
        <View style={styles.buttonRow}>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons name="logo-google" size={18} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons name="logo-facebook" size={18} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons name="logo-apple" size={18} color="#000000" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleSignUp} 
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Ionicons name="arrow-forward" size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

// 🎨 สไตล์แบบย่อขนาดความสูงกระชับ (ป้องกันอาการปุ่มตกขอบล่าง)
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', // สีสว่างคุมโทนสะอาดตาแบบหน้าล็อกอิน
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  card: { 
    width: '100%', 
    maxWidth: 400, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    paddingHorizontal: 28,
    paddingTop: 24,        // 🚀 ยุบขอบบนเข้าเล็กน้อย
    paddingBottom: 24,     // 🚀 ยุบขอบล่างเข้าเล็กน้อย
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, 
    shadowRadius: 12,
    elevation: 4 
  },
  tabHeader: { 
    flexDirection: 'row', 
    gap: 20, 
    marginBottom: 16       // 🚀 ลดระยะห่างใต้แถบแท็บสลับหน้า
  },
  tabText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#94A3B8' 
  },
  activeTab: { 
    color: '#0F172A', 
    borderBottomWidth: 2, 
    borderBottomColor: '#0F172A', 
    paddingBottom: 4 
  },
  title: { 
    fontSize: 26,          // 🚀 ปรับตัวใหญ่ประจำหน้าลงมาเล็กน้อย
    fontWeight: '700', 
    color: '#0F172A', 
    marginBottom: 4 
  },
  subtitle: { 
    fontSize: 13, 
    color: '#64748B', 
    marginBottom: 16       // 🚀 ปรับระยะห่างหลังคำอธิบายให้น้อยลง
  },
  inputContainer: { 
    marginBottom: 12       // 🚀 ปรับระยะช่องไฟระหว่างช่องกรอกให้ขยับชิดกันพองาม
  },
  inputLabel: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#475569', 
    marginBottom: 4 
  },
  input: { 
    width: '100%', 
    height: 42,            // 🚀 เปลี่ยนความสูงช่องกรอกจาก 48 เหลือ 42 เพื่อดึงพื้นที่คืนให้ปุ่มด้านล่าง
    backgroundColor: '#F1F5F9', 
    borderRadius: 10, 
    paddingHorizontal: 14, 
    fontSize: 14,
    color: '#0F172A'
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 8           // 🚀 ขยับแถวปุ่มขึ้นมาพอดีคำ
  },
  socialIcons: { 
    flexDirection: 'row', 
    gap: 12 
  },
  socialButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  actionButton: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#004368', // สีน้ำเงินเข้มตามดีไซน์หลัก
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#004368',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4
  },
});