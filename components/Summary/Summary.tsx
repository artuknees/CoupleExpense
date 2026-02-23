'use client';

import React from 'react';
import { Wallet, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSummary } from './useSummary';
import { useSharedImage } from './useSharedImage';
import SharedImage from './SharedImage';
import styles from './Summary.module.css';

export default function Summary() {
  const {
    loading: summaryLoading,
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
  } = useSummary();
  const { loading: imageLoading } = useSharedImage();

  if (summaryLoading || imageLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-slate-50 rounded-3xl border border-slate-100">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      <SharedImage />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={styles.card}
      >
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.labelWrapper}>
              <Wallet className={styles.labelIcon} />
              <span className={styles.labelText}>Current Balance</span>
            </div>
            <div className={styles.actions}>
              <AnimatePresence>
                {syncMessage && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={styles.syncMessage}
                  >
                    {syncMessage}
                  </motion.span>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setShowConfirmSync(true)}
                disabled={syncing}
                className={styles.syncButton}
                title="Sync Totals"
              >
                <RefreshCw className={`${styles.labelIcon} ${syncing ? styles.spin : ''}`} />
              </button>
            </div>
          </div>
          
          <div className={styles.balanceWrapper}>
            {syncing ? (
              <div className={styles.loadingWrapper}>
                <div className={styles.loadingBalance}></div>
                <div className={styles.loadingLabel}></div>
              </div>
            ) : (
              <>
                <div className={styles.balanceInfo}>
                  <span className={styles.balance}>${absoluteBalance.toFixed(2)}</span>
                  <span className={styles.whoOwes}>
                    {absoluteBalance === 0 ? 'Settled' : `${whoOwes} owes`}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sync Confirmation Overlay */}
        <AnimatePresence>
          {showConfirmSync && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.overlay}
            >
              <div className={styles.overlayText}>
                <p className={styles.overlayTitle}>Recalculate Totals?</p>
                <p className={styles.overlaySub}>This will scan all transactions</p>
              </div>
              <div className={styles.overlayActions}>
                <button
                  onClick={() => setShowConfirmSync(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSync}
                  className={styles.confirmButton}
                >
                  Yes, Sync
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative background elements */}
        <div className={styles.decorRight}></div>
        <div className={styles.decorLeft}></div>
      </motion.div>
    </div>
  );
}
