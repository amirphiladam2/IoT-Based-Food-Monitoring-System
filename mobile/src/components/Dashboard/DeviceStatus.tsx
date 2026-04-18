import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from '@/utils/time';
import { DeviceConnectionState } from '@/hooks/useIoTDevice';

const CONNECTED_COLOR = '#1F8F5F';
const CONNECTED_DOT_COLOR = '#22C55E';
const WAITING_COLOR = '#B45309';
const WAITING_DOT_COLOR = '#F59E0B';
const DISCONNECTED_COLOR = '#DC2626';
const DISCONNECTED_DOT_COLOR = '#EF4444';
const ERROR_COLOR = '#7C3AED';
const ERROR_DOT_COLOR = '#8B5CF6';

type DeviceStatusProps = {
  connectionState: DeviceConnectionState;
  lastSync: string;
};

type DeviceStatusPresentation = {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconWrapStyle: object;
  statusText: string;
  statusColor: string;
  dotColor: string;
};

function getStatusPresentation(connectionState: DeviceConnectionState): DeviceStatusPresentation {
  switch (connectionState) {
    case 'connected':
      return {
        iconName: 'wifi',
        iconColor: CONNECTED_COLOR,
        iconWrapStyle: styles.iconWrapConnected,
        statusText: 'ESP32 Connected',
        statusColor: CONNECTED_COLOR,
        dotColor: CONNECTED_DOT_COLOR,
      };
    case 'waiting':
      return {
        iconName: 'time-outline',
        iconColor: WAITING_COLOR,
        iconWrapStyle: styles.iconWrapWaiting,
        statusText: 'Paired, waiting for data',
        statusColor: WAITING_COLOR,
        dotColor: WAITING_DOT_COLOR,
      };
    case 'error':
      return {
        iconName: 'alert-circle-outline',
        iconColor: ERROR_COLOR,
        iconWrapStyle: styles.iconWrapError,
        statusText: 'Sync error',
        statusColor: ERROR_COLOR,
        dotColor: ERROR_DOT_COLOR,
      };
    case 'stale':
      return {
        iconName: 'wifi-outline',
        iconColor: DISCONNECTED_COLOR,
        iconWrapStyle: styles.iconWrapOffline,
        statusText: 'No recent cloud update',
        statusColor: DISCONNECTED_COLOR,
        dotColor: DISCONNECTED_DOT_COLOR,
      };
    case 'unpaired':
    default:
      return {
        iconName: 'link-outline',
        iconColor: DISCONNECTED_COLOR,
        iconWrapStyle: styles.iconWrapOffline,
        statusText: 'No paired device',
        statusColor: DISCONNECTED_COLOR,
        dotColor: DISCONNECTED_DOT_COLOR,
      };
  }
}

const DeviceStatus = ({ connectionState, lastSync }: DeviceStatusProps) => {
  const syncedLabel = formatRelativeTime(lastSync);
  const statusPresentation = getStatusPresentation(connectionState);

  return (
    <View style={styles.container}>
      <View style={styles.statusInfo}>
        <View style={[styles.iconWrap, statusPresentation.iconWrapStyle]}>
          <Ionicons
            name={statusPresentation.iconName}
            size={18}
            color={statusPresentation.iconColor}
          />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.label}>Device connection</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: statusPresentation.statusColor }]}>
              {statusPresentation.statusText}
            </Text>
            <View style={[styles.statusDot, { backgroundColor: statusPresentation.dotColor }]} />
          </View>
        </View>
      </View>
      <View style={styles.syncPill}>
        <Text style={styles.syncLabel}>Last sync</Text>
        <Text style={styles.syncText}>{syncedLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -6,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(14, 142, 147, 0.08)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapConnected: {
    backgroundColor: '#E8FFF4',
  },
  iconWrapWaiting: {
    backgroundColor: '#FFF7ED',
  },
  iconWrapOffline: {
    backgroundColor: '#FEF2F2',
  },
  iconWrapError: {
    backgroundColor: '#F5F3FF',
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncPill: {
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  syncLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
    fontWeight: '600',
  },
  syncText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
});

export default DeviceStatus;
