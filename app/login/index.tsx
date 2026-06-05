import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // 🚀 นำเข้า AsyncStorage เพื่อใช้แทน localStorage

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔐 ฟังก์ชันจัดการกดปุ่มล็อกอิน
  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('กรุณากรอกข้อมูล', 'โปรดกรอกอีเมลและรหัสผ่านให้ครบถ้วนครับพี่');
      return;
    }

    try {
      setLoading(true);
      
      // 1. ส่งข้อมูลไปล็อกอินกับ Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert('เข้าสู่ระบบไม่สำเร็จ', error.message);
        return;
      }

      if (data?.user) {
        // 🎯 2. จุดแก้ไขสำคัญ: เปลี่ยนจาก localStorage เป็น AsyncStorage เพื่อบันทึกข้อมูลลงสมาร์ทโฟนได้จริง ไม่เกิดอาการแอปค้าง
        await AsyncStorage.setItem('user_email', data.user.email ?? '');
        await AsyncStorage.setItem('user_id', data.user.id);
        
        // บันทึกสถานะการยืนยันสิทธิ์เบื้องต้นไว้ด้วย เพื่อป้องกันระบบความปลอดภัยดีดกลับหน้าล็อกอิน
        await AsyncStorage.setItem('user_session', 'authenticated');
        
        // 🚀 3. ย้ายหน้าไปยังหน้าขอสิทธิ์ตรวจจับหรือขั้นตอนถัดไปชั่วคราว
        router.replace('/permissions');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับระบบฐานข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* ส่วนหัวของหน้า Login */}
        <View style={styles.tabHeader}>
          <Text style={[styles.tabText, styles.activeTab]}>Sign in</Text>
          <TouchableOpacity 
            onPress={() => router.replace('/signup')} // 👈 ใช้ replace แทน push เพื่อทำลายประวัติเก่า ป้องกันวนลูปหน้าระบบ
            activeOpacity={0.6}
          >
            <Text style={styles.tabText}>Sign up</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Your journey continues here</Text>

        {/* 📧 ช่องกรอก Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your-email@gmail.com"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
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
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
        </View>

        {/* ลิงก์ลืมรหัสผ่าน */}
        <TouchableOpacity style={styles.forgotContainer} activeOpacity={0.6}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* 🔘 ปุ่มกดล็อกอิน และ ปุ่มโซเชียล */}
        <View style={styles.buttonRow}>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons name="logo-google" size={20} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons name="logo-apple" size={20} color="#000000" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  tabHeader: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTab: {
    color: '#0F172A',
    borderBottomWidth: 2,
    borderBottomColor: '#0F172A',
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0F172A',
  },
  forgotContainer: {
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#004368',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#004368',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});