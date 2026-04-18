import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type HistoricalDataNode = {
  gas: number;
  temperature: number;
  humidity: number;
  timestamp: string; // ISO or formatted
};

export function useIoTHistory(deviceId: string | null) {
  const [historyData, setHistoryData] = useState<HistoricalDataNode[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) {
       setHistoryData([]);
       setLoadingHistory(false);
       return;
    }

    setLoadingHistory(true);

    // Query food_sensor_data logs specific to this device
    // Fetch last 15 readings ordered newest to oldest
    const q = query(
      collection(db, 'food_sensor_data'),
      where('device_id', '==', deviceId),
      orderBy('timestamp', 'desc'),
      limit(15)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const dataNodes: HistoricalDataNode[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        let formattedTime = "";
        
        // Handle Firestore timestamps cleanly
        if (d.timestamp?.toDate) {
            const dateObj = d.timestamp.toDate();
            formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        dataNodes.push({
          gas: d.gas || 0,
          temperature: d.temperature || 0,
          humidity: d.humidity || 0,
          timestamp: formattedTime
        });
      });

      // Reverse so it graphs chronologically (oldest left -> newest right)
      setHistoryData(dataNodes.reverse());
      setLoadingHistory(false);
    }, (err) => {
      console.error("Error fetching history: ", err);
      setErrorHistory(err.message);
      setLoadingHistory(false);
    });

    return () => unsub();
  }, [deviceId]);

  return { historyData, loadingHistory, errorHistory };
}
