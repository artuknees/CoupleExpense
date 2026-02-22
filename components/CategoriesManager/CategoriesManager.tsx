'use client';

import React from 'react';
import { Tag, Plus, X, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCategoriesManager } from './useCategoriesManager';
import styles from './CategoriesManager.module.css';

export default function CategoriesManager() {
  const {
    categories,
    newCategory,
    setNewCategory,
    isOpen,
    setIsOpen,
    handleAdd,
    handleDelete
  } = useCategoriesManager();

  return (
    <div className={styles.card}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={styles.toggleButton}
      >
        <div className={styles.buttonLabel}>
          <Settings2 className={styles.labelIcon} />
          Manage Categories
        </div>
        <Tag className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={styles.content}
          >
            <form onSubmit={handleAdd} className={styles.form}>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name..."
                className={styles.input}
              />
              <button 
                type="submit"
                className={styles.addButton}
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className={styles.tagList}>
              {categories.map((cat) => (
                <div 
                  key={cat.id}
                  className={styles.tag}
                >
                  {cat.name}
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className={styles.deleteTagButton}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className={styles.empty}>No categories defined.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
