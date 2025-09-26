/**
 * Test data and examples for the Criteria Validation System
 * This file demonstrates how to use the API with the new data format
 */

// Example criteria texts to extract rules from
const exampleCriteriaTexts = {
    study1: "Participants must be 18-65 years old, female only, no cancer diagnosis or history",
    study2: "Age between 21 and 55, no current smoking, pregnancy allowed, cancer history ok but no active cancer",
    study3: "Adults over 30, both genders allowed, no smoking history, exclude pregnant women",
    study4: "Minimum age 25, maximum age 70, exclude any cancer (current or past), current smokers excluded"
  };
  
  // Example participant data with new format
  const exampleParticipantData = [
    {
      participantId: "P001",
      dob: "1990-06-15",        // Will calculate to ~34 years old
      gender: "female",
      has_cancer: false,        // Current cancer status
      had_cancer: false,        // Cancer history
      is_smoker: false,         // Current smoking status
      was_smoker: true,         // Smoking history
      is_pregnant: false
    },
    {
      participantId: "P002", 
      dob: "1985-12-03",        // Will calculate to ~39 years old
      gender: "male",
      has_cancer: false,
      had_cancer: true,         // Has cancer history
      is_smoker: true,          // Current smoker
      was_smoker: true,
      is_pregnant: false        // N/A for males but included for consistency
    },
    {
      participantId: "P003",
      dob: "2010-01-20",        // Will calculate to ~15 years old (too young)
      gender: "female", 
      has_cancer: false,
      had_cancer: false,
      is_smoker: false,
      was_smoker: false,
      is_pregnant: false
    },
    {
      participantId: "P004",
      dob: "1995-08-10",        // Will calculate to ~29 years old
      gender: "female",
      has_cancer: true,         // Currently has cancer
      had_cancer: true,
      is_smoker: false,
      was_smoker: false,
      is_pregnant: true         // Currently pregnant
    },
    {
      participantId: "P005",
      dob: "1975-04-25",        // Will calculate to ~50 years old
      gender: "female",
      has_cancer: false,
      had_cancer: false,
      is_smoker: false,
      was_smoker: false,
      is_pregnant: false
    }
  ];
  
  module.exports = {
    exampleCriteriaTexts,
    exampleParticipantData
  };