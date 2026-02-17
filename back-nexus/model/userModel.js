// userModel.js
import db from "../config/db.js";

export const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  // console.log("findUserByEmail result:", rows);
  return rows[0];
};

export const findUserById = async (userId) => {
  const [rows] = await db.query(
    `
    SELECT 
      u.*,
      s.student_number,
      s.course,
      s.major,
      s.year_level,
      s.previous_school,
      s.mailing_address,
      s.father_name,
      s.mother_name,
      s.parent_phone,
      e.employee_id,
      e.position_title,
      e.department,
      e.date_hired,
      e.specialization,
      e.educational_attainment,
      e.license_number,
      e.access_level
    FROM users u
    LEFT JOIN student_details s ON u.user_id = s.user_id
    LEFT JOIN employee_details e ON u.user_id = e.user_id
    WHERE u.user_id = ?
  `,
    [userId],
  );
  return rows[0];
};
// Fetch all users with their student or employee details
export const getAllUsers = async () => {
  const [rows] = await db.query(`
    SELECT 
      u.*,
      s.student_number,
      s.course,
      s.major,
      s.year_level,
      s.previous_school,
      s.mailing_address,
      s.father_name,
      s.mother_name,
      s.parent_phone,
      er.employee_id,
      er.department,
      er.position,
      er.hire_date,
      er.employment_status,
      e.position_title as detail_position_title,
      e.department as detail_department,
      e.specialization,
      e.educational_attainment,
      e.license_number,
      e.access_level
    FROM users u
    LEFT JOIN student_details s ON u.user_id = s.user_id
    LEFT JOIN employee_records er ON u.user_id = er.user_id
    LEFT JOIN employee_details e ON u.user_id = e.user_id
  `);
  return rows;
};

// Create a new student user
export const createStudentUser = async (userData) => {
  const {
    email,
    passwordHash,
    firstName,
    middleName,
    lastName,
    suffix,
    dateOfBirth,
    gender,
    phone,
    permanentAddress,
    profilePictureUrl,
    studentNumber,
    course,
    major,
    yearLevel,
    previousSchool,
    yearGraduated,
    mailingAddress,
    fatherName,
    motherName,
    parentPhone,
  } = userData;

  // Start a transaction
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1️ Insert into users table
    const [userResult] = await connection.query(
      `INSERT INTO users 
       (email, password_hash, role, first_name, middle_name, last_name, suffix, date_of_birth, gender, phone, permanent_address, profile_picture_url)
       VALUES (?, ?, 'Student', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        passwordHash, // <-- already hashed
        firstName,
        middleName || null,
        lastName,
        suffix || null,
        dateOfBirth || null,
        gender || null,
        phone || null,
        permanentAddress || null,
        profilePictureUrl || null,
      ],
    );

    const userId = userResult.insertId;

    // 2️ Insert into student_details table
    await connection.query(
      `INSERT INTO student_details 
       (user_id, student_number, course, major, year_level, previous_school, year_graduated, mailing_address, father_name, mother_name, parent_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        studentNumber,
        course,
        major,
        yearLevel,
        previousSchool,
        yearGraduated,
        mailingAddress,
        fatherName,
        motherName,
        parentPhone,
      ],
    );

    // Commit transaction
    await connection.commit();
    connection.release();

    return userId;
  } catch (err) {
    await connection.rollback();
    connection.release();
    throw err;
  }
};
// Create a new employee user (Admin, Faculty, Staff)
export const createEmployeeUser = async (userData) => {
  const {
    email,
    passwordHash,
    role = "Employee",
    firstName,
    middleName,
    lastName,
    suffix,
    dateOfBirth,
    gender,
    phone,
    permanentAddress,
    profilePictureUrl,
    status = "Active",
    employeeId,
    department,
    positionTitle,
    dateHired,
    specialization,
    educationalAttainment,
    licenseNumber,
    accessLevel,
  } = userData;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1️⃣ Insert into users table
    const [userResult] = await connection.query(
      `INSERT INTO users
        (email, password_hash, role, first_name, middle_name, last_name, suffix,
         date_of_birth, gender, phone, permanent_address, profile_picture_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        passwordHash,
        role,
        firstName,
        middleName || null,
        lastName,
        suffix || null,
        dateOfBirth || null,
        gender || null,
        phone || null,
        permanentAddress || null,
        profilePictureUrl || null,
        status,
      ],
    );

    const userId = userResult.insertId;

    // 2️⃣ Insert into employee_details table
    await connection.query(
      `INSERT INTO employee_details
        (user_id, employee_id, department, position_title, date_hired,
         specialization, educational_attainment, license_number, access_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        employeeId || null,
        department || null,
        positionTitle || null,
        dateHired || null,
        specialization || null,
        educationalAttainment || null,
        licenseNumber || null,
        accessLevel || null,
      ],
    );

    await connection.commit();
    connection.release();
    return userId;
  } catch (err) {
    await connection.rollback();
    connection.release();
    throw err;
  }
};

// Update a student user
export const updateStudentUser = async (userId, userData) => {
  const {
    email,
    passwordHash, // optional, only update if provided
    firstName,
    middleName,
    lastName,
    suffix,
    dateOfBirth,
    gender,
    phone,
    permanentAddress,
    profilePictureUrl,
    studentNumber,
    course,
    major,
    yearLevel,
    previousSchool,
    yearGraduated,
    mailingAddress,
    fatherName,
    motherName,
    parentPhone,
  } = userData;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1️ Update users table
    const updateUserFields = [
      email,
      firstName,
      middleName || null,
      lastName,
      suffix || null,
      dateOfBirth || null,
      gender || null,
      phone || null,
      permanentAddress || null,
      profilePictureUrl || null,
    ];

    let query = `
      UPDATE users
      SET email = ?, first_name = ?, middle_name = ?, last_name = ?, suffix = ?, 
          date_of_birth = ?, gender = ?, phone = ?, permanent_address = ?, profile_picture_url = ?
    `;
    if (passwordHash) query += `, password_hash = ?`;

    query += ` WHERE user_id = ?`;

    if (passwordHash) updateUserFields.push(passwordHash);
    updateUserFields.push(userId);

    await connection.query(query, updateUserFields);

    // 2️ Update student_details table
    await connection.query(
      `UPDATE student_details
       SET student_number = ?, course = ?, major = ?, year_level = ?, previous_school = ?, 
           year_graduated = ?, mailing_address = ?, father_name = ?, mother_name = ?, parent_phone = ?
       WHERE user_id = ?`,
      [
        studentNumber,
        course,
        major,
        yearLevel,
        previousSchool,
        yearGraduated,
        mailingAddress,
        fatherName,
        motherName,
        parentPhone,
        userId,
      ],
    );

    await connection.commit();
    connection.release();
    return true;
  } catch (err) {
    await connection.rollback();
    connection.release();
    throw err;
  }
};
export const updateEmployeeUser = async (userId, userData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1️⃣ Update users table (Partial Update)
    const userFields = [];
    const userValues = [];

    const userMappings = {
      email: "email",
      firstName: "first_name",
      middleName: "middle_name",
      lastName: "last_name",
      suffix: "suffix",
      dateOfBirth: "date_of_birth",
      gender: "gender",
      phone: "phone",
      permanentAddress: "permanent_address",
      profilePictureUrl: "profile_picture_url",
      status: "status",
      passwordHash: "password_hash", // handled separately if needed, but included here for completeness in mapping
    };

    Object.keys(userMappings).forEach((key) => {
      if (userData[key] !== undefined) {
        userFields.push(`${userMappings[key]} = ?`);
        userValues.push(userData[key]);
      }
    });

    if (userFields.length > 0) {
      userValues.push(userId);
      const userQuery = `UPDATE users SET ${userFields.join(", ")} WHERE user_id = ?`;
      await connection.query(userQuery, userValues);
    }

    // 2️⃣ Update employee_details table (Partial Update)
    const employeeFields = [];
    const employeeValues = [];

    const employeeMappings = {
      employeeId: "employee_id",
      department: "department",
      positionTitle: "position_title",
      dateHired: "date_hired",
      specialization: "specialization",
      educationalAttainment: "educational_attainment",
      licenseNumber: "license_number",
      accessLevel: "access_level",
    };

    Object.keys(employeeMappings).forEach((key) => {
      if (userData[key] !== undefined) {
        employeeFields.push(`${employeeMappings[key]} = ?`);
        employeeValues.push(userData[key]);
      }
    });

    if (employeeFields.length > 0) {
      employeeValues.push(userId);
      const employeeQuery = `UPDATE employee_details SET ${employeeFields.join(", ")} WHERE user_id = ?`;
      await connection.query(employeeQuery, employeeValues);
    }

    await connection.commit();
    connection.release();
    return true;
  } catch (err) {
    await connection.rollback();
    connection.release();
    throw err;
  }
};

//FROM MODEL
export const deleteUser = async (userId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Delete student details if exist
    await connection.query(`DELETE FROM student_details WHERE user_id = ?`, [
      userId,
    ]);

    // Delete employee details if exist
    await connection.query(`DELETE FROM employee_details WHERE user_id = ?`, [
      userId,
    ]);

    // Delete user record
    await connection.query(`DELETE FROM users WHERE user_id = ?`, [userId]);

    await connection.commit();
    connection.release();
    return true;
  } catch (err) {
    await connection.rollback();
    connection.release();
    throw err;
  }
};
