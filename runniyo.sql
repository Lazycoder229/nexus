ALTER TABLE courses
  ADD COLUMN curriculum_type ENUM('New', 'Old') NOT NULL DEFAULT 'Old' AFTER type;

ALTER TABLE courses
  ALTER COLUMN curriculum_type SET DEFAULT 'New';