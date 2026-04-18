import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Linking } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import SettingsCard, { SettingsCardItem } from '../../components/Cards/SettingsCard';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useLinkedDeviceId } from '../../hooks/useLinkedDeviceId';

const PORTFOLIO_URL = 'https://amiradam.tech';
const DEFAULT_EMAIL_TEXT = 'No email associated';
const NO_DEVICE_TEXT = 'No device linked';
const LOADING_DEVICE_TEXT = 'Loading device...';
const ACCOUNT_STATUS_TEXT = 'Active & Secure';
const DISPLAY_NAME_PLACEHOLDER = 'Enter Display Name';
const INVALID_DISPLAY_NAME_MESSAGE = 'Display Name cannot be completely blank.';
const MAX_DISPLAY_NAME_LENGTH = 20;

function getInitialDisplayName(displayName?: string | null, email?: string | null) {
  if (displayName?.trim()) {
    return displayName.trim();
  }

  if (email) {
    return email.split('@')[0];
  }

  return '';
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

const Profile = () => {
  const { user, logout } = useAuth();
  const { deviceId: linkedDeviceId, loading: loadingDeviceId } = useLinkedDeviceId(user?.uid);
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const profileEmail = user?.email ?? DEFAULT_EMAIL_TEXT;
  const pairedDeviceLabel = loadingDeviceId
    ? LOADING_DEVICE_TEXT
    : linkedDeviceId ?? NO_DEVICE_TEXT;

  const overviewItems: SettingsCardItem[] = [
    {
      iconName: 'hardware-chip',
      iconColor: '#4CAF50',
      iconBackgroundColor: 'rgba(76, 175, 80, 0.15)',
      label: 'Paired Hardware',
      value: pairedDeviceLabel,
      trailingIconName: linkedDeviceId ? 'checkmark-circle' : undefined,
      trailingIconColor: '#4CAF50',
    },
    {
      iconName: 'shield-checkmark',
      iconColor: '#2196F3',
      iconBackgroundColor: 'rgba(33, 150, 243, 0.15)',
      label: 'Account Status',
      value: ACCOUNT_STATUS_TEXT,
      valueColor: '#2196F3',
    },
  ];
  const developerItems: SettingsCardItem[] = [
    {
      iconName: 'code-slash-outline',
      iconColor: Colors.primary,
      iconBackgroundColor: 'rgba(14, 142, 147, 0.12)',
      label: 'Developer',
      value: 'Amir P. Adam',
      trailingIconName: 'open-outline',
    },
  ];

  useEffect(() => {
    setDisplayName(getInitialDisplayName(user?.displayName, user?.email));
  }, [user?.displayName, user?.email]);

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;

    const trimmedDisplayName = displayName.trim();
    if (!trimmedDisplayName) {
      Alert.alert('Invalid Input', INVALID_DISPLAY_NAME_MESSAGE);
      return;
    }

    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: trimmedDisplayName });
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const unlinkDevice = async () => {
    if (!user?.uid || !linkedDeviceId) return;

    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { device_id: '' }, { merge: true });
      Alert.alert('Unpaired', 'Hardware successfully disconnected.');
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleUnpair = () => {
    if (!user?.uid || !linkedDeviceId) return;

    Alert.alert(
      'Unpair Hardware?',
      'Are you sure you want to disconnect from this Smart Box? You will stop receiving alerts immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unpair', style: 'destructive', onPress: unlinkDevice },
      ]
    );
  };

  const handleOpenPortfolio = async () => {
    try {
      const canOpenPortfolio = await Linking.canOpenURL(PORTFOLIO_URL);
      if (!canOpenPortfolio) {
        throw new Error('Cannot open portfolio URL');
      }

      await Linking.openURL(PORTFOLIO_URL);
    } catch {
      Alert.alert('Unable to Open Link', `Please visit ${PORTFOLIO_URL} manually.`);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Ionicons name="person" size={50} color={Colors.background} />
          </View>
          
          {isEditing ? (
            <View style={styles.editRow}>
              <TextInput 
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
                placeholder={DISPLAY_NAME_PLACEHOLDER}
                placeholderTextColor={Colors.gray}
                maxLength={MAX_DISPLAY_NAME_LENGTH}
              />
              <TouchableOpacity onPress={handleSaveProfile} disabled={saving} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>{saving ? '...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.editRow}>
              <Text style={styles.nameText}>{displayName}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editIcon}>
                <Ionicons name="pencil" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.emailText}>{profileEmail}</Text>
        </View>

        <SettingsCard items={overviewItems} />

        <View style={[styles.sectionCard, styles.sectionSpacing]}>
          <Text style={styles.settingsHeader}>Manage Account</Text>
          {linkedDeviceId ? (
            <TouchableOpacity style={styles.settingRow} onPress={handleUnpair} disabled={saving}>
              <Ionicons name="link-sharp" size={22} color="#F44336" />
              <Text style={[styles.settingText, styles.dangerText]}>
                Unpair Device ({linkedDeviceId})
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.settingRow}>
              <Ionicons name="link-outline" size={22} color={Colors.gray} />
              <Text style={[styles.settingText, styles.mutedText]}>No device to unpair</Text>
            </View>
          )}
        </View>

        <SettingsCard
          items={developerItems}
          style={styles.developerCard}
          onPress={handleOpenPortfolio}
        />

        <View style={styles.actionContainer}>
          <PrimaryButton 
            title="Logout" 
            onPress={logout}
            color="#FFF0F0"
            textColor="#F44336"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 35,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40, // consistent height to prevent layout jumps
  },
  nameText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  editIcon: {
    marginLeft: 10,
    backgroundColor: 'rgba(14, 142, 147, 0.1)',
    padding: 6,
    borderRadius: 20,
  },
  input: {
    backgroundColor: Colors.light,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    width: 200,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 10,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emailText: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  settingsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
  },
  settingText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    marginLeft: 14,
  },
  mutedText: {
    color: Colors.gray,
  },
  dangerText: {
    color: '#F44336',
  },
  actionContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  sectionSpacing: {
    marginTop: 20,
  },
  developerCard: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(14, 142, 147, 0.1)',
  },
});
