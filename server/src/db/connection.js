const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Garante que o diretório data exista
const dataDir = path.resolve(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'sisverao.sqlite');
const db = new DatabaseSync(dbPath);

// Ativa foreign keys
db.exec('PRAGMA foreign_keys = ON;');

module.exports = { db, dbPath };
