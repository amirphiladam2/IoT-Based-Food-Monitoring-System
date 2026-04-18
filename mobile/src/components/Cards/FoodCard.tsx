import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { formatRelativeTime } from '@/utils/time';
import { Ionicons } from '@expo/vector-icons';
import { DeviceConnectionState } from '@/hooks/useIoTDevice';

export type FoodStatus = 'Fresh' | 'Warning' | 'Spoiled' | 'Waiting';

export type FoodItemType = {
  id: string;
  name: string;
  status: FoodStatus;
  temperature: number | null;
  humidity: number | null;
  gasLevel: number | null;
  lastUpdated: string;
  isConnected: boolean;
  connectionState: DeviceConnectionState;
};

const getStatusColor = (status: FoodStatus) => {
  switch (status) {
    case 'Fresh': return '#4CAF50'; // Green
    case 'Warning': return '#FFC107'; // Yellow
    case 'Spoiled': return '#F44336'; // Red
    case 'Waiting': return '#F59E0B'; // Amber
    default: return Colors.gray;
  }
};

function formatMetricValue(value: number | null, suffix: string) {
  if (value === null) {
    return `--${suffix}`;
  }

  return `${value}${suffix}`;
}

const FoodCard = ({ item }: { item: FoodItemType }) => {
  const statusColor = getStatusColor(item.status);
  const freshnessCopy =
    item.connectionState === 'waiting'
      ? 'Hardware paired. Waiting for the first live reading from the cloud.'
    : item.connectionState === 'error'
      ? 'There is a sync issue between the app and cloud data.'
    : !item.isConnected
      ? 'Showing the latest saved readings while the box is offline.'
      : item.status === 'Fresh'
      ? 'Conditions look stable and safe.'
      : item.status === 'Warning'
        ? 'Freshness risk is rising. Check soon.'
        : 'Immediate attention needed for this box.';
  const updateLabel = item.connectionState === 'connected'
    ? 'Updated'
    : item.connectionState === 'waiting'
      ? 'Status'
      : 'Last recorded';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>Live Environment</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description}>{freshnessCopy}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <View style={[styles.metricIcon, { backgroundColor: '#FFF4E8' }]}>
            <Ionicons name="thermometer-outline" size={16} color="#F97316" />
          </View>
          <Text style={styles.metricValue}>{formatMetricValue(item.temperature, '°C')}</Text>
          <Text style={styles.metricLabel}>Temp</Text>
        </View>
        <View style={styles.metric}>
          <View style={[styles.metricIcon, { backgroundColor: '#ECFEFF' }]}>
            <Ionicons name="water-outline" size={16} color={Colors.primary} />
          </View>
          <Text style={styles.metricValue}>{formatMetricValue(item.humidity, '%')}</Text>
          <Text style={styles.metricLabel}>Humidity</Text>
        </View>
        <View style={styles.metric}>
          <View style={[styles.metricIcon, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="flask-outline" size={16} color={statusColor} />
          </View>
          <Text style={styles.metricValue}>
            {item.gasLevel === null ? '--' : item.gasLevel} {item.gasLevel === null ? null : <Text style={styles.metricUnit}>ppm</Text>}
          </Text>
          <Text style={styles.metricLabel}>Gas</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.updateText}>{updateLabel} {formatRelativeTime(item.lastUpdated)}</Text>
        <View style={styles.devicePill}>
          <Ionicons name="cube-outline" size={12} color="#64748B" />
          <Text style={styles.devicePillText}>{item.id}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(14, 142, 147, 0.08)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 12,
  },
  titleWrap: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 10,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  updateText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  devicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  devicePillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
  },
});

export default FoodCard;
