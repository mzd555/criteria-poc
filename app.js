const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Import routes
const criteriaRoutes = require('./routes/criteria');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/criteria', criteriaRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Criteria Validation System'
  });
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Criteria Validation System API',
    version: '1.0.0',
    endpoints: {
      'POST /api/criteria/extract': 'Extract criteria from text and store in database',
      'GET /api/criteria/:studyId': 'Get all criteria for a study',
      'POST /api/criteria/validate': 'Validate data array against study criteria',
      'DELETE /api/criteria/:studyId': 'Delete all criteria for a study',
      'PUT /api/criteria/:studyId/:criteriaId/status': 'Update rule status',
      'GET /health': 'Health check endpoint'
    },
    examples: {
      extract: {
        url: 'POST /api/criteria/extract',
        body: {
          studyId: 'STUDY001',
          criteriaText: 'Participants must be 18-65 years old, female only, no cancer diagnosis'
        }
      },
      validate: {
        url: 'POST /api/criteria/validate',
        body: {
          studyId: 'STUDY001',
          data: [
            {
              dob: '1998-03-15',
              gender: 'female',
              has_cancer: false,
              had_cancer: false,
              is_smoker: false,
              was_smoker: false,
              is_pregnant: false
            }
          ]
        }
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Criteria Validation System is running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/criteria/extract`);
  console.log(`   GET  http://localhost:${PORT}/api/criteria/:studyId`);
  console.log(`   POST http://localhost:${PORT}/api/criteria/validate`);
  console.log(`   DELETE http://localhost:${PORT}/api/criteria/:studyId`);
  console.log(`   PUT  http://localhost:${PORT}/api/criteria/:studyId/:criteriaId/status`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Gracefully shutting down...');
  const db = require('./database/database');
  db.close();
  process.exit(0);
});

module.exports = app;