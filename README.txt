 STEP 1 : 
 
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


STEP 2 : 

Insert data into the above table using the real criterias that you have, use any llm to do that.


STEP 3 :

CriteriaService.validateData is the function to run the validation.



SAMPLE SCRITPS

https://clinicaltrials.gov/api/v2/studies/NCT06602856

INSERT INTO study_criteria_rules (
    study_id, 
    criteria_id, 
    rule_type, 
    criteria_type, 
    min_age, 
    max_age, 
    allowed_genders, 
    diagnosis_cancer_allowed, 
    history_smoking_allowed, 
    current_smoking_allowed, 
    current_pregnant_allowed, 
    description, 
    is_active
) VALUES (
    'REGA_POCUS_001',           -- study_id
    'AGE001',                   -- criteria_id
    'age',                      -- rule_type
    'inclusion',                -- criteria_type (minimum age 18 = inclusion rule)
    18,                         -- min_age (must be >= 18)
    NULL,                       -- max_age (no upper limit specified)
    NULL,                       -- allowed_genders (not specified)
    NULL,                       -- diagnosis_cancer_allowed (not specified)
    NULL,                       -- history_smoking_allowed (not specified)
    NULL,                       -- current_smoking_allowed (not specified)
    NULL,                       -- current_pregnant_allowed (not specified)
    'Minimum age 18 years (derived from exclusion: Age <18 years)', -- description
    1                           -- is_active
);


https://clinicaltrials.gov/api/v2/studies/NCT05610865

-- Age range: 20-60 years
INSERT INTO study_criteria_rules (
    study_id, criteria_id, rule_type, criteria_type, 
    min_age, max_age, allowed_genders, 
    diagnosis_cancer_allowed, history_smoking_allowed, current_smoking_allowed, current_pregnant_allowed,
    description, is_active
) VALUES (
    'DIABETES_FOOT_001', 'AGE001', 'age', 'inclusion',
    20, 60, NULL,
    NULL, NULL, NULL, NULL,
    'Age 20-60 years (Male/Female)',
    1
);

-- Gender: Male/Female (both allowed)
INSERT INTO study_criteria_rules (
    study_id, criteria_id, rule_type, criteria_type,
    min_age, max_age, allowed_genders,
    diagnosis_cancer_allowed, history_smoking_allowed, current_smoking_allowed, current_pregnant_allowed,
    description, is_active
) VALUES (
    'DIABETES_FOOT_001', 'GEN001', 'gender', 'inclusion',
    NULL, NULL, '["male", "female"]',
    NULL, NULL, NULL, NULL,
    'Male and Female participants allowed',
    1
);


https://clinicaltrials.gov/api/v2/studies/NCT05257967

-- Age >= 18 years
INSERT INTO study_criteria_rules (
    study_id, criteria_id, rule_type, criteria_type, 
    min_age, max_age, allowed_genders, 
    diagnosis_cancer_allowed, history_smoking_allowed, current_smoking_allowed, current_pregnant_allowed,
    description, is_active
) VALUES (
    'NSCLC_LEPTO_001', 'AGE001', 'age', 'inclusion',
    18, NULL, NULL,
    NULL, NULL, NULL, NULL,
    'Subject age greater than or equal to 18 years',
    1
);
