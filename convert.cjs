const fs = require('fs');
const path = require('path');

const files = [
  { in: 'landing.html', out: 'LandingPage.jsx', name: 'LandingPage' },
  { in: 'create_match.html', out: 'CreateMatch.jsx', name: 'CreateMatch' },
  { in: 'sign_in.html', out: 'SignIn.jsx', name: 'SignIn' },
  { in: 'match_details.html', out: 'MatchDetails.jsx', name: 'MatchDetails' },
  { in: 'dashboard.html', out: 'Dashboard.jsx', name: 'Dashboard' }
];

const outDir = path.join(__dirname, 'src', 'pages');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

files.forEach(file => {
  let content = fs.readFileSync(path.join(__dirname, file.in), 'utf8');
  
  // Extract body content
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyContent = bodyMatch ? bodyMatch[1] : '';

  // Remove script tags at the end of body
  bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Replace class= with className=
  bodyContent = bodyContent.replace(/class=/g, 'className=');
  
  // Replace for= with htmlFor=
  bodyContent = bodyContent.replace(/ for=/g, ' htmlFor=');

  // Replace inline styles (very naive approach, assumes style="key: value; key2: value")
  // Actually, Stitch mostly uses Tailwind, except maybe some simple style variations.
  // We'll just strip style attributes or handle the specific ones like style="font-variation-settings: 'FILL' 1;"
  // and style="background-image: linear-gradient..."
  bodyContent = bodyContent.replace(/style="([^"]*)"/g, (match, p1) => {
    const rules = p1.split(';').filter(s => s.trim());
    const styleObj = rules.reduce((acc, rule) => {
      const [key, ...val] = rule.split(':');
      if (!key) return acc;
      const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
      const v = val.join(':').trim().replace(/'/g, '"');
      acc.push(`${camelKey}: '${v}'`);
      return acc;
    }, []);
    return `style={{ ${styleObj.join(', ')} }}`;
  });

  // Self close void tags
  const voidTags = ['img', 'input', 'br', 'hr', 'meta', 'link'];
  voidTags.forEach(tag => {
    const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
    bodyContent = bodyContent.replace(regex, `<${tag}$1 />`);
  });

  // Comments
  bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

  const component = `import React from 'react';

export default function ${file.name}() {
  return (
    <>
      ${bodyContent}
    </>
  );
}
`;

  fs.writeFileSync(path.join(outDir, file.out), component);
  console.log('Created ' + file.out);
});
