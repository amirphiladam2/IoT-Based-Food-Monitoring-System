const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const GAS_WARNING_THRESHOLD = 30;
const GAS_SPOILED_THRESHOLD = 100;

// Initialize Firebase only once to avoid Lambda warm-start issues
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

function parseEventPayload(event) {
  if (typeof event === 'string') {
    try {
      return JSON.parse(event);
    } catch {
      return {};
    }
  }

  if (!event || typeof event !== 'object') {
    return {};
  }

  if ('body' in event) {
    const { body } = event;

    if (typeof body === 'string') {
      try {
        return JSON.parse(body);
      } catch {
        return {};
      }
    }

    if (body && typeof body === 'object') {
      return body;
    }
  }

  return event;
}

function toFiniteNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

function getDeviceStatus(gasValue) {
  if (gasValue >= GAS_SPOILED_THRESHOLD) {
    return 'Spoiled';
  }

  if (gasValue >= GAS_WARNING_THRESHOLD) {
    return 'Warning';
  }

  return 'Fresh';
}

exports.handler = async (event) => {
  const payload = parseEventPayload(event);
  console.log('Received IoT sensor data:', JSON.stringify(payload, null, 2));

  try {
    const deviceId = typeof payload.device_id === 'string' ? payload.device_id.trim() : '';
    const temperature = toFiniteNumber(payload.temperature);
    const humidity = toFiniteNumber(payload.humidity);
    const gas = toFiniteNumber(payload.gas ?? payload.gas_level);

    if (!deviceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'device_id is required.',
        }),
      };
    }

    if (temperature === null || humidity === null || gas === null) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'temperature, humidity, and gas must be numeric values.',
        }),
      };
    }

    const sensorData = {
      device_id: deviceId,
      temperature,
      humidity,
      gas,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 1. Update the Real-time Dashboard state in the `devices` collection
    await db.collection('devices').doc(deviceId).set({
      temperature,
      humidity,
      gas,
      status: getDeviceStatus(gas),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log(`Real-time data updated for device: ${deviceId}`);

    // 2. Append to Historical records in `food_sensor_data` collection
    const writeResult = await db.collection('food_sensor_data').add(sensorData);
    console.log(`Sensor history saved with ID: ${writeResult.id}`);

    // 3. Notification Dispatch if threshold exceeded
    let notificationSent = false;
    let notificationWarning = null;

    if (gas >= GAS_SPOILED_THRESHOLD) {
      console.log(`Gas threshold exceeded: ${gas}`);

      const usersSnapshot = await db.collection('users').where('device_id', '==', deviceId).limit(1).get();

      if (usersSnapshot.empty) {
        notificationWarning = `No user linked to device_id: ${deviceId}`;
        console.warn(notificationWarning);
      } else {
        const userDoc = usersSnapshot.docs[0];
        const { fcm_token: fcmToken } = userDoc.data();

        if (!fcmToken) {
          notificationWarning = `Missing fcm_token for user: ${userDoc.id}`;
          console.warn(notificationWarning);
        } else {
          try {
            const message = {
              notification: {
                title: 'Spoilage Alert!',
                body: `High gas level detected (${gas}). Please check your food storage immediately.`,
              },
              token: fcmToken,
            };

            const pushResult = await admin.messaging().send(message);
            console.log('FCM push sent successfully:', pushResult);
            notificationSent = true;
          } catch (pushError) {
            notificationWarning = pushError instanceof Error
              ? pushError.message
              : 'Failed to send push notification.';
            console.error('FCM push failed:', pushError);
          }
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Sensor data processed successfully.',
        documentId: writeResult.id,
        notificationSent,
        ...(notificationWarning ? { notificationWarning } : {}),
      }),
    };
  } catch (error) {
    console.error('Error processing sensor data:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to process sensor data.',
        error: error.message,
      }),
    };
  }
};
