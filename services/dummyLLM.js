/**
 * Dummy LLM function that simulates AI extraction of criteria from text
 * In a real implementation, this would call an actual LLM API
 */

function CallLLM(criteriaText) {
    // Convert to lowercase for easier pattern matching
    const text = criteriaText.toLowerCase();
    
    const rulesFound = [];
    let criteriaCounter = 1;
  
    // Age pattern matching
    const agePatterns = [
      /(\d+)\s*-\s*(\d+)\s*years?\s*old/,
      /between\s*(\d+)\s*and\s*(\d+)\s*years/,
      /age\s*(\d+)\s*to\s*(\d+)/,
      /minimum\s*age\s*(\d+)/,
      /maximum\s*age\s*(\d+)/,
      /over\s*(\d+)\s*years/,
      /under\s*(\d+)\s*years/,
      /at\s*least\s*(\d+)\s*years/
    ];
  
    for (const pattern of agePatterns) {
      const match = text.match(pattern);
      if (match) {
        let minAge = null, maxAge = null;
        
        if (match[2]) {
          // Range pattern (min-max)
          minAge = parseInt(match[1]);
          maxAge = parseInt(match[2]);
        } else if (text.includes('minimum') || text.includes('at least') || text.includes('over')) {
          minAge = parseInt(match[1]);
        } else if (text.includes('maximum') || text.includes('under')) {
          maxAge = parseInt(match[1]);
        }
  
        rulesFound.push({
          criteria_id: `AGE${String(criteriaCounter++).padStart(3, '0')}`,
          rule_type: 'age',
          criteria_type: 'inclusion',
          parameters: {
            min_age: minAge,
            max_age: maxAge
          },
          description: `Age criteria: ${minAge ? `min ${minAge}` : ''} ${maxAge ? `max ${maxAge}` : ''}`
        });
        break;
      }
    }
  
    // Gender pattern matching
    const genderPatterns = [
      { pattern: /female\s*only|only\s*female|women\s*only/, value: ['female'] },
      { pattern: /male\s*only|only\s*male|men\s*only/, value: ['male'] },
      { pattern: /both\s*genders|all\s*genders|male\s*and\s*female/, value: ['male', 'female'] }
    ];
  
    for (const { pattern, value } of genderPatterns) {
      if (text.match(pattern)) {
        rulesFound.push({
          criteria_id: `GEN${String(criteriaCounter++).padStart(3, '0')}`,
          rule_type: 'gender',
          criteria_type: 'inclusion',
          parameters: {
            allowed_genders: value
          },
          description: `Gender restriction: ${value.join(', ')}`
        });
        break;
      }
    }
  
    // Cancer diagnosis patterns
    const cancerPatterns = [
      { pattern: /no\s*cancer|cancer\s*free|without\s*cancer|exclude.*cancer/, allowed: false, type: 'exclusion' },
      { pattern: /cancer\s*allowed|cancer\s*permitted|with\s*cancer/, allowed: true, type: 'inclusion' }
    ];
  
    for (const { pattern, allowed, type } of cancerPatterns) {
      if (text.match(pattern)) {
        rulesFound.push({
          criteria_id: `CAN${String(criteriaCounter++).padStart(3, '0')}`,
          rule_type: 'diagnosis_cancer',
          criteria_type: type,
          parameters: {
            diagnosis_cancer_allowed: allowed
          },
          description: `Cancer diagnosis ${allowed ? 'allowed' : 'not allowed'}`
        });
        break;
      }
    }
  
    // Smoking history patterns
    const smokingHistoryPatterns = [
      { pattern: /no\s*smoking\s*history|never\s*smoked|exclude.*smoking\s*history/, allowed: false, type: 'exclusion' },
      { pattern: /smoking\s*history\s*allowed|previous\s*smoking\s*ok|former\s*smoker/, allowed: true, type: 'inclusion' }
    ];
  
    for (const { pattern, allowed, type } of smokingHistoryPatterns) {
      if (text.match(pattern)) {
        rulesFound.push({
          criteria_id: `SMH${String(criteriaCounter++).padStart(3, '0')}`,
          rule_type: 'history_smoking',
          criteria_type: type,
          parameters: {
            history_smoking_allowed: allowed
          },
          description: `Smoking history ${allowed ? 'allowed' : 'not allowed'}`
        });
        break;
      }
    }
  
    // Current smoking patterns
    const currentSmokingPatterns = [
      { pattern: /no\s*current\s*smoking|non[\-\s]*smoker|exclude.*current.*smok/, allowed: false, type: 'exclusion' },
      { pattern: /current\s*smoking\s*allowed|active\s*smoker\s*ok/, allowed: true, type: 'inclusion' }
    ];
  
    for (const { pattern, allowed, type } of currentSmokingPatterns) {
      if (text.match(pattern)) {
        rulesFound.push({
          criteria_id: `SMC${String(criteriaCounter++).padStart(3, '0')}`,
          rule_type: 'current_smoking',
          criteria_type: type,
          parameters: {
            current_smoking_allowed: allowed
          },
          description: `Current smoking ${allowed ? 'allowed' : 'not allowed'}`
        });
        break;
      }
    }
  
    // Pregnancy patterns
    const pregnancyPatterns = [
      { pattern: /not\s*pregnant|exclude.*pregnan|no\s*pregnancy/, allowed: false, type: 'exclusion' },
      { pattern: /pregnancy\s*allowed|pregnant\s*women\s*ok/, allowed: true, type: 'inclusion' }
    ];
  
    for (const { pattern, allowed, type } of pregnancyPatterns) {
      if (text.match(pattern)) {
        rulesFound.push({
          criteria_id: `PRG${String(criteriaCounter++).padStart(3, '0')}`,
          rule_type: 'current_pregnant',
          criteria_type: type,
          parameters: {
            current_pregnant_allowed: allowed
          },
          description: `Pregnancy ${allowed ? 'allowed' : 'not allowed'}`
        });
        break;
      }
    }
  
    // Return false if no rules found, otherwise return the rules
    if (rulesFound.length === 0) {
      return false;
    }
  
    return {
      rules_found: rulesFound
    };
  }
  
  module.exports = { CallLLM };