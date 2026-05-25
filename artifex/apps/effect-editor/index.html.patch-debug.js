const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let text = fs.readFileSync(indexPath, 'utf8');

text = text.replaceAll('v2.3.0 ALPHA stable build.', 'v2.3.1 SPLIT-DEBUG debug-wired build.');
text = text.replaceAll('v2.3.0 ALPHA Active Grid', 'v2.3.1 SPLIT-DEBUG Active Grid');
text = text.replaceAll('v2.3.0 ALPHA', 'v2.3.1 SPLIT-DEBUG');

const marker = '<!-- Artifex split-step 1 debug module wiring -->';
const moduleScript = `
    <!-- Artifex split-step 1 debug module wiring -->
    <script type="module">
        import { installArtifexModules } from './src/editor-bootstrap.js';
        import './src/editor-debug.js';

        try {
            installArtifexModules(window);
            console.info('Artifex split-step 1 modules loaded: bootstrap + debug.');
        } catch (error) {
            console.error('Artifex split-step 1 module wiring failed.', error);
        }
    </script>
`;

if (!text.includes(marker)) {
  text = text.replace('\n</body>\n</html>', `${moduleScript}\n</body>\n</html>`);
}

fs.writeFileSync(indexPath, text, 'utf8');
