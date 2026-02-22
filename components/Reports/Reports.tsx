'use client';

import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { BarChart3, Calendar, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useReports } from './useReports';
import styles from './Reports.module.css';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function Reports() {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    transactions,
    loading,
    setLoading,
    reportData
  } = useReports();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.card}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>
          <BarChart3 className={styles.titleIcon} />
          Expense Reports
        </h2>
        
        <div className={styles.dateSelector}>
          <div className={styles.dateInputWrapper}>
            <Calendar className={styles.calendarIcon} />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setLoading(true);
              }}
              className={styles.dateInput}
            />
          </div>
          <span className={styles.divider}>|</span>
          <div className={styles.dateInputWrapper}>
            <Calendar className={styles.calendarIcon} />
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setLoading(true);
              }}
              className={styles.dateInput}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <PieIcon className={styles.emptyIcon} />
          <p className={styles.emptyText}>No expenses found for this period.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {/* Summary & Pie Chart */}
          <div className={styles.section}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <TrendingUp className={styles.summaryIcon} />
                <span className={styles.summaryLabel}>Total Period Expense</span>
              </div>
              <div className={styles.summaryValue}>${reportData.total.toFixed(2)}</div>
            </div>

            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {reportData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart & List */}
          <div className={styles.section}>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={90} 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Total']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {reportData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.breakdownSection}>
              <h3 className={styles.breakdownTitle}>Category Breakdown</h3>
              <div className={styles.breakdownList}>
                {reportData.chartData.map((item, index) => (
                  <div key={item.name} className={styles.breakdownItem}>
                    <div className={styles.itemLabel}>
                      <div className={styles.itemColor} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className={styles.itemName}>{item.name}</span>
                    </div>
                    <div className={styles.itemValue}>${item.value.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
