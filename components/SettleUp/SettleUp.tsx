'use client';

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSummary } from '../Summary/useSummary';
import styles from './SettleUp.module.css';

export default function SettleUp() {
  const {
    syncing,
    showConfirmSettle,
    setShowConfirmSettle,
    handleSettleUp,
    absoluteBalance
  } = useSummary();

  if (absoluteBalance === 0 && !syncing) return null;

  return (
    <div className={styles.container}>
      <button 
        onClick={() => setShowConfirmSettle(true)}
        disabled={syncing}
        className={styles.dangerButton}
      >
        <Trash2 className="w-4 h-4" />
        Settle Up & Reset All Data
      </button>

      <AnimatePresence>
        {showConfirmSettle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={() => setShowConfirmSettle(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.iconWrapper}>
                <AlertTriangle className={styles.warningIcon} />
              </div>
              <h3 className={styles.modalTitle}>Are you absolutely sure?</h3>
              <p className={styles.modalText}>
                This action will permanently delete <strong>all transactions</strong> and reset the balance to zero. This cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button 
                  onClick={() => setShowConfirmSettle(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSettleUp}
                  className={styles.confirmButton}
                >
                  Yes, Settle Up
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
