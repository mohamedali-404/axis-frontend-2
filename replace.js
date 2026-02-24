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
        content = content.replace(/http:\/\/localhost:5000\/api/g, '${process.env.NEXT_PUBLIC_API_URL}');

        // In page.tsx: `fetch('http://localhost:5000/api/products'` becomes `fetch('${process.env.NEXT_PUBLIC_API_URL}/products'`
        // But we need to make sure the quotes are backticks if we use interpolation!
        // So let's replace `'http://localhost:5000/api` with `\`${process.env.NEXT_PUBLIC_API_URL}`
        content = content.replace(/'http:\/\/localhost:5000\/api/g, '`${process.env.NEXT_PUBLIC_API_URL}');
        // And for the trailing quote:
        // Wait, the easiest way is to use replace with the exact string matches
        content = content.replace(/'\$\{process\.env\.NEXT_PUBLIC_API_URL\}([^']*)'/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');

        // Also for already ` ` strings:
        content = content.replace(/`http:\/\/localhost:5000\/api([^`]*)`/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');

        fs.writeFileSync(fullPath, content);
    }
});
