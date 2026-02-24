'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, runTransaction, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const PARTNERS = ['Cule', 'Jen'] as const;
type Partner = (typeof PARTNERS)[number];

export function useTransactionForm() {
  const { user, defaultPayer } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [payer, setPayer] = useState<Partner>(defaultPayer);
  const [type, setType] = useState<'expense' | 'transfer'>('expense');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPayer(defaultPayer);
  }, [defaultPayer]);

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Math.round(Number(amount) * 100) / 100;
    if (!amount || isNaN(numAmount) || !user) return;

    setLoading(true);
    setError(null);
    try {
      const category = categories.find(c => c.id === categoryId);
      
      await runTransaction(db, async (transaction) => {
        const statusRef = doc(db, 'status', 'current');
        const statusDoc = await transaction.get(statusRef);
        
        const transRef = doc(collection(db, 'transactions'));
        const formattedDescription = description.trim();

        transaction.set(transRef, {
          amount: numAmount,
          description: formattedDescription,
          payer,
          type,
          categoryId: type === 'expense' ? categoryId : null,
          categoryName: type === 'expense' ? (category?.name || null) : null,
          timestamp: Timestamp.fromDate(new Date(date + 'T12:00:00')),
          userId: user.uid,
          userEmail: user.email
        });

        let currentNet = 0;
        if (statusDoc.exists()) {
          const data = statusDoc.data();
          const amt = data.owedAmount || 0;
          const name = data.owedName;
          currentNet = Math.round((name === 'Cule' ? amt : -amt) * 100) / 100;
        }

        const change = Math.round((type === 'expense' ? numAmount / 2 : numAmount) * 100) / 100;
        const newNet = payer === 'Jen' ? currentNet + change : currentNet - change;
        const roundedNet = Math.round(newNet * 100) / 100;

        transaction.set(statusRef, {
          owedAmount: Math.abs(roundedNet),
          owedName: roundedNet >= 0 ? 'Cule' : 'Jen'
        });
      });

      setAmount('');
      setDescription('');
      setCategoryId(null);
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return {
    amount, setAmount,
    description, setDescription,
    date, setDate,
    payer, setPayer,
    type, setType,
    categoryId, setCategoryId,
    categories,
    loading,
    error,
    handleSubmit,
    PARTNERS
  };
}
