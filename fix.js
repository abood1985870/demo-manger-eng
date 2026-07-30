const fs = require('fs');
const path = require('path');

function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        let p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (f.startsWith('route.')) {
            let c = fs.readFileSync(p, 'utf8');
            if (!c.includes('export const dynamic')) {
                fs.writeFileSync(p, "export const dynamic = 'force-dynamic';\n" + c);
            }
        }
    });
}
walk('frontend/app/api');
