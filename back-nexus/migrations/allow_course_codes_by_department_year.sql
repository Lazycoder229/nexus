-- Course codes may be reused in separate departments, year levels, or curricula.
-- The application rejects duplicate codes within the same department/year/curriculum.
ALTER TABLE courses
  DROP INDEX code,
  ADD UNIQUE KEY uq_courses_code_department_year_curriculum
    (code, department_id, year_level, curriculum_type);
