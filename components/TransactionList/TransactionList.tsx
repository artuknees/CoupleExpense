'use client';

import React from 'react';
import { format } from 'date-fns';
import { Receipt, ArrowRightLeft, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTransactionList } from './useTransactionList';
import styles from './TransactionList.module.css';

export default function TransactionList() {
  const {
    transactions,
    loading,
    hasMore,
    deletingId,
    setDeletingId,
    handleLoadMore,
    handleDelete
  } = useTransactionList();

  if (loading) {
    return (
      <div className={styles.loadingSpinner}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <Clock className={styles.titleIcon} />
        Recent Activity
      </h2>

      <div className={styles.list}>
        <AnimatePresence initial={false}>
          {transactions.length === 0 ? (
            <p className={styles.empty}>No transactions yet.</p>
          ) : (
            transactions.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={styles.card}
              >
                <div className={styles.mainInfo}>
                  <div className={`${styles.iconWrapper} ${t.type === 'expense' ? styles.iconExpense : styles.iconTransfer}`}>
                    {t.type === 'expense' ? <Receipt className="w-5 h-5" /> : <ArrowRightLeft className="w-5 h-5" />}
                  </div>
                  <div className={styles.textInfo}>
                    <div className={styles.headerRow}>
                      {t.categoryName && (
                        <span className={styles.categoryBadge}>
                          {t.categoryName}
                        </span>
                      )}
                      <h3 className={styles.description}>{t.description}</h3>
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.payer}>
                        {t.type === 'transfer' 
                          ? `From ${t.payer} to ${t.payer === 'Jen' ? 'Cule' : 'Jen'}`
                          : `${t.payer} paid`}
                      </span>
                      <span className={styles.dot}>•</span>
                      <span className={styles.timestamp}>{t.timestamp ? format(t.timestamp.toDate(), 'MMM d, h:mm a') : 'Just now'}</span>
                      {t.userEmail && (
                        <>
                          <span className={styles.dot}>•</span>
                          <span className={styles.uploader} title={t.userEmail}>
                            {t.userEmail.split('@')[0]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={styles.rightInfo}>
                  <div className={styles.amount}>${t.amount.toFixed(2)}</div>
                  <button 
                    onClick={() => setDeletingId(t.id)}
                    className={styles.deleteButton}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Inline Confirmation Overlay */}
                <AnimatePresence>
                  {deletingId === t.id && (
                    <motion.div
                      initial={{ opacity: 0, x: '100%' }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: '100%' }}
                      className={styles.overlay}
                    >
                      <span className={styles.overlayText}>Delete this?</span>
                      <div className={styles.overlayActions}>
                        <button
                          onClick={() => setDeletingId(null)}
                          className={styles.cancelButton}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className={styles.confirmButton}
                        >
                          Confirm
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className={styles.loadMoreWrapper}>
          <button
            onClick={handleLoadMore}
            className={styles.loadMoreButton}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
