const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'src/app/shop/page.tsx',
    'src/app/product/[id]/page.tsx',
    'src/app/page.tsx',
    'src/app/checkout/page.tsx',
    'src/app/admin/page.tsx'
];

filesToUpdate.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf-8');

        // replace occurrences of ${process.env.NEXT_PUBLIC_API_URL} with https://axis-backend-2.onrender.com/api
        content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g, 'https://axis-backend-2.onrender.com/api');
        content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL/g, "'https://axis-backend-2.onrender.com/api'");

        fs.writeFileSync(fullPath, content);
    }
});
console.log('API URL hardcoded successfully.');
