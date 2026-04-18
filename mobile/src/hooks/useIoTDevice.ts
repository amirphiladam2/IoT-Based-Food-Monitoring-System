import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type DeviceData = {
  temperature: number;
  humidity: number;
  gas: number;
  status: "Fresh" | "Warning" | "Spoiled";
  timestamp: string;
};

export type DeviceConnectionState = 'unpaired' | 'waiting' | 'connected' | 'stale' | 'error';

const DEVICE_OFFLINE_THRESHOLD_MS = 5 * 60 * 1000;

function normalizeTimestamp(timestamp: unknown): string {
  if (!timestamp) {
    return '';
  }

  if (typeof timestamp === 'string') {
    return timestamp;
  }

  if (timestamp instanceof Date) {
    return Number.isNaN(timestamp.getTime()) ? '' : timestamp.toISOString();
  }

  if (
    typeof timestamp === 'object' &&
    timestamp !== null &&
    'toDate' in timestamp &&
    typeof (timestamp as { toDate?: () => Date }).toDate === 'function'
  ) {
    const date = (timestamp as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }

  return '';
}

function isDeviceReadingFresh(timestamp: string): boolean {
  if (!timestamp) {
    return false;
  }

  const parsedDate = new Date(timestamp);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return Math.abs(Date.now() - parsedDate.getTime()) <= DEVICE_OFFLINE_THRESHOLD_MS;
}

export function useIoTDevice(userId: string | undefined | null) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Listen for User's linked device_id
  useEffect(() => {
    if (!userId) {
      setDeviceId(null);
      setDeviceData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const userUnsub = onSnapshot(doc(db, 'users', userId), (userDoc) => {
      if (userDoc.exists()) {
        const dId = userDoc.data().device_id;
        setDeviceId(dId || null);
        if (!dId) {
          setDeviceData(null);
          setLoading(false); // Finished loading but no device found
        }
      } else {
        setDeviceId(null);
        setDeviceData(null);
        setLoading(false);
      }
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => userUnsub();
  }, [userId]);

  // 2. Listen to device's real-time data stream
  useEffect(() => {
    // If no deviceId loaded yet, clear data and return
    if (!deviceId) {
      setDeviceData(null);
      return;
    }

    setLoading(true);
    setError(null);
    const deviceUnsub = onSnapshot(doc(db, 'devices', deviceId), (devDoc) => {
      if (devDoc.exists()) {
        const rawData = devDoc.data() as Partial<DeviceData> & { timestamp?: unknown };
        setDeviceData({
          temperature: rawData.temperature ?? 0,
          humidity: rawData.humidity ?? 0,
          gas: rawData.gas ?? 0,
          status: rawData.status ?? 'Fresh',
          timestamp: normalizeTimestamp(rawData.timestamp),
        });
      } else {
        setDeviceData(null);
      }
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => deviceUnsub();
  }, [deviceId]);

  const isConnected = Boolean(deviceId && deviceData?.timestamp && isDeviceReadingFresh(deviceData.timestamp));
  let connectionState: DeviceConnectionState = 'unpaired';

  if (error) {
    connectionState = 'error';
  } else if (!deviceId) {
    connectionState = 'unpaired';
  } else if (!deviceData?.timestamp) {
    connectionState = 'waiting';
  } else if (isConnected) {
    connectionState = 'connected';
  } else {
    connectionState = 'stale';
  }

  return { deviceId, deviceData, loading, error, isConnected, connectionState };
}
