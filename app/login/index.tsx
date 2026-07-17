import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('กรุณากรอกข้อมูล', 'โปรดกรอกอีเมลและรหัสผ่านให้ครบถ้วนครับพี่');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณากรอกอีเมลให้ถูกต้องตามรูปแบบ');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert('เข้าสู่ระบบไม่สำเร็จ', error.message);
        return;
      }

      if (data?.user) {
        // Session ถูกจัดการโดย Supabase client เอง (ต้องตั้งค่า
        // `storage: AsyncStorage` ตอนสร้าง client) หน้าอื่นที่ต้องเช็คว่า
        // login อยู่หรือไม่ ให้เรียก supabase.auth.getSession() แทนการเก็บ flag เอง
        router.replace('/permissions');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับระบบฐานข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }

  function handleSocialLogin(provider: string) {
    Alert.alert('เร็ว ๆ นี้', `การเข้าสู่ระบบด้วย ${provider} ยังไม่เปิดให้ใช้งานในตอนนี้`);
  }

  function handleForgotPassword() {
    if (!email.trim()) {
      Alert.alert('กรอกอีเมลก่อน', 'กรุณากรอกอีเมลของคุณในช่องด้านบน แล้วกดลืมรหัสผ่านอีกครั้ง');
      return;
    }
    Alert.alert('เร็ว ๆ นี้', 'ระบบรีเซ็ตรหัสผ่านยังไม่เปิดให้ใช้งานในตอนนี้');
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* ส่วนหัวของหน้า Login */}
          <View style={styles.tabHeader}>
            <Text style={[styles.tabText, styles.activeTab]}>Sign in</Text>
            <TouchableOpacity
              onPress={() => router.replace('/signup')}
              activeOpacity={0.6}
              disabled={loading}
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
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!loading}
            />
          </View>

          {/* 🔑 ช่องกรอก Password พร้อมปุ่มเปิด/ซ่อนตา */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ลิงก์ลืมรหัสผ่าน */}
          <TouchableOpacity
            style={styles.forgotContainer}
            activeOpacity={0.6}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* 🔘 ปุ่มกดล็อกอิน และ ปุ่มโซเชียล */}
          <View style={styles.buttonRow}>
            <View style={styles.socialIcons}>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => handleSocialLogin('Google')}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={20} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => handleSocialLogin('Facebook')}
                disabled={loading}
              >
                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => handleSocialLogin('Apple')}
                disabled={loading}
              >
                <Ionicons name="logo-apple" size={20} color="#000000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#0F172A',
  },
  eyeButton: {
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  loginButtonDisabled: {
    opacity: 0.6,
  },
});