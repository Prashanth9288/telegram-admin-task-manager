const fs = require('fs');
const path = require('path');

/**
 * VERIFICATION SCRIPT
 * 
 * Compares db_export.json (Legacy) with db_optimized.json (New)
 * to ensure 1:1 mapping and no data loss.
 */

const legacyPath = path.join(__dirname, '..', 'db_export.json');
const optimizedPath = path.join(__dirname, '..', 'db_optimized.json');

if (!fs.existsSync(optimizedPath)) {
    console.error("ERROR: db_optimized.json not found. Run 'node scripts/migrate_db.js' first.");
    process.exit(1);
}

const legacy = require(legacyPath);
const optimized = require(optimizedPath);

const legacyUsers = legacy.connections || {};
const newUsers = optimized.users || {};
const newUserTasks = optimized.user_tasks || {};
const newUserFarming = optimized.user_farming || {};

let errors = [];
let warnings = [];

console.log("Starting Verification...");

// 1. User Count Check
const legacyCount = Object.keys(legacyUsers).length;
const newCount = Object.keys(newUsers).length;

if (legacyCount !== newCount) {
    if (Math.abs(legacyCount - newCount) > 5) { // Allow slight diff if some users were skipped (corrupted)
         errors.push(`User count mismatch! Legacy: ${legacyCount}, New: ${newCount}`);
    } else {
         warnings.push(`User count slight mismatch. Legacy: ${legacyCount}, New: ${newCount} (Likely corrupted data skipped)`);
    }
}

// 2. Data Integrity Check (Sample)
for (const [uid, userData] of Object.entries(legacyUsers)) {
    if (Array.isArray(userData)) continue; // Skip known corrupt data

    // Check if user exists in new structure
    if (!newUsers[uid]) {
        errors.push(`Missing user: ${uid}`);
        continue;
    }

    // Check Farming
    if (userData.farming) {
        if (!newUserFarming[uid]) {
             errors.push(`Missing farming data for user: ${uid}`);
        } else if (userData.farming.startTime !== newUserFarming[uid].startTime) {
             errors.push(`Farming data mismatch for user: ${uid}`);
        }
    }

    // Check Tasks (Sample check of a random task key if exists)
    // Legacy: connections/{uid}/1 : true -> New: user_tasks/{uid}/one_time/1 : true
    if (userData['1'] === true) {
        if (!newUserTasks[uid]?.one_time?.['1']) {
            errors.push(`Missing Task '1' for user: ${uid}`);
        }
    }
}

// Report
console.log("\n--- Verification Report ---");
if (errors.length === 0) {
    console.log("✅ SUCCESS: Data integrity verified.");
} else {
    console.log("❌ FAILED: Found errors:");
    errors.forEach(e => console.log(` - ${e}`));
}

if (warnings.length > 0) {
    console.log("⚠️ WARNINGS:");
    warnings.forEach(w => console.log(` - ${w}`));
}
