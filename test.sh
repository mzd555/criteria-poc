# Extract criteria
curl -X POST http://localhost:3000/api/criteria/extract \
  -H "Content-Type: application/json" \
  -d '{"studyId":"TEST001","criteriaText":"18-65 years old, female only, no cancer"}'

# Validate data  
curl -X POST http://localhost:3000/api/criteria/validate \
  -H "Content-Type: application/json" \
  -d '{"studyId":"TEST001","data":[{"dob":"1990-01-01","gender":"female","has_cancer":false,"had_cancer":false,"is_smoker":false,"was_smoker":false,"is_pregnant":false}]}'