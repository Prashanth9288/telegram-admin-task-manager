import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';

/**
 * Custom Hook for real-time Task Data
 */
export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribe;
        try {
            unsubscribe = dbService.subscribeToTasks((data) => {
                setTasks(data);
                setLoading(false);
            });
        } catch (err) {
            console.error("Failed to subscribe to tasks:", err);
            setError(err);
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Helper: Get stats from tasks
    const getTaskStats = () => {
        if (!tasks.length) return { total: 0, byCategory: {} };
        
        const byCategory = tasks.reduce((acc, task) => {
            const cat = task.category || 'standard';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});

        return {
            total: tasks.length,
            byCategory
        };
    };

    return { tasks, loading, error, stats: getTaskStats() };
};

/**
 * Custom Hook for real-time News Data
 */
export const useNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribe;
        try {
            unsubscribe = dbService.subscribeToNews((data) => {
                setNews(data);
                setLoading(false);
            });
        } catch (err) {
            console.error("Failed to subscribe to news:", err);
            setError(err);
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return { news, loading, error, total: news.length };
};
