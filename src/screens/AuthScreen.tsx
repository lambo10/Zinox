import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, SHADOWS } from '../theme/colors';
import { Mail, Lock, User, Briefcase, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { signInUser, signUpUser } from '../services/apiService';
import { triggerLocalNotification } from '../services/notificationService';

type AuthMode = 'signin' | 'signup';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    if (mode === 'signup' && (!name.trim() || !title.trim())) {
      Alert.alert('Required Fields', 'Please enter your full name and job title.');
      return;
    }

    setLoading(true);

    if (mode === 'signin') {
      const res = await signInUser(email.trim(), password.trim());
      setLoading(false);

      if (res.success) {
        triggerLocalNotification(
          'Welcome back to Zinox! ⚡',
          'Successfully authenticated with Supabase.'
        );
      } else {
        Alert.alert('Authentication Failed', res.error || 'Invalid credentials');
      }
    } else {
      const res = await signUpUser(
        email.trim(),
        password.trim(),
        name.trim(),
        title.trim()
      );
      setLoading(false);

      if (res.success) {
        triggerLocalNotification(
          'Welcome to Zinox! 🚀',
          'Your account has been created successfully. Loading your profile...'
        );
      } else {
        Alert.alert('Account Creation Failed', res.error || 'Could not create account');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Sparkles color="#FFFFFF" size={28} />
            </View>
            <Text style={styles.appName}>ZINOX</Text>
            <Text style={styles.tagline}>
              Work-Life Balance & Upskilling Super-App
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.authCard, SHADOWS.card]}>
            {/* Mode Switcher Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, mode === 'signin' && styles.activeTab]}
                onPress={() => setMode('signin')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, mode === 'signin' && styles.activeTabText]}>
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, mode === 'signup' && styles.activeTab]}
                onPress={() => setMode('signup')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            {mode === 'signup' && (
              <>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <User color={COLORS.textSecondary} size={18} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Alex Vance"
                      placeholderTextColor={COLORS.textMuted}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Job Title */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Job Title / Role</Text>
                  <View style={styles.inputWrapper}>
                    <Briefcase color={COLORS.textSecondary} size={18} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Senior Software Architect"
                      placeholderTextColor={COLORS.textMuted}
                      value={title}
                      onChangeText={setTitle}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </>
            )}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail color={COLORS.textSecondary} size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="alex.vance@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock color={COLORS.textSecondary} size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff color={COLORS.textSecondary} size={18} />
                  ) : (
                    <Eye color={COLORS.textSecondary} size={18} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {mode === 'signin' ? 'Sign In to Zinox' : 'Create Account'}
                  </Text>
                  <ArrowRight color="#FFFFFF" size={18} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Security Badge */}
          <View style={styles.securityBadge}>
            <ShieldCheck color={COLORS.success} size={14} />
            <Text style={styles.securityText}>
              Secured with Supabase Postgres Authentication
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  authCard: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    height: 48,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    marginLeft: 10,
    fontSize: 14,
  },
  eyeBtn: {
    padding: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 10,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  securityText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
