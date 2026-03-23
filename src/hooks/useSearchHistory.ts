import { useState, useEffect } from 'react';
import { SearchHistoryItem } from '../types';

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('search_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const addToHistory = (type: SearchHistoryItem['type'], query: string) => {
    const newItem: SearchHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      query,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...history.slice(0, 19)];
    setHistory(updated);
    localStorage.setItem('search_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('search_history');
  };

  return { history, addToHistory, clearHistory };
}
