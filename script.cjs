const https = require('https');

https.get('https://api.github.com/repos/hongkongphotos2025-sys/Consulting-project/git/trees/main?recursive=1', {
  headers: { 'User-Agent': 'node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const tree = JSON.parse(data).tree;
    if (tree) {
      console.log("--- ROOT FILES ---");
      console.log(tree.filter(t => !t.path.includes('/')).map(t => t.path).join(', '));
      
      console.log("\n--- SRC FILES ---");
      const srcFiles = tree.filter(t => t.path.startsWith('src/'));
      if (srcFiles.length > 0) {
        console.log(srcFiles.map(t => t.path).join('\n'));
      } else {
        console.log("NO SRC FOLDER FOUND!");
      }

      console.log("\n--- PUBLIC FILES ---");
      const publicFiles = tree.filter(t => t.path.startsWith('public/'));
      if (publicFiles.length > 0) {
        console.log(publicFiles.map(t => t.path).join('\n'));
      } else {
        console.log("NO PUBLIC FOLDER FOUND!");
      }
    } else {
      console.log("Error or empty repo:", data);
    }
  });
}).on('error', err => console.error(err));
