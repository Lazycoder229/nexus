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
    units INT DEFAULT 3,                            -- Number of credit units
    department_id INT NOT NULL,                     -- FK to department offering the course
    instructor_id INT,                              -- FK to faculty member teaching the course
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ===========================
-- 9. Optional: Student-Course Enrollment Table
-- Many-to-Many mapping between students and courses
-- ===========================
CREATE TABLE enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,                        -- FK to users.user_id (Student)
    course_id INT NOT NULL,                         -- FK to courses.course_id
    semester VARCHAR(20),                           -- e.g., 'Fall 2025'
    year INT,                                       -- Academic year
    grade VARCHAR(5),                               -- Optional grade

    UNIQUE(student_id, course_id, semester, year), -- Prevent duplicate enrollment
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);
