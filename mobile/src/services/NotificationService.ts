import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Configuration for how notifications surface when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(userId: string) {
  let token;

  // For Android, notification channels are required
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0E8E93',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      // Gets the native FCM token (rather than the Expo token) so direct lambda push works flawlessly
      token = (await Notifications.getDevicePushTokenAsync()).data;
      
      if (token && userId) {
        // Save to Firestore under the current user's document
        await setDoc(doc(db, 'users', userId), { fcm_token: token }, { merge: true });
        console.log("FCM Token saved to Firestore:", token);
      }
    } catch (e) {
      console.error("Error fetching or saving FCM Token: ", e);
    }
    
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
