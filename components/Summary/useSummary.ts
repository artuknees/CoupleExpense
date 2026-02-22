'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDocs, writeBatch } from 'firebase/firestore';

interface SummaryData {
  culeOwes: number;
  jenOwes: number;
}

export function useSummary() {
  const [summary, setSummary] = useState<SummaryData>({ culeOwes: 0, jenOwes: 0 });
  const [syncing, setSyncing] = useState(false);
  const [showConfirmSync, setShowConfirmSync] = useState(false);
  const [showConfirmSettle, setShowConfirmSettle] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'status', 'current'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const amt = data.owedAmount || 0;
        const name = data.owedName;
        
        setSummary({
          jenOwes: name === 'Jen' ? amt : 0,
          culeOwes: name === 'Cule' ? amt : 0
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSettleUp = async () => {
    setSyncing(true);
    setShowConfirmSettle(false);
    try {
      const snapshot = await getDocs(collection(db, 'transactions'));
      const batch = writeBatch(db);
      
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const statusRef = doc(db, 'status', 'current');
      batch.set(statusRef, { 
        owedAmount: 0, 
        owedName: 'Jen' // Default
      });

      await batch.commit();
      
      setSyncMessage('Settled up successfully!');
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (error) {
      console.error('Settle up error:', error);
      setSyncMessage('Settle up failed.');
      setTimeout(() => setSyncMessage(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setShowConfirmSync(false);
    try {
      const snapshot = await getDocs(collection(db, 'transactions'));
      let netBalance = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const amount = Number(data.amount);
        const payer = data.payer;
        const type = data.type;

        const change = type === 'expense' ? amount / 2 : amount;
        if (payer === 'Jen') netBalance += change;
        else netBalance -= change;
      });

      const statusRef = doc(db, 'status', 'current');
      const roundedBalance = Math.round(Math.abs(netBalance) * 100) / 100;
      await writeBatch(db)
        .set(statusRef, { 
          owedAmount: roundedBalance, 
          owedName: netBalance >= 0 ? 'Cule' : 'Jen' 
        })
        .commit();
      
      setSyncMessage('Recalculation complete!');
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncMessage('Sync failed. Please try again.');
      setTimeout(() => setSyncMessage(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const netBalance = summary.culeOwes - summary.jenOwes;
  const whoOwes = netBalance > 0 ? 'Cule' : 'Jen';
  const absoluteBalance = Math.abs(netBalance);

  return {
    summary,
    syncing,
    showConfirmSync,
    setShowConfirmSync,
    showConfirmSettle,
    setShowConfirmSettle,
    syncMessage,
    handleSync,
    handleSettleUp,
    whoOwes,
    absoluteBalance
  };
}
