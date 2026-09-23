"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";

const WEEKS = 26;

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => (res.ok ? res.json() : { tasks: [] }))
      .then((data) => setTasks(data.tasks || []))
      .catch(() => setTasks([]));
  }, []);

  const counts = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.deadline || t.status === "completed") return;
      const key = new Date(t.deadline).toDateString();
      map[key] = (map[key] || 0) + (t.priority === "high" ? 2 : 1);
    });
    return map;
  }, [tasks]);

  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay() - 28);
    return Array.from({ length: WEEKS * 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Deadline Heatmap</h1>
      <div className={styles.grid}>
        {days.map((d) => {
          const count = counts[d.toDateString()] || 0;
          return (
            <div
              key={d.toDateString()}
              className={styles.cell}
              data-level={Math.min(4, count)}
              title={`${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}: ${count} deadline load`}
            />
          );
        })}
      </div>
      <div className={styles.legend}>
        Less
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={styles.cell} data-level={l} />
        ))}
        More
      </div>
    </div>
  );
}
