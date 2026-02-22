'use client';

import React from 'react';
import { PlusCircle, Receipt, ArrowRightLeft, Tag, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTransactionForm } from './useTransactionForm';
import styles from './TransactionForm.module.css';

export default function TransactionForm() {
  const {
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
  } = useTransactionForm();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.card}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>
          <PlusCircle className={styles.titleIcon} />
          Add New
        </h2>
        <AnimatePresence>
          {error && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={styles.error}
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.typeToggle}>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`${styles.typeButton} ${styles.typeButtonExpense} ${
              type === 'expense' ? styles.typeButtonActive : ''
            }`}
          >
            <Receipt className="w-4 h-4" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`${styles.typeButton} ${styles.typeButtonTransfer} ${
              type === 'transfer' ? styles.typeButtonActive : ''
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfer
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Who Paid?</label>
          <div className={styles.payerGrid}>
            {PARTNERS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPayer(p)}
                className={`${styles.payerButton} ${
                  payer === p ? styles.payerButtonActive : ''
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

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

        {type === 'expense' && (
          <div className={styles.field}>
            <label className={styles.label}>
              <Tag className="w-3 h-3" />
              Category (Optional)
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
          <label className={styles.label}>Description (Optional)</label>
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

        <button
          type="submit"
          disabled={loading || !amount || Number(amount) <= 0}
          className={styles.submitButton}
        >
          {loading ? 'Adding...' : `Add ${type === 'expense' ? 'Expense' : 'Transfer'}`}
        </button>
      </form>
    </motion.div>
  );
}
