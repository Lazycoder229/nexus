-- ===========================
-- Database: Nexus
-- ===========================
CREATE DATABASE IF NOT EXISTS nexus;
USE nexus;

-- ===========================
-- 1. Core Users Table
-- Stores common information for all roles (Student, Admin, Faculty, Staff)
-- Passwords stored as secure hashes
-- ===========================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique identifier for each user
    email VARCHAR(255) NOT NULL UNIQUE,      -- Login email
    password_hash VARCHAR(255) NOT NULL,     -- Hashed password
    role ENUM('Student', 'Admin', 'Faculty', 'Staff') NOT NULL,  -- User role
    
    first_name VARCHAR(100) NOT NULL,        -- First name
    middle_name VARCHAR(100),                -- Middle name (optional)
    last_name VARCHAR(100) NOT NULL,         -- Last name
    suffix VARCHAR(20),                      -- Suffix (Jr., Sr., III, etc.)
    
    date_of_birth DATE,                      -- DOB (optional)
    gender VARCHAR(50),                      -- Gender (could also use ENUM)
    phone VARCHAR(50),                        -- Contact number
    permanent_address TEXT,                  -- Permanent address
    profile_picture_url VARCHAR(255),        -- Optional URL to profile picture
    
    status VARCHAR(50) DEFAULT 'Active',     -- Account status (Active, Leave, Terminated)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Creation timestamp
);

-- ===========================
-- 2. Student Details Table
-- 1-to-1 relationship with users table
-- Stores student-specific information
-- ===========================
CREATE TABLE student_details (
    user_id INT PRIMARY KEY,                  -- FK to users.user_id
    student_number VARCHAR(50) UNIQUE NOT NULL,  -- Unique student ID
    course VARCHAR(100),                      -- Student's course
    major VARCHAR(100),                       -- Major/track
    year_level VARCHAR(50),                   -- e.g., '1st Year', '4th Year'
    previous_school VARCHAR(255),             -- Previous school attended
    year_graduated YEAR,                      -- Year graduated from previous school
    mailing_address TEXT,                     -- Mailing address for student

    father_name VARCHAR(200),                 -- Parent/guardian names
    mother_name VARCHAR(200),
    parent_phone VARCHAR(50),                 -- Parent contact number

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE  -- Cascade delete if user removed
);

-- ===========================
-- 3. Employee Details Table
-- 1-to-1 relationship with users table
-- Stores faculty, staff, and admin-specific info
-- ===========================
CREATE TABLE employee_details (
    user_id INT PRIMARY KEY,                  -- FK to users.user_id
    employee_id VARCHAR(50) UNIQUE NOT NULL,  -- Unique employee ID
    department VARCHAR(100),                  -- Department or office
    position_title VARCHAR(100),              -- Job title
    date_hired DATE,                          -- Hiring date

    -- Faculty-specific fields
    specialization VARCHAR(150),              -- Area of expertise
    educational_attainment VARCHAR(150),     -- Degree or certifications
    license_number VARCHAR(50),               -- Professional license number

    -- Admin-specific fields
    access_level ENUM('Standard Admin', 'Super Admin'),  -- Admin access control

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ===========================
-- 4. RBAC Permissions Table
-- Stores all possible permissions/features/modules
-- ===========================
CREATE TABLE rbac_permissions (
    permission_id VARCHAR(10) PRIMARY KEY,  -- Unique short code for permission
    name VARCHAR(100) NOT NULL,             -- Permission name
    description TEXT                         -- Optional description of permission
);

-- ===========================
-- 5. Role Permissions Mapping Table
-- Maps roles to permissions (many-to-many)
-- ===========================
CREATE TABLE role_permissions (
    role ENUM('Student', 'Admin', 'Faculty', 'Staff') NOT NULL,  -- Role
    permission_id VARCHAR(10) NOT NULL,                           -- Permission ID
    is_allowed BOOLEAN DEFAULT FALSE,                             -- Permission flag (true/false)

    PRIMARY KEY (role, permission_id),                            -- Composite primary key
    FOREIGN KEY (permission_id) REFERENCES rbac_permissions(permission_id) ON DELETE CASCADE
);

-- ===========================
-- 6. Sample Permissions Insert
-- Initial RBAC data
-- ===========================
INSERT INTO rbac_permissions (permission_id, name, description) VALUES
('C1', 'Can Manage Courses', 'Create, edit, and delete course offerings.'),
('S1', 'Can View Student Grades', 'Access student academic performance records.'),
('U1', 'Can Manage User Accounts', 'Create, edit, and delete non-Admin user accounts.'),
('A1', 'Can Access Audit Logs', 'View system activity and security logs.');
-- ===========================
-- 7. Departments Table
-- Stores all academic/administrative departments
-- ===========================
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,      -- Unique ID for department
    name VARCHAR(100) NOT NULL UNIQUE,               -- Department name
    description TEXT,                                -- Optional description
    head_user_id INT,                                -- FK: Department head (employee)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (head_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 8. Courses Table
-- Stores all courses offered by the institution
-- ===========================
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,       -- Unique ID for course
    code VARCHAR(20) NOT NULL UNIQUE,              -- Course code (e.g., CS101)
    title VARCHAR(100) NOT NULL,                   -- Course title
    description TEXT,                              -- Optional course description
    units INT DEFAULT 3, 
    hours INT NOT NULL,
    type ENUM('Major','Minor') NOT NULL,                           -- Course type
    department_id INT NOT NULL,                     -- FK to department offering the course
    instructor_id INT,                              -- FK to faculty member (user_id)
    semester_offer VARCHAR(100) NOT NULL,
    status ENUM('Active', 'Inactive') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 9. Programs/Degrees Table
-- Stores all academic programs offered by the institution
-- ===========================
CREATE TABLE programs (
    program_id INT AUTO_INCREMENT PRIMARY KEY,       -- Unique ID for program
    code VARCHAR(20) NOT NULL UNIQUE,                -- Program code (e.g., BSIT, BSCS)
    name VARCHAR(150) NOT NULL,                      -- Program name
    description TEXT,                                -- Program description
    degree_type ENUM('Bachelor', 'Associate', 'Certificate', 'Diploma') DEFAULT 'Bachelor',
    duration_years INT DEFAULT 4,                    -- Duration in years
    department_id INT,                               -- FK to department offering the program
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

-- ===========================
-- 10. Academic Years/Semesters Table
-- Stores school years and semesters for enrollment periods
-- ===========================
CREATE TABLE academic_periods (
    period_id INT AUTO_INCREMENT PRIMARY KEY,
    school_year VARCHAR(20) NOT NULL,                -- e.g., "2024-2025"
    semester ENUM('1st Semester', '2nd Semester', 'Summer') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,                 -- Only one period can be active at a time
    status ENUM('Upcoming', 'Active', 'Closed') DEFAULT 'Upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_period (school_year, semester)
);

-- ===========================
-- 11. Prerequisites Table
-- Many-to-Many mapping between courses and their prerequisites
-- ===========================
CREATE TABLE prerequisites (
    prereq_link_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL, 
    prereq_course_id INT NOT NULL, 
    is_corequisite BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (course_id, prereq_course_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (prereq_course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- ===========================
-- 12. Enrollments Table
-- Tracks student course enrollments per academic period
-- ===========================
CREATE TABLE enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,                        -- FK to users.user_id (student)
    course_id INT NOT NULL,                         -- FK to courses.course_id
    period_id INT NOT NULL,                         -- FK to academic_periods.period_id
    
    enrollment_date DATE NOT NULL,                  -- Date student enrolled in course
    status ENUM('Enrolled', 'Dropped', 'Completed', 'Failed') DEFAULT 'Enrolled',
    
    -- Grades
    midterm_grade DECIMAL(5,2),                     -- Midterm grade (0-100 or 0.00-5.00)
    final_grade DECIMAL(5,2),                       -- Final grade
    remarks TEXT,                                    -- Additional notes or comments
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Prevent duplicate enrollments
    UNIQUE KEY unique_enrollment (student_id, course_id, period_id),
    
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES academic_periods(period_id) ON DELETE CASCADE
);
ALTER TABLE enrollments 
ADD COLUMN year_level VARCHAR(20) AFTER period_id;
-- ===========================
-- 13. Admissions Table
-- Tracks student admission applications and status
-- ===========================
CREATE TABLE admissions (
    admission_id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Applicant Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(50),
    address TEXT,
    
    -- Academic Background
    previous_school VARCHAR(255),
    year_graduated YEAR,
    program_applied VARCHAR(150),                   -- Program/course applying for
    
    -- Application Details
    application_date DATE NOT NULL,
    entrance_exam_score DECIMAL(5,2),               -- Entrance exam score
    interview_date DATE,
    interview_notes TEXT,
    
    -- Status & Decision
    status ENUM('Pending', 'Under Review', 'Accepted', 'Rejected', 'Enrolled') DEFAULT 'Pending',
    decision_date DATE,
    decision_by INT,                                 -- FK to users.user_id (admin who decided)
    remarks TEXT,
    
    -- Documents
    documents_submitted TEXT,                        -- JSON or comma-separated list
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (decision_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 14. Course Transfers Table
-- Tracks course transfer and shifting requests
-- ===========================
CREATE TABLE course_transfers (
    transfer_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,                         -- FK to users.user_id
    
    -- Current & Target Information
    current_program VARCHAR(150),
    target_program VARCHAR(150) NOT NULL,
    reason TEXT,
    
    -- Request Details
    request_date DATE NOT NULL,
    status ENUM('Pending', 'Under Review', 'Approved', 'Rejected') DEFAULT 'Pending',
    
    -- Approval
    reviewed_by INT,                                 -- FK to users.user_id (admin/dean)
    review_date DATE,
    review_notes TEXT,
    
    -- Effectivity
    effective_period_id INT,                         -- FK to academic_periods.period_id
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (effective_period_id) REFERENCES academic_periods(period_id) ON DELETE SET NULL
);

-- ===========================
-- 15. Academic History Table
-- Tracks comprehensive academic history and milestones
-- ===========================
CREATE TABLE academic_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,                         -- FK to users.user_id
    period_id INT NOT NULL,                          -- FK to academic_periods.period_id
    
    -- Academic Standing
    year_level VARCHAR(50),
    semester_gpa DECIMAL(4,2),                       -- GPA for the semester
    cumulative_gpa DECIMAL(4,2),                     -- Overall GPA
    units_taken INT,
    units_passed INT,
    
    -- Status & Remarks
    academic_status ENUM('Regular', 'Irregular', 'Probation', 'Dean''s List', 'Dismissed') DEFAULT 'Regular',
    honors VARCHAR(100),                             -- Dean's List, President's List, etc.
    remarks TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_history (student_id, period_id),
    
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES academic_periods(period_id) ON DELETE CASCADE
);

-- ===========================
-- 16. Clearance Table
-- Tracks student clearance requirements and status
-- ===========================
CREATE TABLE clearances (
    clearance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,                         -- FK to users.user_id
    period_id INT NOT NULL,                          -- FK to academic_periods.period_id
    
    -- Clearance Requirements
    library_cleared BOOLEAN DEFAULT FALSE,
    registrar_cleared BOOLEAN DEFAULT FALSE,
    accounting_cleared BOOLEAN DEFAULT FALSE,
    dean_cleared BOOLEAN DEFAULT FALSE,
    guidance_cleared BOOLEAN DEFAULT FALSE,
    student_affairs_cleared BOOLEAN DEFAULT FALSE,
    
    -- Details
    library_remarks TEXT,
    registrar_remarks TEXT,
    accounting_remarks TEXT,
    dean_remarks TEXT,
    guidance_remarks TEXT,
    student_affairs_remarks TEXT,
    
    -- Overall Status
    overall_status ENUM('Incomplete', 'Pending', 'Cleared') DEFAULT 'Incomplete',
    cleared_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_clearance (student_id, period_id),
    
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES academic_periods(period_id) ON DELETE CASCADE
);

-- ===========================
-- FACULTY MANAGEMENT MODULE
-- Uses existing employee_details table for faculty information
-- ===========================

-- ===========================
-- 17. Faculty Course Assignments Table
-- Manages faculty teaching assignments
-- ===========================
CREATE TABLE IF NOT EXISTS faculty_course_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_user_id INT NOT NULL,                    -- FK to users.user_id (Faculty)
    course_id INT NOT NULL,
    academic_period_id INT NOT NULL,
    section VARCHAR(50),
    schedule_day VARCHAR(50),
    schedule_time_start TIME,
    schedule_time_end TIME,
    room VARCHAR(50),
    max_students INT,
    current_enrolled INT DEFAULT 0,
    assignment_status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    assigned_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (academic_period_id) REFERENCES academic_periods(period_id) ON DELETE CASCADE
);

-- ===========================
-- 18. Faculty Advisory Assignments Table
-- Faculty advisors for students
-- ===========================
CREATE TABLE IF NOT EXISTS faculty_advisory_assignments (
    advisory_id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_user_id INT NOT NULL,                    -- FK to users.user_id (Faculty)
    student_id INT NOT NULL,                         -- FK to users.user_id (Student)
    program_id INT,
    year_level INT,
    academic_period_id INT NOT NULL,
    assignment_date DATE,
    status ENUM('active', 'completed', 'transferred') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE SET NULL,
    FOREIGN KEY (academic_period_id) REFERENCES academic_periods(period_id) ON DELETE CASCADE
);

-- ===========================
-- 19. Faculty Evaluations Table
-- Faculty performance evaluations
-- ===========================
CREATE TABLE IF NOT EXISTS faculty_evaluations (
    evaluation_id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_user_id INT NOT NULL,                    -- FK to users.user_id (Faculty)
    evaluator_id INT,                                -- FK to users.user_id (Evaluator)
    evaluator_type ENUM('student', 'peer', 'admin', 'self') NOT NULL,
    academic_period_id INT NOT NULL,
    course_id INT,
    evaluation_date DATE,
    
    -- Evaluation criteria (1-5 scale)
    teaching_effectiveness INT CHECK (teaching_effectiveness BETWEEN 1 AND 5),
    subject_knowledge INT CHECK (subject_knowledge BETWEEN 1 AND 5),
    classroom_management INT CHECK (classroom_management BETWEEN 1 AND 5),
    communication_skills INT CHECK (communication_skills BETWEEN 1 AND 5),
    professionalism INT CHECK (professionalism BETWEEN 1 AND 5),
    student_engagement INT CHECK (student_engagement BETWEEN 1 AND 5),
    
    overall_rating DECIMAL(3,2),
    comments TEXT,
    recommendations TEXT,
    status ENUM('draft', 'submitted', 'reviewed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (evaluator_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (academic_period_id) REFERENCES academic_periods(period_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL
);

-- ===========================
-- 20. Faculty Schedules Table
-- Detailed schedule management for faculty
-- ===========================
CREATE TABLE IF NOT EXISTS faculty_schedules (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_user_id INT NOT NULL,                    -- FK to users.user_id (Faculty)
    academic_period_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    activity_type ENUM('teaching', 'consultation', 'meeting', 'break', 'other') DEFAULT 'teaching',
    course_id INT,
    section VARCHAR(50),
    room VARCHAR(50),
    notes TEXT,
    status ENUM('active', 'cancelled', 'rescheduled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (academic_period_id) REFERENCES academic_periods(period_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL
);

-- ===========================
-- 21. Faculty Consultation Hours Table
-- Faculty consultation availability
-- ===========================
CREATE TABLE IF NOT EXISTS faculty_consultation_hours (
    consultation_id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_user_id INT NOT NULL,                    -- FK to users.user_id (Faculty)
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    location VARCHAR(100),
    mode ENUM('in-person', 'online', 'hybrid') DEFAULT 'in-person',
    max_students INT DEFAULT 5,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ===========================
-- Indexes for Faculty Management
-- ===========================
CREATE INDEX idx_faculty_course_faculty ON faculty_course_assignments(faculty_user_id);
CREATE INDEX idx_faculty_course_period ON faculty_course_assignments(academic_period_id);
CREATE INDEX idx_advisory_faculty ON faculty_advisory_assignments(faculty_user_id);
CREATE INDEX idx_advisory_student ON faculty_advisory_assignments(student_id);
CREATE INDEX idx_evaluation_faculty ON faculty_evaluations(faculty_user_id);
CREATE INDEX idx_evaluation_period ON faculty_evaluations(academic_period_id);
CREATE INDEX idx_schedule_faculty ON faculty_schedules(faculty_user_id);
CREATE INDEX idx_schedule_day ON faculty_schedules(day_of_week);