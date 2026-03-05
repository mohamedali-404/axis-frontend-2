const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let originalContent = content;

            content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g, 'https://axis-backend-2.onrender.com/api');
            content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL/g, "'https://axis-backend-2.onrender.com/api'");

            // Also for local host just in case any remains
            content = content.replace(/http:\/\/localhost:5000\/api/g, 'https://axis-backend-2.onrender.com/api');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceInDir(path.join(__dirname, 'src'));
console.log('All API URLs hardcoded successfully.');
