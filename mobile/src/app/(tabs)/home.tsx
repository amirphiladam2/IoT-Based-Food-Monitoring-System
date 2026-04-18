import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView, Alert, TextInput, Vibration, Modal, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../components/Dashboard/Header';
import DeviceStatus from '../../components/Dashboard/DeviceStatus';
import FoodCard, { FoodItemType } from '../../components/Cards/FoodCard';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useIoTDevice } from '../../hooks/useIoTDevice';
import { useIoTHistory } from '../../hooks/useIoTHistory';
import HistoryChart from '../../components/Dashboard/HistoryChart';
import { registerForPushNotificationsAsync } from '../../services/NotificationService';
import * as Notifications from 'expo-notifications';
import { CameraView, useCameraPermissions } from 'expo-camera';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const ALERT_COOLDOWN_MS = 10 * 60 * 1000;

const Home = () => {
  const { user } = useAuth();
  const { deviceId, deviceData, loading, error, isConnected, connectionState } = useIoTDevice(user?.uid);
  const { historyData } = useIoTHistory(deviceId);
  
  // Scanners and Hardware
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [linking, setLinking] = useState(false);
  const [pairingInput, setPairingInput] = useState('');

  // Register for notifications precisely when the home screen loads with a valid user
  useEffect(() => {
    if (user?.uid) {
      registerForPushNotificationsAsync(user.uid);
    }
  }, [user?.uid]);

  // Local Notification Fallback Triggers for Hardware Processing
  const lastAlertedGas = useRef<number>(0);
  const lastAlertedTemp = useRef<number>(0);

  useEffect(() => {
    // Ignore cached values once the device is offline so stale snapshots can't fire alerts.
    if (!isConnected) {
      return;
    }

    const gasValue = deviceData?.gas || 0;
    const tempValue = deviceData?.temperature || 0;
    const now = Date.now();

    // Gas Alert with Notification Fatigue Prevention
    if (gasValue >= 100) {
      if (now - lastAlertedGas.current >= ALERT_COOLDOWN_MS) {
        lastAlertedGas.current = now;
        Notifications.scheduleNotificationAsync({
          content: {
            title: "🚨Alert: Food Spoiling!",
            body: `Critical gas levels detected (${gasValue} ppm). Please secure the food box!`,
            sound: "default",
          },
          trigger: null,
        });
      }
    }

    // Temp Alert with Notification Fatigue Prevention
    if (tempValue >= 35) {
      if (now - lastAlertedTemp.current >= ALERT_COOLDOWN_MS) {
        lastAlertedTemp.current = now;
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Alert: High Temperature!",
            body: `Temperature breached safe levels (${tempValue}°C). Please secure the food box!`,
            sound: "default",
          },
          trigger: null,
        });
      }
    }
  }, [deviceData?.gas, deviceData?.temperature, isConnected]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (!user?.uid) return;
    setIsScanning(false);
    Vibration.vibrate(400); // Haptic feedback on physical scan
    
    const cleanData = data.trim();

    // Block invalid QR formats (URLs, Slashes) from blowing up the Firestore path architecture
    if (cleanData.includes('/') || cleanData.toLowerCase().startsWith('http')) {
      Alert.alert(
        "Invalid QR Code", 
        "You accidentally scanned a Website URL!\n\nPlease select the 'Plain Text' option in the QR Generator and type exactly your device ID (e.g. ESP32_Node_1)."
      );
      return;
    }

    setLinking(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { device_id: cleanData }, { merge: true });
      Alert.alert("Hardware Linked!", `Successfully synchronized to ${cleanData} instantly.`);
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        Alert.alert(
          "Unrecognized Device",
          `The device ID "${cleanData}" is invalid or unavailable. Please check your QR code or manual input.`
        );
      } else {
        Alert.alert("Linking Failed", e?.message ?? 'Something went wrong while linking your hardware.');
      }
    } finally {
      setLinking(false);
      setPairingInput('');
    }
  };

  const handleManualLink = async () => {
    if (!user?.uid) return;
    const cleanInput = pairingInput.trim();
    if (!cleanInput) {
      Alert.alert("Invalid Input", "Please enter your exact Hardware Device ID to pair.");
      return;
    }
    handleBarcodeScanned({ data: cleanInput }); // Reuse same function pipeline natively
  };

  let content;

  if (loading) {
    content = (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.messageText}>Connecting to Backend...</Text>
      </View>
    );
  } else if (error) {
    content = (
      <View style={styles.centerContainer}>
        <Text style={[styles.messageText, { color: 'red' }]}>Connection Error:</Text>
        <Text style={styles.messageText}>{error}</Text>
      </View>
    );
  } else if (!deviceId) {
    // LINK DEVICE SCREEN STATE
    content = (
      <ScrollView 
        contentContainerStyle={styles.setupScrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
          {/* Modals require Native Core Rebuild */}
            {isScanning && (
              <Modal animationType="slide" visible={isScanning} presentationStyle="fullScreen">
                <View style={StyleSheet.absoluteFillObject}>
                  <CameraView 
                     style={StyleSheet.absoluteFillObject} 
                     facing="back"
                     barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                     onBarcodeScanned={handleBarcodeScanned}
                  />
                  <View style={[StyleSheet.absoluteFillObject, styles.scannerOverlay]}>
                    <Text style={styles.scannerTitle}>Scan IoT QR Label</Text>
                    <View style={styles.scannerSquare} />
                    <TouchableOpacity style={styles.cancelScanBtn} onPress={() => setIsScanning(false)}>
                       <Text style={styles.cancelScanText}>Cancel Setup</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}

            {/* Scan UI Core */}
            <View style={styles.setupCard}>
              <View style={styles.setupIcon}>
                <Ionicons name="cube-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.title}>Link your smart box</Text>
              <Text style={styles.subMessageText}>
                Connect the QR code or serial ID on your hardware to start live freshness tracking, alerts, and history charts.
              </Text>

              <View style={styles.setupFeatureRow}>
                <View style={styles.setupFeaturePill}>
                  <Ionicons name="flash-outline" size={14} color={Colors.primary} />
                  <Text style={styles.setupFeatureText}>Instant pairing</Text>
                </View>
                <View style={styles.setupFeaturePill}>
                  <Ionicons name="notifications-outline" size={14} color={Colors.primary} />
                  <Text style={styles.setupFeatureText}>Spoilage alerts</Text>
                </View>
              </View>

              <View style={styles.setupActions}>
               {!permission?.granted ? (
                   <PrimaryButton 
                      title="Grant Camera Permissions" 
                      onPress={requestPermission} 
                   />
               ) : (
                   <TouchableOpacity style={styles.scanBtn} onPress={() => setIsScanning(true)}>
                      <Ionicons name="qr-code-outline" size={32} color="#FFF" />
                      <Text style={styles.scanBtnText}>Scan QR Code</Text>
                   </TouchableOpacity>
               )}

               <View style={styles.orDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.dividerLine} />
               </View>

               <TextInput
                 style={styles.pairInput}
                 placeholder="Manual Serial ID (e.g., ESP32_Node_2)"
                 placeholderTextColor={Colors.gray}
                 value={pairingInput}
                 onChangeText={setPairingInput}
                 autoCapitalize="none"
                 autoCorrect={false}
               />
               <PrimaryButton 
                  title={linking ? "Pairing..." : "Connect Manually"} 
                  onPress={handleManualLink} 
               />
              </View>
            </View>
          </ScrollView>
    );
  } else {
    // DASHBOARD STATE (Even if waiting for first sync!)
    
    // Dynamic Gas Threshold Logic
    const gasValue = deviceData?.gas ?? null;
    let derivedStatus: FoodItemType['status'] = 'Waiting';

    if (gasValue !== null) {
      if (gasValue >= 100) {
        derivedStatus = "Spoiled"; // 100+ ppm
      } else if (gasValue >= 30) {
        derivedStatus = "Warning"; // 30 - 99 ppm
      } else {
        derivedStatus = "Fresh";
      }
    }

    const mappedBoxData: FoodItemType = {
      id: deviceId,
      name: `Smart Box (${deviceId.split('_').pop() || deviceId})`,
      status: derivedStatus,
      temperature: deviceData?.temperature ?? null,
      humidity: deviceData?.humidity ?? null,
      gasLevel: gasValue,
      lastUpdated: deviceData?.timestamp || 'Waiting for first reading...',
      isConnected,
      connectionState,
    };

    content = (
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        <FoodCard item={mappedBoxData} />
        <HistoryChart historyData={historyData} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Header />
      <DeviceStatus 
        connectionState={connectionState}
        lastSync={deviceData?.timestamp || "Awaiting Data"} 
      />
      <View style={styles.contentViewport}>
        {content}
        {!loading && !error ? (
          <LinearGradient
            colors={['#F2F7F7', 'rgba(242,247,247,0.88)', 'rgba(242,247,247,0)']}
            pointerEvents="none"
            style={styles.scrollFade}
          />
        ) : null}
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F7F7',
  },
  listContainer: {
    paddingBottom: 28,
    paddingTop: 14,
  },
  contentViewport: {
    flex: 1,
    position: 'relative',
  },
  scrollFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  messageText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  subMessageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
  },
  setupScrollContent: {
    flexGrow: 1,
    paddingBottom: 64,
    paddingTop: 34,
    paddingHorizontal: 20,
  },
  setupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 26,
    borderWidth: 1,
    borderColor: 'rgba(14, 142, 147, 0.08)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  setupIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#ECFEFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  setupFeatureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  setupFeaturePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
  },
  setupFeatureText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  setupActions: {
    marginTop: 28,
  },
  pairInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  scanBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scanBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    marginHorizontal: 15,
    color: Colors.gray,
    fontWeight: 'bold',
    fontSize: 14,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    top: 100,
  },
  scannerSquare: {
    width: 250,
    height: 250,
    borderWidth: 4,
    borderColor: '#4CAF50',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  cancelScanBtn: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: '#F44336',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  cancelScanText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
