const fs = require('fs');
const path = require('path');

/**
 * MIGRATION SCRIPT
 * 
 * Transforms legacy 'connections' based architecture to optimized:
 * - users/{uid}
 * - user_tasks/{uid}
 * - user_farming/{uid}
 * - user_history/{uid}
 */

// MOCK INPUT DATA (Replace this with actual require or fs.readFileSync for real file)
// For demonstration, using the structure provided in the prompt.
const legacyData = require('../db_export.json'); // Assumes you place the export here

const migrate = () => {
    const optimizedDB = {
        users: {},
        user_tasks: {},
        user_farming: {},
        user_history: {} // Assuming we maintain history logic or restructure it
    };

    const connections = legacyData.connections || {};
    const history = legacyData.history || {};

    console.log(`Starting migration for ${Object.keys(connections).length} users...`);

    // --- 1. MIGRATE CONNECTIONS (Users, Tasks, Farming) ---
    for (const [uid, userData] of Object.entries(connections)) {
        if (!userData) continue;

        // EDGE CASE: Corrupted Array Data
        // User 6725958435: [true]
        if (Array.isArray(userData)) {
            console.warn(`[WARNING] Skipping corrupted array data for user ${uid}. Data: ${JSON.stringify(userData)}`);
            continue;
        }

        // A. Users Collection (Metadata)
        // Extract high-level fields if they exist (in provided JSON they are mostly task data, but we prepare the bucket)
        optimizedDB.users[uid] = {
            migratedAt: Date.now(),
            // Assuming points might be calculated or aggregated later. 
            // In current JSON, points aren't explicitly in 'connections' root, usually in 'points' key if it existed.
        };

        // B. User Farming
        if (userData.farming) {
            optimizedDB.user_farming[uid] = userData.farming;
        }
        // Also check for '6' and '7' which seem to be recurring task timers sometimes associated with farming logic in games
        // But map purely based on known keys for now. 
        // Note: The prompt implies '6' and '7' are tasks, but they look like timers "lastClaimed".
        // We will move them to user_tasks -> recurring.

        // C. User Tasks
        const userTasks = {
            daily: userData.tasks?.daily || {},
            one_time: {},
            recurring: {}
        };

        // Iterate over root keys to identify legacy tasks (1, 4, 5, 6, 7, etc.)
        for (const [key, value] of Object.entries(userData)) {
            // Skip known nested objects
            if (['tasks', 'farming', 'lastReset'].includes(key)) continue;

            // Numeric keys are usually tasks
            if (!isNaN(key)) {
                // Heuristic: If it has 'lastClaimed', it's recurring/timer based.
                if (typeof value === 'object' && value.lastClaimed) {
                    userTasks.recurring[key] = value;
                } else {
                    // Boolean true or simple object
                    userTasks.one_time[key] = value;
                }
            }
        }

        // Preserve 'lastReset' if it exists (often for daily tasks)
        if (userData.lastReset) {
            userTasks.daily.lastReset = userData.lastReset;
        }

        optimizedDB.user_tasks[uid] = userTasks;
    }

    // --- 2. MIGRATE HISTORY ---
    // Optimization: Shard by Year-Month to identify/prevent huge nodes
    console.log(`Migrating history for ${Object.keys(history).length} users...`);
    
    for (const [uid, userHistory] of Object.entries(history)) {
        if (!userHistory) continue;

        optimizedDB.user_history[uid] = {};

        for (const [logId, logEntry] of Object.entries(userHistory)) {
            // Safety check for timestamp
            if (!logEntry.timestamp) {
                // Fallback or skip
                optimizedDB.user_history[uid][logId] = logEntry;
                continue;
            }

            // Shard: YYYY-MM
            const date = new Date(logEntry.timestamp);
            const shardKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!optimizedDB.user_history[uid][shardKey]) {
                optimizedDB.user_history[uid][shardKey] = {};
            }

            optimizedDB.user_history[uid][shardKey][logId] = logEntry;
        }
    }

    // --- 3. OUTPUT ---
    const outputPath = path.join(__dirname, '..', 'db_optimized.json');
    fs.writeFileSync(outputPath, JSON.stringify(optimizedDB, null, 2));
    console.log(`Migration complete. Optimized DB written to ${outputPath}`);
    
    // Summary Stats
    console.log({
        usersMigrated: Object.keys(optimizedDB.users).length,
        tasksMigrated: Object.keys(optimizedDB.user_tasks).length,
        farmingMigrated: Object.keys(optimizedDB.user_farming).length,
        historyMigrated: Object.keys(optimizedDB.user_history).length
    });
};

// Run
try {
    migrate();
} catch (e) {
    console.error("Migration Failed:", e);
}
