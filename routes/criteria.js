const express = require('express');
const router = express.Router();
const criteriaService = require('../services/criteriaService');

/**
 * POST /api/criteria/extract
 * Extract criteria from text and store in database
 */
router.post('/extract', async (req, res) => {
  try {
    const { studyId, criteriaText } = req.body;

    if (!studyId || !criteriaText) {
      return res.status(400).json({
        error: 'studyId and criteriaText are required'
      });
    }

    const result = await criteriaService.extractAndStoreCriteria(studyId, criteriaText);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(200).json(result);
    }

  } catch (error) {
    console.error('Error in /extract:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/criteria/:studyId
 * Get all criteria for a study
 */
router.get('/:studyId', async (req, res) => {
  try {
    const { studyId } = req.params;
    const criteria = await criteriaService.getCriteriaForStudy(studyId);
    
    res.json({
      studyId,
      criteria,
      count: criteria.length
    });

  } catch (error) {
    console.error('Error in GET /:studyId:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/criteria/validate
 * Validate data array against study criteria
 */
router.post('/validate', async (req, res) => {
  try {
    const { studyId, data } = req.body;

    if (!studyId || !data || !Array.isArray(data)) {
      return res.status(400).json({
        error: 'studyId and data array are required'
      });
    }

    const result = await criteriaService.validateData(studyId, data);
    res.json(result);

  } catch (error) {
    console.error('Error in /validate:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * DELETE /api/criteria/:studyId
 * Delete all criteria for a study
 */
router.delete('/:studyId', async (req, res) => {
  try {
    const { studyId } = req.params;
    const deletedCount = await criteriaService.deleteCriteriaForStudy(studyId);
    
    res.json({
      message: `Deleted ${deletedCount} criteria rules for study ${studyId}`,
      deletedCount
    });

  } catch (error) {
    console.error('Error in DELETE /:studyId:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * PUT /api/criteria/:studyId/:criteriaId/status
 * Update rule status (activate/deactivate)
 */
router.put('/:studyId/:criteriaId/status', async (req, res) => {
  try {
    const { studyId, criteriaId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: 'isActive must be a boolean value'
      });
    }

    const updated = await criteriaService.updateRuleStatus(studyId, criteriaId, isActive);
    
    if (updated) {
      res.json({
        message: `Rule ${criteriaId} ${isActive ? 'activated' : 'deactivated'} for study ${studyId}`,
        studyId,
        criteriaId,
        isActive
      });
    } else {
      res.status(404).json({
        error: 'Rule not found'
      });
    }

  } catch (error) {
    console.error('Error in PUT status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;