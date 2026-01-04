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

-- ===========================
-- ACADEMIC MANAGEMENT MODULE
-- ===========================

-- ===========================
-- 23. Sections Table
-- Course sections with capacity and schedule
-- ===========================
CREATE TABLE IF NOT EXISTS sections (
    section_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    period_id INT NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    room VARCHAR(100),
    max_capacity INT DEFAULT 40,
    current_enrolled INT DEFAULT 0,
    schedule_day VARCHAR(50),
    schedule_time_start TIME,
    schedule_time_end TIME,
    status ENUM('active', 'inactive', 'full') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES academic_periods(period_id) ON DELETE CASCADE,
    UNIQUE KEY unique_section (course_id, period_id, section_name)
);

-- ===========================
-- 24. Grades Table
-- Student grades with component breakdown
-- ===========================
CREATE TABLE IF NOT EXISTS grades (
    grade_id INT PRIMARY KEY AUTO_INCREMENT,
    student_user_id INT NOT NULL,
    course_id INT NOT NULL,
    period_id INT NOT NULL,
    prelim_grade DECIMAL(5,2),
    midterm_grade DECIMAL(5,2),
    finals_grade DECIMAL(5,2),
    final_grade DECIMAL(5,2),
    remarks VARCHAR(20),
    status ENUM('draft', 'submitted', 'approved') DEFAULT 'draft',
    approved_by INT,
    approved_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES academic_periods(period_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_grade (student_user_id, course_id, period_id)
);

-- ===========================
-- 25. Academic Events Table
-- Calendar events and important dates
-- ===========================
CREATE TABLE IF NOT EXISTS academic_events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    period_id INT,
    event_name VARCHAR(200) NOT NULL,
    event_type ENUM('enrollment', 'exam', 'holiday', 'meeting', 'deadline', 'activity', 'other') DEFAULT 'other',
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    location VARCHAR(200),
    target_audience ENUM('all', 'students', 'faculty', 'staff', 'admin') DEFAULT 'all',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (period_id) REFERENCES academic_periods(period_id) ON DELETE SET NULL
);

-- ===========================
-- 26. Syllabus Repository Table
-- Course syllabi with file storage
-- ===========================
CREATE TABLE IF NOT EXISTS syllabus (
    syllabus_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    period_id INT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    description TEXT,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES academic_periods(period_id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- Indexes for Academic Management
-- ===========================
CREATE INDEX idx_sections_course ON sections(course_id);
CREATE INDEX idx_sections_period ON sections(period_id);
CREATE INDEX idx_grades_student ON grades(student_user_id);
CREATE INDEX idx_grades_course ON grades(course_id);
CREATE INDEX idx_grades_period ON grades(period_id);
CREATE INDEX idx_events_date ON academic_events(start_date);
CREATE INDEX idx_events_type ON academic_events(event_type);
CREATE INDEX idx_syllabus_course ON syllabus(course_id);
CREATE INDEX idx_syllabus_period ON syllabus(period_id);

-- ===========================
-- ATTENDANCE MANAGEMENT MODULE
-- ===========================

-- ===========================
-- 27. RFID Cards Table
-- Stores RFID card information for attendance tracking
-- ===========================
CREATE TABLE IF NOT EXISTS rfid_cards (
    rfid_id INT PRIMARY KEY AUTO_INCREMENT,
    card_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,                        -- FK to users.user_id
    card_type ENUM('student', 'faculty', 'staff') NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    status ENUM('active', 'inactive', 'lost', 'damaged') DEFAULT 'active',
    last_used TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ===========================
-- 28. Staff Attendance Table
-- Tracks daily attendance for faculty and staff
-- ===========================
CREATE TABLE IF NOT EXISTS staff_attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,                        -- FK to users.user_id (Faculty/Staff)
    attendance_date DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    status ENUM('present', 'absent', 'late', 'half-day', 'on-leave') DEFAULT 'present',
    attendance_method ENUM('manual', 'rfid', 'biometric', 'mobile') DEFAULT 'manual',
    rfid_card_id INT,                            -- FK to rfid_cards.rfid_id
    location VARCHAR(100),
    remarks TEXT,
    verified_by INT,                             -- FK to users.user_id (Verifier)
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_staff_attendance (user_id, attendance_date),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (rfid_card_id) REFERENCES rfid_cards(rfid_id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 29. Student Attendance Table
-- Tracks student attendance per class/course
-- ===========================
CREATE TABLE IF NOT EXISTS student_attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,                     -- FK to users.user_id
    course_id INT NOT NULL,                      -- FK to courses.course_id
    section_id INT,                              -- FK to sections.section_id
    period_id INT NOT NULL,                      -- FK to academic_periods.period_id
    attendance_date DATE NOT NULL,
    time_in TIME,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    attendance_method ENUM('manual', 'rfid', 'biometric', 'mobile') DEFAULT 'manual',
    rfid_card_id INT,                            -- FK to rfid_cards.rfid_id
    marked_by INT,                               -- FK to users.user_id (Faculty who marked)
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE SET NULL,
    FOREIGN KEY (period_id) REFERENCES academic_periods(period_id) ON DELETE CASCADE,
    FOREIGN KEY (rfid_card_id) REFERENCES rfid_cards(rfid_id) ON DELETE SET NULL,
    FOREIGN KEY (marked_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 30. Absentee Alerts Table
-- Stores alerts and notifications for absenteeism
-- ===========================
CREATE TABLE IF NOT EXISTS absentee_alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,                        -- FK to users.user_id
    user_type ENUM('student', 'faculty', 'staff') NOT NULL,
    alert_type ENUM('consecutive_absence', 'excessive_absence', 'pattern_detected', 'custom') NOT NULL,
    period_id INT,                               -- FK to academic_periods.period_id
    course_id INT,                               -- FK to courses.course_id (for students)
    absence_count INT NOT NULL,
    threshold_exceeded INT,                      -- How much over the threshold
    alert_date DATE NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('pending', 'acknowledged', 'resolved', 'dismissed') DEFAULT 'pending',
    message TEXT,
    notified_to INT,                             -- FK to users.user_id (Who was notified)
    notified_at TIMESTAMP NULL,
    acknowledged_by INT,                         -- FK to users.user_id
    acknowledged_at TIMESTAMP NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES academic_periods(period_id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL,
    FOREIGN KEY (notified_to) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (acknowledged_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- Indexes for Attendance Management
-- ===========================
CREATE INDEX idx_rfid_card_number ON rfid_cards(card_number);
CREATE INDEX idx_rfid_user ON rfid_cards(user_id);
CREATE INDEX idx_staff_attendance_user ON staff_attendance(user_id);
CREATE INDEX idx_staff_attendance_date ON staff_attendance(attendance_date);
CREATE INDEX idx_student_attendance_student ON student_attendance(student_id);
CREATE INDEX idx_student_attendance_course ON student_attendance(course_id);
CREATE INDEX idx_student_attendance_date ON student_attendance(attendance_date);
CREATE INDEX idx_absentee_alerts_user ON absentee_alerts(user_id);
CREATE INDEX idx_absentee_alerts_status ON absentee_alerts(status);
CREATE INDEX idx_absentee_alerts_priority ON absentee_alerts(priority);

-- ===========================
-- 31. Exams Table
-- Stores exam definitions and configurations
-- ===========================
CREATE TABLE IF NOT EXISTS exams (
    exam_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(255) NOT NULL,
    exam_type ENUM('quiz', 'midterm', 'final', 'practical', 'project') NOT NULL,
    course_id INT NOT NULL,
    section_id INT,
    period_id INT,
    total_points DECIMAL(10,2) NOT NULL,
    passing_score DECIMAL(10,2),
    exam_duration INT,                           -- Duration in minutes
    description TEXT,
    instructions TEXT,
    status ENUM('draft', 'scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'draft',
    created_by INT,                              -- FK to users.user_id (faculty)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE SET NULL,
    FOREIGN KEY (period_id) REFERENCES academic_periods(period_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 32. Exam Schedules Table
-- Manages exam scheduling with venue and time
-- ===========================
CREATE TABLE IF NOT EXISTS exam_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    section_id INT,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue VARCHAR(255),
    room_id INT,                                 -- FK to rooms if available
    proctor_id INT,                              -- FK to users.user_id (faculty proctor)
    max_capacity INT,
    special_instructions TEXT,
    status ENUM('scheduled', 'rescheduled', 'cancelled', 'completed') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE SET NULL,
    FOREIGN KEY (proctor_id) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_venue_schedule (venue, exam_date, start_time)
);

-- ===========================
-- 33. Grade Entries Table
-- Stores individual grade submissions for approval workflow
-- ===========================
CREATE TABLE IF NOT EXISTS grade_entries (
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    section_id INT,
    period_id INT NOT NULL,
    exam_id INT,                                 -- FK to exams (if grade is for specific exam)
    component_name VARCHAR(100),                 -- e.g., 'Quiz 1', 'Midterm', 'Final', 'Attendance'
    component_type ENUM('exam', 'quiz', 'assignment', 'project', 'attendance', 'participation', 'other') DEFAULT 'other',
    raw_score DECIMAL(10,2),
    max_score DECIMAL(10,2),
    percentage DECIMAL(5,2),                     -- Calculated percentage
    weight DECIMAL(5,2),                         -- Weight in final grade
    weighted_score DECIMAL(10,2),                -- raw_score * weight
    remarks TEXT,
    submitted_by INT NOT NULL,                   -- FK to users.user_id (faculty)
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_status ENUM('pending', 'approved', 'rejected', 'revision_needed') DEFAULT 'pending',
    approved_by INT,                             -- FK to users.user_id (admin/department head)
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE SET NULL,
    FOREIGN KEY (period_id) REFERENCES academic_periods(period_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE SET NULL,
    FOREIGN KEY (submitted_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 34. Grade Computation Settings Table
-- Stores grade computation formulas and weights per course/section
-- ===========================
CREATE TABLE IF NOT EXISTS grade_computation_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    section_id INT,
    period_id INT NOT NULL,
    component_name VARCHAR(100) NOT NULL,        -- e.g., 'Quizzes', 'Midterm', 'Final Project'
    component_type ENUM('exam', 'quiz', 'assignment', 'project', 'attendance', 'participation', 'other') NOT NULL,
    weight DECIMAL(5,2) NOT NULL,                -- Percentage weight (e.g., 30.00 for 30%)
    passing_percentage DECIMAL(5,2),             -- Minimum passing for this component
    computation_method ENUM('average', 'total', 'highest', 'weighted_average') DEFAULT 'average',
    drop_lowest INT DEFAULT 0,                   -- Number of lowest scores to drop
    is_required BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_by INT,                              -- FK to users.user_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES academic_periods(period_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- Indexes for Examination & Grading
-- ===========================
CREATE INDEX idx_exams_course ON exams(course_id);
CREATE INDEX idx_exams_section ON exams(section_id);
CREATE INDEX idx_exams_period ON exams(period_id);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exam_schedules_exam ON exam_schedules(exam_id);
CREATE INDEX idx_exam_schedules_date ON exam_schedules(exam_date);
CREATE INDEX idx_exam_schedules_proctor ON exam_schedules(proctor_id);
CREATE INDEX idx_grade_entries_student ON grade_entries(student_id);
CREATE INDEX idx_grade_entries_course ON grade_entries(course_id);
CREATE INDEX idx_grade_entries_period ON grade_entries(period_id);
CREATE INDEX idx_grade_entries_approval ON grade_entries(approval_status);
CREATE INDEX idx_grade_computation_course ON grade_computation_settings(course_id);
CREATE INDEX idx_grade_computation_period ON grade_computation_settings(period_id);

-- ===========================
-- FINANCIAL & ACCOUNTING SYSTEM
-- ===========================

-- ===========================
-- 1. Tuition Fee Setup Table
-- Manages fee structures per program, year level, and semester
-- ===========================
CREATE TABLE tuition_fee_setup (
    fee_setup_id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT,
    year_level ENUM('1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year') NOT NULL,
    academic_period_id INT,
    
    tuition_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    laboratory_fee DECIMAL(10,2) DEFAULT 0.00,
    library_fee DECIMAL(10,2) DEFAULT 0.00,
    athletic_fee DECIMAL(10,2) DEFAULT 0.00,
    registration_fee DECIMAL(10,2) DEFAULT 0.00,
    id_fee DECIMAL(10,2) DEFAULT 0.00,
    miscellaneous_fee DECIMAL(10,2) DEFAULT 0.00,
    other_fees DECIMAL(10,2) DEFAULT 0.00,
    
    total_fee DECIMAL(10,2) GENERATED ALWAYS AS (
        tuition_fee + laboratory_fee + library_fee + athletic_fee + 
        registration_fee + id_fee + miscellaneous_fee + other_fees
    ) STORED,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE SET NULL,
    FOREIGN KEY (academic_period_id) REFERENCES academic_periods(period_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 2. Student Invoices Table
-- Generates invoices for students based on enrollment
-- ===========================
CREATE TABLE student_invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    enrollment_id INT,
    academic_period_id INT,
    
    tuition_fee DECIMAL(10,2) DEFAULT 0.00,
    laboratory_fee DECIMAL(10,2) DEFAULT 0.00,
    library_fee DECIMAL(10,2) DEFAULT 0.00,
    athletic_fee DECIMAL(10,2) DEFAULT 0.00,
    registration_fee DECIMAL(10,2) DEFAULT 0.00,
    id_fee DECIMAL(10,2) DEFAULT 0.00,
    miscellaneous_fee DECIMAL(10,2) DEFAULT 0.00,
    other_fees DECIMAL(10,2) DEFAULT 0.00,
    
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    scholarship_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    balance DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
    
    invoice_date DATE NOT NULL,
    due_date DATE,
    status ENUM('Pending', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled') DEFAULT 'Pending',
    
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE SET NULL,
    FOREIGN KEY (academic_period_id) REFERENCES academic_periods(period_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 3. Payment Collections Table
-- Records all payments made by students
-- ===========================
CREATE TABLE payment_collections (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    invoice_id INT NOT NULL,
    student_id INT NOT NULL,
    
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash', 'Check', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Online Payment', 'GCash', 'PayMaya') NOT NULL,
    payment_date DATE NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    bank_name VARCHAR(100),
    check_number VARCHAR(50),
    reference_number VARCHAR(100),
    
    payment_status ENUM('Pending', 'Verified', 'Cleared', 'Bounced', 'Cancelled') DEFAULT 'Pending',
    receipt_number VARCHAR(50) UNIQUE,
    
    notes TEXT,
    collected_by INT,
    verified_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES student_invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (collected_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 4. Scholarship Programs Table
-- Defines various scholarship programs available
-- ===========================
CREATE TABLE scholarship_programs (
    scholarship_id INT AUTO_INCREMENT PRIMARY KEY,
    scholarship_name VARCHAR(200) NOT NULL,
    scholarship_code VARCHAR(50) UNIQUE NOT NULL,
    scholarship_type ENUM('Full', 'Partial', 'Variable') NOT NULL,
    
    discount_type ENUM('Percentage', 'Fixed Amount') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    
    description TEXT,
    eligibility_criteria TEXT,
    required_gpa DECIMAL(3,2),
    required_income_level VARCHAR(100),
    
    total_budget DECIMAL(12,2),
    allocated_amount DECIMAL(12,2) DEFAULT 0.00,
    available_amount DECIMAL(12,2) GENERATED ALWAYS AS (total_budget - allocated_amount) STORED,
    
    max_beneficiaries INT,
    current_beneficiaries INT DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    academic_period_id INT,
    
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (academic_period_id) REFERENCES academic_periods(period_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 5. Scholarship Fund Allocation Table
-- Tracks scholarship allocation to specific students
-- ===========================
CREATE TABLE scholarship_allocations (
    allocation_id INT AUTO_INCREMENT PRIMARY KEY,
    scholarship_id INT NOT NULL,
    student_id INT NOT NULL,
    academic_period_id INT,
    
    allocated_amount DECIMAL(10,2) NOT NULL,
    disbursed_amount DECIMAL(10,2) DEFAULT 0.00,
    remaining_amount DECIMAL(10,2) GENERATED ALWAYS AS (allocated_amount - disbursed_amount) STORED,
    
    allocation_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    
    status ENUM('Pending', 'Approved', 'Active', 'Completed', 'Cancelled', 'Suspended') DEFAULT 'Pending',
    
    application_notes TEXT,
    approval_notes TEXT,
    approved_by INT,
    approval_date DATE,
    
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (scholarship_id) REFERENCES scholarship_programs(scholarship_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (academic_period_id) REFERENCES academic_periods(period_id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 6. Income & Expenses Table
-- Tracks all school income and expenses
-- ===========================
CREATE TABLE income_expenses (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_type ENUM('Income', 'Expense') NOT NULL,
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    
    category VARCHAR(100) NOT NULL,  -- e.g., 'Tuition', 'Salaries', 'Utilities', 'Supplies'
    subcategory VARCHAR(100),
    
    amount DECIMAL(12,2) NOT NULL,
    transaction_date DATE NOT NULL,
    
    description TEXT,
    payment_method ENUM('Cash', 'Check', 'Bank Transfer', 'Credit Card', 'Others'),
    reference_number VARCHAR(100),
    
    vendor_payee VARCHAR(200),  -- For expenses: vendor/supplier; For income: source
    
    department VARCHAR(100),
    academic_period_id INT,
    
    status ENUM('Pending', 'Approved', 'Paid', 'Cancelled') DEFAULT 'Pending',
    
    receipt_url VARCHAR(255),
    supporting_docs TEXT,
    
    requested_by INT,
    approved_by INT,
    processed_by INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (academic_period_id) REFERENCES academic_periods(period_id) ON DELETE SET NULL,
    FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 7. Payment Gateway Configuration Table
-- Stores payment gateway settings and credentials
-- ===========================
CREATE TABLE payment_gateway_config (
    gateway_id INT AUTO_INCREMENT PRIMARY KEY,
    gateway_name VARCHAR(100) NOT NULL,  -- e.g., 'PayPal', 'Stripe', 'GCash', 'PayMaya'
    gateway_type VARCHAR(50) NOT NULL,
    
    is_active BOOLEAN DEFAULT FALSE,
    is_test_mode BOOLEAN DEFAULT TRUE,
    
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    merchant_id VARCHAR(255),
    webhook_url VARCHAR(255),
    
    public_key TEXT,
    private_key TEXT,
    
    transaction_fee_type ENUM('Fixed', 'Percentage', 'Both') DEFAULT 'Percentage',
    transaction_fee_value DECIMAL(5,2) DEFAULT 0.00,
    
    supported_currencies VARCHAR(100) DEFAULT 'PHP',
    min_amount DECIMAL(10,2) DEFAULT 0.00,
    max_amount DECIMAL(10,2),
    
    configuration_json TEXT,  -- For additional settings in JSON format
    
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 8. Payment Gateway Transactions Table
-- Logs all transactions through payment gateways
-- ===========================
CREATE TABLE payment_gateway_transactions (
    gateway_transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT,
    gateway_id INT NOT NULL,
    
    external_transaction_id VARCHAR(255),  -- ID from the payment gateway
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    
    student_id INT NOT NULL,
    invoice_id INT,
    
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PHP',
    transaction_fee DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    
    payment_status ENUM('Initiated', 'Pending', 'Processing', 'Success', 'Failed', 'Cancelled', 'Refunded') DEFAULT 'Initiated',
    
    gateway_response TEXT,
    error_message TEXT,
    
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payment_id) REFERENCES payment_collections(payment_id) ON DELETE SET NULL,
    FOREIGN KEY (gateway_id) REFERENCES payment_gateway_config(gateway_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES student_invoices(invoice_id) ON DELETE SET NULL
);

-- ===========================
-- Indexes for Financial Tables
-- ===========================
CREATE INDEX idx_tuition_fee_program ON tuition_fee_setup(program_id);
CREATE INDEX idx_tuition_fee_period ON tuition_fee_setup(academic_period_id);
CREATE INDEX idx_tuition_fee_year_level ON tuition_fee_setup(year_level);

CREATE INDEX idx_invoices_student ON student_invoices(student_id);
CREATE INDEX idx_invoices_enrollment ON student_invoices(enrollment_id);
CREATE INDEX idx_invoices_period ON student_invoices(academic_period_id);
CREATE INDEX idx_invoices_status ON student_invoices(status);
CREATE INDEX idx_invoices_date ON student_invoices(invoice_date);

CREATE INDEX idx_payments_invoice ON payment_collections(invoice_id);
CREATE INDEX idx_payments_student ON payment_collections(student_id);
CREATE INDEX idx_payments_date ON payment_collections(payment_date);
CREATE INDEX idx_payments_status ON payment_collections(payment_status);
CREATE INDEX idx_payments_method ON payment_collections(payment_method);

CREATE INDEX idx_scholarships_type ON scholarship_programs(scholarship_type);
CREATE INDEX idx_scholarships_period ON scholarship_programs(academic_period_id);
CREATE INDEX idx_scholarships_active ON scholarship_programs(is_active);

CREATE INDEX idx_allocations_scholarship ON scholarship_allocations(scholarship_id);
CREATE INDEX idx_allocations_student ON scholarship_allocations(student_id);
CREATE INDEX idx_allocations_period ON scholarship_allocations(academic_period_id);
CREATE INDEX idx_allocations_status ON scholarship_allocations(status);

CREATE INDEX idx_income_expenses_type ON income_expenses(transaction_type);
CREATE INDEX idx_income_expenses_category ON income_expenses(category);
CREATE INDEX idx_income_expenses_date ON income_expenses(transaction_date);
CREATE INDEX idx_income_expenses_period ON income_expenses(academic_period_id);
CREATE INDEX idx_income_expenses_status ON income_expenses(status);

CREATE INDEX idx_gateway_config_active ON payment_gateway_config(is_active);
CREATE INDEX idx_gateway_trans_gateway ON payment_gateway_transactions(gateway_id);
CREATE INDEX idx_gateway_trans_student ON payment_gateway_transactions(student_id);
CREATE INDEX idx_gateway_trans_status ON payment_gateway_transactions(payment_status);

-- ===========================
-- HR & PAYROLL MANAGEMENT
-- ===========================

-- Employee Records Table (extends users table for Staff/Faculty)
CREATE TABLE employee_records (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    employee_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100),
    position VARCHAR(100) NOT NULL,
    employment_type ENUM('Full-time', 'Part-time', 'Contract', 'Temporary') DEFAULT 'Full-time',
    employment_status ENUM('Active', 'On Leave', 'Terminated', 'Retired') DEFAULT 'Active',
    
    hire_date DATE NOT NULL,
    end_date DATE NULL,
    
    basic_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    allowances DECIMAL(12, 2) DEFAULT 0.00,
    
    sss_number VARCHAR(50),
    tin_number VARCHAR(50),
    philhealth_number VARCHAR(50),
    pagibig_number VARCHAR(50),
    
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(100),
    
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(100),
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Staff Leave Management
CREATE TABLE staff_leave (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type ENUM('Sick Leave', 'Vacation Leave', 'Emergency Leave', 'Maternity Leave', 'Paternity Leave', 'Bereavement Leave', 'Unpaid Leave') NOT NULL,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT GENERATED ALWAYS AS (DATEDIFF(end_date, start_date) + 1) STORED,
    
    reason TEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
    
    approved_by INT NULL,
    approved_date TIMESTAMP NULL,
    rejection_reason TEXT,
    
    supporting_document_url VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employee_records(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Payroll Setup/Configuration
CREATE TABLE payroll_setup (
    payroll_setup_id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_period_start DATE NOT NULL,
    payroll_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    
    payroll_type ENUM('Monthly', 'Semi-Monthly', 'Weekly', 'Daily') DEFAULT 'Monthly',
    status ENUM('Draft', 'Processing', 'Completed', 'Cancelled') DEFAULT 'Draft',
    
    total_employees INT DEFAULT 0,
    total_gross_pay DECIMAL(15, 2) DEFAULT 0.00,
    total_deductions DECIMAL(15, 2) DEFAULT 0.00,
    total_net_pay DECIMAL(15, 2) DEFAULT 0.00,
    
    notes TEXT,
    
    created_by INT,
    processed_by INT,
    processed_date TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Payslip/Payroll Records
CREATE TABLE payslips (
    payslip_id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_setup_id INT NOT NULL,
    employee_id INT NOT NULL,
    
    payslip_number VARCHAR(50) NOT NULL UNIQUE,
    
    -- Earnings
    basic_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    allowances DECIMAL(12, 2) DEFAULT 0.00,
    overtime_pay DECIMAL(12, 2) DEFAULT 0.00,
    bonus DECIMAL(12, 2) DEFAULT 0.00,
    other_earnings DECIMAL(12, 2) DEFAULT 0.00,
    gross_pay DECIMAL(12, 2) GENERATED ALWAYS AS (basic_salary + allowances + overtime_pay + bonus + other_earnings) STORED,
    
    -- Deductions
    sss_deduction DECIMAL(12, 2) DEFAULT 0.00,
    philhealth_deduction DECIMAL(12, 2) DEFAULT 0.00,
    pagibig_deduction DECIMAL(12, 2) DEFAULT 0.00,
    withholding_tax DECIMAL(12, 2) DEFAULT 0.00,
    loan_deduction DECIMAL(12, 2) DEFAULT 0.00,
    other_deductions DECIMAL(12, 2) DEFAULT 0.00,
    total_deductions DECIMAL(12, 2) GENERATED ALWAYS AS (sss_deduction + philhealth_deduction + pagibig_deduction + withholding_tax + loan_deduction + other_deductions) STORED,
    
    -- Net Pay
    net_pay DECIMAL(12, 2) GENERATED ALWAYS AS (gross_pay - total_deductions) STORED,
    
    -- Work Details
    days_worked DECIMAL(5, 2) DEFAULT 0,
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    late_hours DECIMAL(5, 2) DEFAULT 0,
    absences INT DEFAULT 0,
    
    remarks TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payroll_setup_id) REFERENCES payroll_setup(payroll_setup_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employee_records(employee_id) ON DELETE CASCADE
);

-- Deduction Management
CREATE TABLE deductions (
    deduction_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    
    deduction_type ENUM('SSS', 'PhilHealth', 'Pag-IBIG', 'Withholding Tax', 'Loan', 'Cash Advance', 'Late/Absences', 'Other') NOT NULL,
    deduction_name VARCHAR(200) NOT NULL,
    
    amount DECIMAL(12, 2) NOT NULL,
    frequency ENUM('One-time', 'Monthly', 'Semi-Monthly', 'Per Payroll') DEFAULT 'Monthly',
    
    start_date DATE NOT NULL,
    end_date DATE NULL,
    
    remaining_balance DECIMAL(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employee_records(employee_id) ON DELETE CASCADE
);

-- Payroll Reports/Summary
CREATE TABLE payroll_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_setup_id INT NOT NULL,
    
    report_type ENUM('Summary', 'Detailed', 'Department', 'Tax', 'Deductions', 'Bank Transfer') NOT NULL,
    report_name VARCHAR(200) NOT NULL,
    
    generated_by INT,
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    file_path VARCHAR(255),
    file_format VARCHAR(50),
    
    parameters JSON,
    
    FOREIGN KEY (payroll_setup_id) REFERENCES payroll_setup(payroll_setup_id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- Indexes for HR & Payroll Tables
-- ===========================
CREATE INDEX idx_employee_user ON employee_records(user_id);
CREATE INDEX idx_employee_number ON employee_records(employee_number);
CREATE INDEX idx_employee_department ON employee_records(department);
CREATE INDEX idx_employee_status ON employee_records(employment_status);

CREATE INDEX idx_leave_employee ON staff_leave(employee_id);
CREATE INDEX idx_leave_status ON staff_leave(status);
CREATE INDEX idx_leave_dates ON staff_leave(start_date, end_date);

CREATE INDEX idx_payroll_dates ON payroll_setup(payroll_period_start, payroll_period_end);
CREATE INDEX idx_payroll_status ON payroll_setup(status);

CREATE INDEX idx_payslip_payroll ON payslips(payroll_setup_id);
CREATE INDEX idx_payslip_employee ON payslips(employee_id);
CREATE INDEX idx_payslip_number ON payslips(payslip_number);

CREATE INDEX idx_deduction_employee ON deductions(employee_id);
CREATE INDEX idx_deduction_type ON deductions(deduction_type);
CREATE INDEX idx_deduction_active ON deductions(is_active);

CREATE INDEX idx_payroll_report_payroll ON payroll_reports(payroll_setup_id);
CREATE INDEX idx_payroll_report_type ON payroll_reports(report_type);
