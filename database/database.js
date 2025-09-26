const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    const dataDir = path.join(__dirname, '../data');
    if (!require('fs').existsSync(dataDir)) {
      require('fs').mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(__dirname, '../data/criteria.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS study_criteria_rules (
        study_id VARCHAR(50) NOT NULL,
        criteria_id VARCHAR(50) NOT NULL,
        rule_type VARCHAR(30) NOT NULL,
        criteria_type TEXT CHECK(criteria_type IN ('inclusion', 'exclusion')) NOT NULL,
        min_age INTEGER,
        max_age INTEGER,
        allowed_genders TEXT,
        diagnosis_cancer_allowed BOOLEAN,
        history_smoking_allowed BOOLEAN,
        current_smoking_allowed BOOLEAN,
        current_pregnant_allowed BOOLEAN,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (study_id, criteria_id)
      )
    `;

    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Table created or already exists');
      }
    });
  }

  // Generic query method
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Generic run method for INSERT, UPDATE, DELETE
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = new Database();