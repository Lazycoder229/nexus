-- Adds year-level categorization to course records.
-- Existing courses stay NULL until an administrator assigns their year level.
ALTER TABLE courses
  ADD COLUMN year_level ENUM('1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year') NULL
  AFTER curriculum_type;
