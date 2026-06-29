const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/const ContactForm = \(\) => \{[\s\S]*?export default function App\(\) \{/, "import { ContactForm } from './components/ContactForm';\nimport { ClientPortal } from './components/ClientPortal';\n\nexport default function App() {");
fs.writeFileSync('src/App.tsx', code);