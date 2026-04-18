import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useLinkedDeviceId(userId: string | undefined | null) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setDeviceId(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(doc(db, 'users', userId), (userDoc) => {
      if (userDoc.exists()) {
        setDeviceId(userDoc.data().device_id || null);
      } else {
        setDeviceId(null);
      }

      setLoading(false);
    }, (snapshotError) => {
      setError(snapshotError.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { deviceId, loading, error };
}
