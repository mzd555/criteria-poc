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



