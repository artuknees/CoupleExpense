'use client';

import Summary from '@/components/Summary/Summary';
import TransactionForm from '@/components/TransactionForm/TransactionForm';
import TransactionList from '@/components/TransactionList/TransactionList';
import CategoriesManager from '@/components/CategoriesManager/CategoriesManager';
import Reports from '@/components/Reports/Reports';
import SettleUp from '@/components/SettleUp/SettleUp';
import Login from '@/components/Login/Login';
import { useAuth } from '@/context/AuthContext';
import { Heart, LogOut, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function Home() {
  const { user, isAuthorized, loading, logout, defaultPayer } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const welcomeShown = useRef(false);

  useEffect(() => {
    if (!loading && user && isAuthorized && !welcomeShown.current) {
      welcomeShown.current = true;
      const welcomeTimer = setTimeout(() => setShowWelcome(true), 100);
      const hideTimer = setTimeout(() => setShowWelcome(false), 5100);
      return () => {
        clearTimeout(welcomeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [loading, user, isAuthorized]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return <Login />;
  }

  return (
    <main className={styles.main}>
      {/* Welcome Toast */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: -40 }}
            exit={{ opacity: 0, y: 100 }}
            style={{ left: '50%', x: '-50%' }}
            className="fixed bottom-0 z-[1000] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 font-bold border border-white/10"
          >
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <span className="text-lg">Hi {defaultPayer}! Welcome back.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoWrapper}>
            <div className={styles.logoIcon}>
              <Heart className="fill-current" />
            </div>
            <h1 className={styles.title}>Cule & Jen</h1>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.badge}>
              Shared Wallet
            </div>
            <button onClick={logout} className={styles.logoutButton} title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        {/* Summary Section */}
        <Summary />

        {/* Main Content Grid */}
        <div className={styles.grid}>
          {/* Left Column: Form & Categories */}
          <div className={styles.leftColumn}>
            <TransactionForm />
            <CategoriesManager />
          </div>

          {/* Right Column: List */}
          <div className={styles.rightColumn}>
            <TransactionList />
          </div>
        </div>

        {/* Reports Section */}
        <Reports />

        {/* Settle Up (Danger Zone) */}
        <SettleUp />
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Built with love for your shared future
        </p>
      </footer>
    </main>
  );
}
