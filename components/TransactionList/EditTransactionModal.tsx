'use client';

import React, { useState, useEffect } from 'react';
import { X, Receipt, ArrowRightLeft, Tag, Calendar as CalendarIcon, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import styles from './EditTransactionModal.module.css';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  payer: string;
  type: 'expense' | 'transfer';
  categoryId?: string | null;
  categoryName?: string | null;
  timestamp: any;
}

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => Promise<void>;
}

const PARTNERS = ['Cule', 'Jen'] as const;

export default function EditTransactionModal({ transaction, onClose, onUpdate }: EditTransactionModalProps) {
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [description, setDescription] = useState(transaction.description);
  const [date, setDate] = useState(transaction.timestamp ? format(transaction.timestamp.toDate(), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [payer, setPayer] = useState(transaction.payer);
  const [categoryId, setCategoryId] = useState<string | null>(transaction.categoryId || null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

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
    if (!amount || isNaN(numAmount)) return;

    setLoading(true);
    try {
      const category = categories.find(c => c.id === categoryId);
      const updates: Partial<Transaction> = {
        amount: numAmount,
        description: description.trim(),
        payer,
        categoryId: transaction.type === 'expense' ? categoryId : null,
        categoryName: transaction.type === 'expense' ? (category?.name || null) : null,
        // We don't update timestamp here to avoid complex date logic for now, 
        // but user asked for date update.
        // Let's implement date update.
      };

      // Handle date update
      const newDate = new Date(date + 'T12:00:00');
      updates.timestamp = Timestamp.fromDate(newDate);

      await onUpdate(transaction.id, updates);
      onClose();
    } catch (err) {
      console.error('Error updating transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={styles.modal}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={`${styles.iconWrapper} ${transaction.type === 'expense' ? styles.iconExpense : styles.iconTransfer}`}>
              {transaction.type === 'expense' ? <Receipt className="w-5 h-5" /> : <ArrowRightLeft className="w-5 h-5" />}
            </div>
            <h2 className={styles.title}>Edit {transaction.type === 'expense' ? 'Expense' : 'Transfer'}</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Amount</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`${styles.input} ${styles.inputWithIcon}`}
                required
              />
            </div>
          </div>

          {transaction.type === 'expense' && (
            <div className={styles.field}>
              <label className={styles.label}>
                <Tag className="w-3 h-3" />
                Category
              </label>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value || null)}
                className={styles.select}
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was it for?"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <CalendarIcon className="w-3 h-3" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.select}
              required
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount || Number(amount) <= 0}
              className={styles.submitButton}
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
