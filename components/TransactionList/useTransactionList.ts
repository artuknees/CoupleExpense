'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, runTransaction } from 'firebase/firestore';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  payer: string;
  type: 'expense' | 'transfer';
  categoryName?: string | null;
  timestamp: any;
  userEmail?: string;
}

export function useTransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitCount, setLimitCount] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'), limit(limitCount + 1));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      if (docs.length <= limitCount) {
        setHasMore(false);
        setTransactions(docs);
      } else {
        setHasMore(true);
        setTransactions(docs.slice(0, limitCount));
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [limitCount]);

  const handleLoadMore = () => {
    setLimitCount(prev => prev + 20);
  };

  const handleDelete = async (t: Transaction) => {
    try {
      await runTransaction(db, async (transaction) => {
        const statusRef = doc(db, 'status', 'current');
        const statusDoc = await transaction.get(statusRef);
        
        let currentNet = 0;
        if (statusDoc.exists()) {
          const data = statusDoc.data();
          const amt = data.owedAmount || 0;
          const name = data.owedName;
          currentNet = Math.round((name === 'Cule' ? amt : -amt) * 100) / 100;
        }

        const change = Math.round((t.type === 'expense' ? t.amount / 2 : t.amount) * 100) / 100;
        const newNet = t.payer === 'Jen' ? currentNet - change : currentNet + change;
        const roundedNet = Math.round(newNet * 100) / 100;

        transaction.set(statusRef, {
          owedAmount: Math.abs(roundedNet),
          owedName: roundedNet >= 0 ? 'Cule' : 'Jen'
        });

        transaction.delete(doc(db, 'transactions', t.id));
      });
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting:', error);
      setDeletingId(null);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Transaction>) => {
    try {
      await runTransaction(db, async (transaction) => {
        const transactionRef = doc(db, 'transactions', id);
        const transactionDoc = await transaction.get(transactionRef);
        
        if (!transactionDoc.exists()) {
          throw new Error("Transaction does not exist!");
        }

        const oldData = transactionDoc.data() as Transaction;
        const newData = { ...oldData, ...updates };

        // If amount, payer or type changed, update the status
        if (updates.amount !== undefined || updates.payer !== undefined || updates.type !== undefined) {
          const statusRef = doc(db, 'status', 'current');
          const statusDoc = await transaction.get(statusRef);
          
          let currentNet = 0;
          if (statusDoc.exists()) {
            const data = statusDoc.data();
            const amt = data.owedAmount || 0;
            const name = data.owedName;
            currentNet = Math.round((name === 'Cule' ? amt : -amt) * 100) / 100;
          }

          // Reverse old transaction effect
          const oldChange = Math.round((oldData.type === 'expense' ? oldData.amount / 2 : oldData.amount) * 100) / 100;
          let netAfterReversal = oldData.payer === 'Jen' ? currentNet - oldChange : currentNet + oldChange;

          // Apply new transaction effect
          const newChange = Math.round((newData.type === 'expense' ? newData.amount / 2 : newData.amount) * 100) / 100;
          let newNet = newData.payer === 'Jen' ? netAfterReversal + newChange : netAfterReversal - newChange;
          
          const roundedNet = Math.round(newNet * 100) / 100;

          transaction.set(statusRef, {
            owedAmount: Math.abs(roundedNet),
            owedName: roundedNet >= 0 ? 'Cule' : 'Jen'
          });
        }

        transaction.update(transactionRef, updates);
      });
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error updating:', error);
      throw error;
    }
  };

  return {
    transactions,
    loading,
    hasMore,
    deletingId,
    setDeletingId,
    editingTransaction,
    setEditingTransaction,
    handleLoadMore,
    handleDelete,
    handleUpdate
  };
}
