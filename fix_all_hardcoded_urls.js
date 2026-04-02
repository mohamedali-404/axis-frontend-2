/**
 * fix_all_hardcoded_urls.js
 * Replaces all hardcoded production URLs with environment variable references
 * Run: node fix_all_hardcoded_urls.js
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const PROD_URL = 'https://axis-backend-2.onrender.com/api';

let filesFixed = 0;
let replacementsTotal = 0;

function processFile(filePath) {
    const ext = path.extname(filePath);
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes(PROD_URL)) return;

    const originalContent = content;

    // For 'use client' components using axios/fetch with template literals:
    // Replace `https://axis-backend-2.onrender.com/api` with a dynamic reference
    
    // Pattern 1: Client components - add API constant if not present
    // The components already define const API = '...' or use axios directly
    
    // For files that define `const API = '...'`
    content = content.replace(
        /const API = ['"]https:\/\/axis-backend-2\.onrender\.com\/api['"]/g,
        "const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'"
    );

    // For server components (no 'use client') using fetch
    // These need a variable defined before use
    if (!content.startsWith("'use client'") && !content.startsWith('"use client"')) {
        // Add const apiUrl line if it uses the prod URL directly in fetch
        // Check if apiUrl is already defined
        if (!content.includes('const apiUrl') && content.includes(PROD_URL)) {
            content = content.replace(
                /^(import[\s\S]*?\n\n)/m,
                `$1const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';\n\n`
            );
            // Replace remaining hardcoded URLs in fetch calls
            content = content.replace(
                new RegExp(`['"\`]${PROD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^'"\`]*)['"\`]`, 'g'),
                (match, suffix) => `\`\${apiUrl}${suffix}\``
            );
        }
    }
    
    // General: replace all remaining hardcoded URLs in template literals and strings
    // In axios.get/post/put/delete calls in 'use client' files
    content = content.replace(
        new RegExp(`\`${PROD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^'"\`]*)\``, 'g'),
        (match, suffix) => '`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:5000/api\'}' + suffix + '`'
    );
    content = content.replace(
        new RegExp(`'${PROD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^']*)'`, 'g'),
        (match, suffix) => `\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${suffix}\``
    );
    content = content.replace(
        new RegExp(`"${PROD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^"]*)"`, 'g'),
        (match, suffix) => `\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${suffix}\``
    );

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        const count = (originalContent.match(new RegExp(PROD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        replacementsTotal += count;
        filesFixed++;
        console.log(`[FIXED] ${path.relative(__dirname, filePath)} (${count} replacements)`);
    }
}

function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !['node_modules', '.next', '.git'].includes(entry.name)) {
            walkDir(fullPath);
        } else if (entry.isFile()) {
            processFile(fullPath);
        }
    }
}

console.log('Scanning frontend/src for hardcoded production URLs...');
walkDir(srcDir);
console.log(`\nDone! Fixed ${filesFixed} files with ${replacementsTotal} total replacements.`);
