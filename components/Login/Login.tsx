'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Heart, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import styles from './Login.module.css';

export default function Login() {
  const { login, loading, error } = useAuth();

  return (
    <div className={styles.wrapper}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.card}
      >
        <div className={styles.logoWrapper}>
          <div className={styles.logoIcon}>
            <Heart className="fill-current" />
          </div>
          <h1 className={styles.title}>Cule & Jen</h1>
          <p className={styles.subtitle}>Shared Expense Tracker</p>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>
            Please sign in with your Google account to access your shared expenses.
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={styles.error}
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}

          <button 
            onClick={login}
            disabled={loading}
            className={styles.loginButton}
          >
            {loading ? (
              <div className={styles.spinner}></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </div>

        <div className={styles.footer}>
          Only authorized accounts can access this application.
        </div>
      </motion.div>
    </div>
  );
}
