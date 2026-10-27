const fs = require('fs');
const path = require('path');

// 1. Read compiled CSS from dist/assets
const assetsDir = path.join(__dirname, 'dist', 'assets');
const cssFile = fs.readdirSync(assetsDir).find(f => f.endsWith('.css'));
const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

// 2. Read compiled standalone IIFE JS bundle
const jsContent = fs.readFileSync(path.join(__dirname, 'standalone-bundle.js'), 'utf8');

// 3. Assemble complete standalone-demo.html
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#0F172A">
  <title>SafeWay - Smart Navigation & Women Safety Emergency Response</title>

  <!-- Leaflet Map CSS for Dark Radar Map -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>

  <!-- Inlined Compiled Tailwind CSS (Zero external network dependency) -->
  <style>
${cssContent}
  </style>

  <style>
    /* Custom Scrollbar & Animations */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }
  </style>
</head>
<body class="bg-[#090D16] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
  <!-- React Mount Point -->
  <div id="root">
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #090D16; color: #38BDF8; font-family: sans-serif; text-align: center; padding: 20px;">
      <div>
        <div style="width: 48px; height: 48px; border: 4px solid #0284C7; border-top-color: transparent; border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite;"></div>
        <h2 style="font-size: 1.25rem; font-weight: bold; color: #FFFFFF; margin-bottom: 6px;">Loading SafeWay System...</h2>
        <p style="font-size: 0.85rem; color: #94A3B8;">Initializing live navigation map & emergency telemetry</p>
      </div>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  </div>

  <!-- Inlined Pre-Compiled React Application Bundle (Pre-transpiled IIFE: Zero Babel needed!) -->
  <script>
    window.addEventListener('error', function(e) {
      console.error("SafeWay Runtime Error:", e.message);
    });
  </script>
  <script>
${jsContent}
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'standalone-demo.html'), htmlContent, 'utf8');
console.log('Successfully generated self-contained standalone-demo.html (Size: ' + Math.round(htmlContent.length / 1024) + ' KB)');
