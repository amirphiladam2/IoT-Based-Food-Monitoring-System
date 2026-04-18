import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { getGreetingTime, getCurrentDateFormatted } from '@/utils/time';

const Header = () => {
  const { user } = useAuth();
  
  // Extract name or fallback to part of email
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <View style={styles.container}>
      <View style={styles.glowPrimary} />
      <View style={styles.glowSecondary} />
      <View style={styles.topRow}>
        <View style={styles.textContainer}>
          <Text style={styles.date}>{getCurrentDateFormatted()}</Text>
          <Text style={styles.greeting}>{getGreetingTime()}</Text>
          <Text style={styles.name}>{displayName}</Text>
        </View>
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={52} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryChip}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.primary} />
          <Text style={styles.summaryLabel}>Food safety monitor</Text>
        </View>
        <Text style={styles.summaryText}>Live box insights and freshness checks in one place</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#F7FBFB',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  glowPrimary: {
    position: 'absolute',
    top: -80,
    left: -30,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#C8F4F2',
  },
  glowSecondary: {
    position: 'absolute',
    top: 30,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#E7FBF7',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  greeting: {
    fontSize: 18,
    color: '#567172',
    marginBottom: 4,
  },
  name: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 21,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(14, 142, 147, 0.08)',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarContainer: {
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryRow: {
    marginTop: 22,
    gap: 10,
  },
  summaryChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(14, 142, 147, 0.12)',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#506364',
    maxWidth: '92%',
  },
});

export default Header;
