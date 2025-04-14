import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.vercel', '.github', '.vscode']; // Add other directories to exclude

function toSnakeCase(str) {
    if (!str) return str;
    // Handle existing snake_case or simple lowercase
    if (/^[a-z0-9_]+$/.test(str) && !str.includes('__') && !str.startsWith('_') && !str.endsWith('_')) {
        return str; // Already conforms
    }

    return str
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')
        .toLowerCase();
}

function isSnakeCase(str) {
    // Allows lowercase letters, numbers, and single underscores
    // Does not allow leading/trailing underscores or double underscores
    return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(str);
}


async function findAndRenameFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!EXCLUDED_DIRS.includes(entry.name)) {
                await findAndRenameFiles(fullPath);
            }
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            const ext = path.extname(entry.name);
            const baseName = path.basename(entry.name, ext);

            if (!isSnakeCase(baseName)) {
                const snakeCaseName = toSnakeCase(baseName);
                if (snakeCaseName !== baseName && isSnakeCase(snakeCaseName)) { // Ensure conversion happened and result is valid snake_case
                    const newBaseName = `_${snakeCaseName}${ext}`; // Add underscore prefix
                    const newPath = path.join(dir, newBaseName);
                    console.log(`Planning rename: ${fullPath} -> ${newPath}`);
                    try {
                        // Use git mv for tracking
                        execSync(`git mv "${fullPath}" "${newPath}"`);
                        console.log(`SUCCESS: Renamed ${fullPath} to ${newPath}`);
                    } catch (error) {
                        console.error(`ERROR: Failed to rename ${fullPath}: ${error.message}`);
                        // Attempt standard rename if git mv fails (e.g., file not tracked)
                        try {
                             await fs.rename(fullPath, newPath);
                             console.log(`WARN: Renamed (non-git) ${fullPath} to ${newPath}`);
                        } catch (fsError){
                            console.error(`ERROR: Filesystem rename also failed for ${fullPath}: ${fsError.message}`);
                        }
                    }
                } else if (snakeCaseName === baseName) {
                   console.log(`Skipping (already snake_case or simple lowercase): ${fullPath}`);
                } else {
                   console.warn(`Skipping (conversion failed or invalid): ${fullPath} (tried ${snakeCaseName})`);
                }
            } else {
                 console.log(`Skipping (is snake_case): ${fullPath}`);
            }
        }
    }
}

console.log("Starting rename process (Phase 1: to intermediate _snake_case)...");
await findAndRenameFiles('.'); // Start from current directory
console.log("Rename process (Phase 1) finished.");
console.log("Please review the changes with 'git status' and commit if correct."); 