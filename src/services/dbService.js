import { ref, set, push, update, remove, onValue, query, orderByChild, limitToLast, get } from 'firebase/database';
import { database } from './FirebaseConfig';

/**
 * Service class for handling all Firebase Realtime Database operations
 * Separation of concerns: This file handles Data Access only.
 */

const DB_PATHS = {
    TASKS: 'tasks',
    NEWS: 'news',
};

export const dbService = {
    // ==========================================
    // GENERIC HELPERS
    // ==========================================
    
    /**
     * Subscribe to a path and receive real-time updates
     * @param {string} path - Database path
     * @param {function} callback - Function called with formatted data array
     * @param {object} options - Query options like orderBy, limit
     * @returns {function} unsubscribe function
     */
    subscribe: (path, callback, options = {}) => {
        let dbRef = ref(database, path);
        
        // Apply basic queries if needed (expandable)
        if (options.orderBy) {
            dbRef = query(dbRef, orderByChild(options.orderBy));
        }
        
        const unsubscribe = onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Convert object to array and preserve IDs
                const formattedData = Object.entries(data)
                    .map(([key, value]) => ({
                        id: key,
                        ...value
                    }));
                    
                // Optional: Client-side sort if needed
                callback(formattedData);
            } else {
                callback([]);
            }
        }, (error) => {
            console.error(`Error fetching ${path}:`, error);
            callback([]);
        });

        return unsubscribe;
    },

    // ==========================================
    // TASKS OPERATIONS
    // ==========================================

    /**
     * Subscribe specifically to tasks
     * Handles flattening of nested categories if present (legacy support)
     */
    subscribeToTasks: (callback) => {
        return onValue(ref(database, DB_PATHS.TASKS), (snapshot) => {
            const data = snapshot.val();
            const allTasks = [];

            if (data) {
                Object.entries(data).forEach(([key, value]) => {
                    // Check if the child is a direct task (has title) or a category container
                    if (value && value.title) {
                        // Flat structure: tasks/{id}
                        allTasks.push({
                            id: key,
                            ...value,
                            category: value.category || 'standard' // Default if missing
                        });
                    } else if (value && typeof value === 'object') {
                        // Nested structure: tasks/{category}/{id}
                        Object.entries(value).forEach(([subKey, subValue]) => {
                            if (subValue && typeof subValue === 'object') {
                                allTasks.push({
                                    id: subKey,
                                    ...subValue,
                                    category: key // Parent key is the category
                                });
                            }
                        });
                    }
                });
            }
            callback(allTasks);
        }, (error) => {
            console.error("Error fetching tasks:", error);
            callback([]);
        });
    },

    /**
     * Add a new task
     * Writes to tasks/{category}/{id} to maintain structure
     */
    addTask: async (taskData) => {
        try {
            const category = taskData.category || 'standard';
            const catRef = ref(database, `${DB_PATHS.TASKS}/${category}`);
            
            // Get next ID logic
            const snapshot = await get(catRef);
            const data = snapshot.val();
            
            let nextId = 0;
            if (data) {
                const existingIds = Object.keys(data)
                    .map(k => parseInt(k, 10))
                    .filter(num => !isNaN(num));
                if (existingIds.length > 0) {
                    nextId = Math.max(...existingIds) + 1;
                }
            }

            const newTaskRef = ref(database, `${DB_PATHS.TASKS}/${category}/${nextId}`);
            const payload = {
                ...taskData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            await set(newTaskRef, payload);
            return nextId;
        } catch (error) {
            console.error("Error adding task:", error);
            throw error;
        }
    },

    updateTask: async (id, taskData) => {
        try {
            const category = taskData.category || 'standard';
            const taskRef = ref(database, `${DB_PATHS.TASKS}/${category}/${id}`);
            await update(taskRef, {
                ...taskData,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error updating task:", error);
            throw error;
        }
    },

    deleteTask: async (id, category) => {
        try {
            const targetCategory = category || 'standard'; 
            await remove(ref(database, `${DB_PATHS.TASKS}/${targetCategory}/${id}`));
        } catch (error) {
            console.error("Error deleting task:", error);
            throw error;
        }
    },

    // ==========================================
    // NEWS OPERATIONS
    // ==========================================

    subscribeToNews: (callback) => {
        // Sort by createdAt descending locally or via query if we index it
        return dbService.subscribe(DB_PATHS.NEWS, (data) => {
            const sorted = data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            callback(sorted);
        }, { orderBy: 'createdAt' });
    },

    addNews: async (newsData) => {
        try {
            // Using push() for News as per existing AdminNews.jsx
            const newNewsRef = push(ref(database, DB_PATHS.NEWS));
            await set(newNewsRef, {
                ...newsData,
                createdAt: new Date().getTime() // Storing as timestamp number for easier sorting
            });
            return newNewsRef.key;
        } catch (error) {
            console.error("Error adding news:", error);
            throw error;
        }
    },

    updateNews: async (id, newsData) => {
        try {
            const newsRef = ref(database, `${DB_PATHS.NEWS}/${id}`);
            await update(newsRef, {
                ...newsData,
                updatedAt: new Date().getTime()
            });
        } catch (error) {
            console.error("Error updating news:", error);
            throw error;
        }
    },

    deleteNews: async (id) => {
         try {
            await remove(ref(database, `${DB_PATHS.NEWS}/${id}`));
        } catch (error) {
            console.error("Error deleting news:", error);
            throw error;
        }
    }
};
