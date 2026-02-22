'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'transfer';
  categoryName: string | null;
  timestamp: any;
}

export function useReports() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'transactions'),
      where('type', '==', 'expense'),
      where('timestamp', '>=', start),
      where('timestamp', '<=', end),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching report data:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [startDate, endDate]);

  const reportData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    let total = 0;

    transactions.forEach(t => {
      const cat = t.categoryName || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      total += t.amount;
    });

    const chartData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    })).sort((a, b) => b.value - a.value);

    return { chartData, total: Math.round(total * 100) / 100 };
  }, [transactions]);

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    transactions,
    loading,
    setLoading,
    reportData
  };
}
