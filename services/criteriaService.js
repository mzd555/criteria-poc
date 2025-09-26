const db = require('../database/database');
const { CallLLM } = require('./dummyLLM');

class CriteriaService {
  
  /**
   * Extract criteria from text and store in database
   */
  async extractAndStoreCriteria(studyId, criteriaText) {
    try {
      // Call the dummy LLM to extract rules
      const llmResponse = CallLLM(criteriaText);
      
      if (!llmResponse) {
        return {
          success: false,
          message: 'No relevant criteria found in the provided text',
          rulesStored: 0
        };
      }

      const storedRules = [];
      
      // Store each rule in the database
      for (const rule of llmResponse.rules_found) {
        const storedRule = await this.storeRule(studyId, rule);
        storedRules.push(storedRule);
      }

      return {
        success: true,
        message: `Successfully extracted and stored ${storedRules.length} rules`,
        rulesStored: storedRules.length,
        rules: storedRules
      };

    } catch (error) {
      console.error('Error in extractAndStoreCriteria:', error);
      throw error;
    }
  }

  /**
   * Store a single rule in the database
   */
  async storeRule(studyId, rule) {
    const sql = `
      INSERT OR REPLACE INTO study_criteria_rules (
        study_id, criteria_id, rule_type, criteria_type,
        min_age, max_age, allowed_genders,
        diagnosis_cancer_allowed, history_smoking_allowed,
        current_smoking_allowed, current_pregnant_allowed,
        description, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      studyId,
      rule.criteria_id,
      rule.rule_type,
      rule.criteria_type,
      rule.parameters.min_age || null,
      rule.parameters.max_age || null,
      rule.parameters.allowed_genders ? JSON.stringify(rule.parameters.allowed_genders) : null,
      rule.parameters.diagnosis_cancer_allowed !== undefined ? rule.parameters.diagnosis_cancer_allowed : null,
      rule.parameters.history_smoking_allowed !== undefined ? rule.parameters.history_smoking_allowed : null,
      rule.parameters.current_smoking_allowed !== undefined ? rule.parameters.current_smoking_allowed : null,
      rule.parameters.current_pregnant_allowed !== undefined ? rule.parameters.current_pregnant_allowed : null,
      rule.description,
      true
    ];

    await db.run(sql, params);
    return rule;
  }

  /**
   * Get all criteria for a study
   */
  async getCriteriaForStudy(studyId) {
    const sql = `
      SELECT * FROM study_criteria_rules 
      WHERE study_id = ? AND is_active = 1
      ORDER BY rule_type, criteria_id
    `;
    
    const rules = await db.query(sql, [studyId]);
    
    // Parse JSON fields
    return rules.map(rule => ({
      ...rule,
      allowed_genders: rule.allowed_genders ? JSON.parse(rule.allowed_genders) : null
    }));
  }

  /**
   * Validate data array against study criteria
   */
  async validateData(studyId, dataArray) {
    try {
      const criteria = await this.getCriteriaForStudy(studyId);
      
      if (criteria.length === 0) {
        return {
          success: false,
          message: 'No criteria found for this study',
          results: []
        };
      }

      const validationResults = [];

      for (let i = 0; i < dataArray.length; i++) {
        const record = dataArray[i];
        const result = this.validateSingleRecord(record, criteria, i);
        validationResults.push(result);
      }

      const passedCount = validationResults.filter(r => r.passed).length;
      const failedCount = validationResults.length - passedCount;

      return {
        success: true,
        summary: {
          total: validationResults.length,
          passed: passedCount,
          failed: failedCount,
          passRate: ((passedCount / validationResults.length) * 100).toFixed(2) + '%'
        },
        results: validationResults
      };

    } catch (error) {
      console.error('Error in validateData:', error);
      throw error;
    }
  }

  /**
   * Validate a single record against criteria
   */
  validateSingleRecord(record, criteria, recordIndex) {
    const violations = [];
    let passed = true;

    for (const rule of criteria) {
      const violation = this.checkRule(record, rule);
      if (violation) {
        violations.push(violation);
        passed = false;
      }
    }

    return {
      recordIndex,
      recordData: record,
      passed,
      violations,
      violationCount: violations.length
    };
  }

  /**
   * Check a single rule against a record
   */
  checkRule(record, rule) {
    switch (rule.rule_type) {
      case 'age':
        return this.checkAgeRule(record, rule);
      case 'gender':
        return this.checkGenderRule(record, rule);
      case 'diagnosis_cancer':
        return this.checkCancerRule(record, rule);
      case 'history_smoking':
        return this.checkSmokingHistoryRule(record, rule);
      case 'current_smoking':
        return this.checkCurrentSmokingRule(record, rule);
      case 'current_pregnant':
        return this.checkPregnancyRule(record, rule);
      default:
        return null;
    }
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dob) {
    if (!dob) return null;
    
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return null;
    }
  }

  checkAgeRule(record, rule) {
    // Calculate age from dob
    const age = this.calculateAge(record.dob);
    
    if (age === null) {
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: 'Date of birth is required but not provided or invalid',
        expectedValue: `${rule.min_age || 'any'} - ${rule.max_age || 'any'} years`,
        actualValue: 'missing/invalid dob'
      };
    }

    if (rule.min_age !== null && age < rule.min_age) {
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: `Age ${age} (calculated from dob) is below minimum age ${rule.min_age}`,
        expectedValue: `>= ${rule.min_age} years`,
        actualValue: `${age} years`
      };
    }

    if (rule.max_age !== null && age > rule.max_age) {
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: `Age ${age} (calculated from dob) is above maximum age ${rule.max_age}`,
        expectedValue: `<= ${rule.max_age} years`,
        actualValue: `${age} years`
      };
    }

    return null;
  }

  checkGenderRule(record, rule) {
    const gender = record.gender;
    if (!gender) {
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: 'Gender is required but not provided',
        expectedValue: rule.allowed_genders.join(' or '),
        actualValue: 'missing'
      };
    }

    const allowedGenders = rule.allowed_genders;
    if (!allowedGenders.includes(gender.toLowerCase())) {
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: `Gender '${gender}' is not allowed`,
        expectedValue: allowedGenders.join(' or '),
        actualValue: gender
      };
    }

    return null;
  }

  checkCancerRule(record, rule) {
    // Smart cancer rule: check both current cancer (has_cancer) and cancer history (had_cancer)
    const hasCancer = record.has_cancer;
    const hadCancer = record.had_cancer;
    const allowed = rule.diagnosis_cancer_allowed;
    
    if (hasCancer === undefined || hadCancer === undefined) {
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: 'Cancer diagnosis information (has_cancer, had_cancer) is required but not provided',
        expectedValue: allowed ? 'any cancer status allowed' : 'no cancer (current or history)',
        actualValue: 'missing cancer information'
      };
    }

    // If rule doesn't allow cancer, check both current and history
    if (!allowed && (hasCancer === true || hadCancer === true)) {
      const cancerStatus = [];
      if (hasCancer) cancerStatus.push('current cancer');
      if (hadCancer) cancerStatus.push('cancer history');
      
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: `Cancer is not allowed but participant has: ${cancerStatus.join(' and ')}`,
        expectedValue: 'no cancer diagnosis (current or history)',
        actualValue: cancerStatus.join(' and ')
      };
    }

    return null;
  }

  checkSmokingHistoryRule(record, rule) {
    // Smart smoking history: check was_smoker field
    const wasSmoker = record.was_smoker;
    const allowed = rule.history_smoking_allowed;
    
    if (wasSmoker === undefined || wasSmoker === null) {
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: 'Smoking history information (was_smoker) is required but not provided',
        expectedValue: allowed ? 'any smoking history allowed' : 'no smoking history',
        actualValue: 'missing'
      };
    }

    // If rule doesn't allow smoking history but participant was a smoker
    if (!allowed && wasSmoker === true) {
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: 'Smoking history is not allowed but participant was a smoker',
        expectedValue: 'no smoking history',
        actualValue: 'was a smoker'
      };
    }

    return null;
  }

  checkCurrentSmokingRule(record, rule) {
    // Smart current smoking: check is_smoker field
    const isSmoker = record.is_smoker;
    const allowed = rule.current_smoking_allowed;
    
    if (isSmoker === undefined || isSmoker === null) {
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: 'Current smoking information (is_smoker) is required but not provided',
        expectedValue: allowed ? 'any current smoking status allowed' : 'non-smoker',
        actualValue: 'missing'
      };
    }

    // If rule doesn't allow current smoking but participant is a smoker
    if (!allowed && isSmoker === true) {
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: 'Current smoking is not allowed but participant is a current smoker',
        expectedValue: 'non-smoker',
        actualValue: 'current smoker'
      };
    }

    return null;
  }

  checkPregnancyRule(record, rule) {
    // Check is_pregnant field
    const isPregnant = record.is_pregnant;
    const allowed = rule.current_pregnant_allowed;
    
    if (isPregnant === undefined || isPregnant === null) {
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: 'Pregnancy information (is_pregnant) is required but not provided',
        expectedValue: allowed ? 'any pregnancy status allowed' : 'not pregnant',
        actualValue: 'missing'
      };
    }

    // If rule doesn't allow pregnancy but participant is pregnant
    if (!allowed && isPregnant === true) {
      return {
        criteriaId: rule.criteria_id,
        ruleType: rule.rule_type,
        message: 'Pregnancy is not allowed but participant is currently pregnant',
        expectedValue: 'not pregnant',
        actualValue: 'pregnant'
      };
    }

    return null;
  }

  /**
   * Delete criteria for a study
   */
  async deleteCriteriaForStudy(studyId) {
    const sql = 'DELETE FROM study_criteria_rules WHERE study_id = ?';
    const result = await db.run(sql, [studyId]);
    return result.changes;
  }

  /**
   * Update rule status (activate/deactivate)
   */
  async updateRuleStatus(studyId, criteriaId, isActive) {
    const sql = `
      UPDATE study_criteria_rules 
      SET is_active = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE study_id = ? AND criteria_id = ?
    `;
    const result = await db.run(sql, [isActive ? 1 : 0, studyId, criteriaId]);
    return result.changes > 0;
  }
}

module.exports = new CriteriaService();