#!/usr/bin/env node
/**
 * Blublu-Pizza Provisioning Script
 * 
 * Verwendung:
 * node provision-blublu.js
 * 
 * Voraussetzungen:
 * - blublu-pizza-config.json im selben Verzeichnis
 * - Backend läuft auf http://localhost:5081
 */

const fs = require('fs');
const https = require('https');

// ⚠️ WICHTIG: Admin-Key hier anpassen!
const ADMIN_KEY = process.env.ADMIN_KEY || 'your-secret-admin-key';
const BACKEND_URL = 'http://localhost:5081';
const CONFIG_FILE = 'blublu-pizza-config.json';

console.log('🍕 Provisioning Blublu-Pizza...\n');

// 1. JSON-Datei laden
if (!fs.existsSync(CONFIG_FILE)) {
  console.error(`❌ Fehler: ${CONFIG_FILE} nicht gefunden!`);
  process.exit(1);
}

let jsonContent;
try {
  jsonContent = fs.readFileSync(CONFIG_FILE, 'utf8');
  console.log(`✅ JSON geladen: ${CONFIG_FILE}`);
} catch (err) {
  console.error(`❌ Fehler beim Laden der Datei: ${err.message}`);
  process.exit(1);
}

// 2. JSON validieren
let payload;
try {
  payload = JSON.parse(jsonContent);
  console.log(`✅ JSON validiert`);
  console.log(`   - slug: ${payload.slug}`);
  console.log(`   - name: ${payload.name}`);
  console.log(`   - categories: ${payload.categories.length}`);
} catch (err) {
  console.error(`❌ JSON Parse-Fehler: ${err.message}`);
  process.exit(1);
}

// 3. POST-Request senden
console.log(`\n📤 Sende POST zu ${BACKEND_URL}/api/v1/admin/sites...\n`);

const options = {
  hostname: 'localhost',
  port: 5081,
  path: '/api/v1/admin/sites',
  method: 'POST',
  headers: {
    'X-Admin-Key': ADMIN_KEY,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(jsonContent)
  }
};

const http = require('http'); // Use http for localhost

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('');
    
    if (res.statusCode === 201) {
      console.log(`✅ Erfolg! Status: ${res.statusCode} Created`);
      console.log('');
      console.log('Response:');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
      } catch {
        console.log(data);
      }
    } else {
      console.error(`❌ Fehler! Status: ${res.statusCode}`);
      console.error('');
      console.error('Response:');
      console.error(data);
      console.error('');
      
      // Debugging
      console.log('💡 Debugging-Tipps:');
      if (res.statusCode === 401) {
        console.log('  → Admin-Key falsch! Prüfe deinen .env im Backend');
        console.log(`  → Verwendeter Key: ${ADMIN_KEY}`);
      } else if (res.statusCode === 400) {
        console.log('  → Falsche Daten! JSON-Format prüfen');
        console.log('  → Prüfe: slug, name, categories, items');
      } else if (res.statusCode === 500) {
        console.log('  → Backend-Fehler! Prüfe Backend-Logs');
      }
      
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error(`❌ Request-Fehler: ${err.message}`);
  console.error('');
  console.log('💡 Debugging-Tipps:');
  console.log('  → Backend läuft nicht! Starte Backend zuerst');
  console.log('  → Oder: Port 5081 ist falsch');
  process.exit(1);
});

req.write(jsonContent);
req.end();
