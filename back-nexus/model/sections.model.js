import pool from "../config/db.js";

const SectionsModel = {
  // Get all sections with course details
  getAllSections: async (filters = {}) => {
    try {
      let query = `
        SELECT 
          s.*,
          c.course_code,
          c.course_title,
          ap.period_name,
          ap.year
        FROM sections s
        LEFT JOIN courses c ON s.course_id = c.course_id
        LEFT JOIN academic_periods ap ON s.period_id = ap.period_id
        WHERE 1=1
      `;
      const params = [];

      if (filters.course_id) {
        query += " AND s.course_id = ?";
        params.push(filters.course_id);
      }

      if (filters.period_id) {
        query += " AND s.period_id = ?";
        params.push(filters.period_id);
      }

      if (filters.search) {
        query +=
          " AND (s.section_name LIKE ? OR c.course_code LIKE ? OR c.course_title LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += " ORDER BY s.created_at DESC";

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Get section by ID
  getSectionById: async (id) => {
    try {
      const [rows] = await pool.query(
        `SELECT 
          s.*,
          c.course_code,
          c.course_title,
          ap.period_name,
          ap.year
        FROM sections s
        LEFT JOIN courses c ON s.course_id = c.course_id
        LEFT JOIN academic_periods ap ON s.period_id = ap.period_id
        WHERE s.section_id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Create new section
  createSection: async (sectionData) => {
    try {
      const {
        course_id,
        period_id,
        section_name,
        room,
        max_capacity,
        schedule_day,
        schedule_time_start,
        schedule_time_end,
      } = sectionData;

      const [result] = await pool.query(
        `INSERT INTO sections 
        (course_id, period_id, section_name, room, max_capacity, current_enrolled, 
         schedule_day, schedule_time_start, schedule_time_end)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
        [
          course_id,
          period_id,
          section_name,
          room,
          max_capacity,
          schedule_day,
          schedule_time_start,
          schedule_time_end,
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  },

  // Update section
  updateSection: async (id, sectionData) => {
    try {
      const {
        course_id,
        period_id,
        section_name,
        room,
        max_capacity,
        schedule_day,
        schedule_time_start,
        schedule_time_end,
        status,
      } = sectionData;

      const [result] = await pool.query(
        `UPDATE sections 
        SET course_id = ?, period_id = ?, section_name = ?, room = ?, 
            max_capacity = ?, schedule_day = ?, schedule_time_start = ?, 
            schedule_time_end = ?, status = ?
        WHERE section_id = ?`,
        [
          course_id,
          period_id,
          section_name,
          room,
          max_capacity,
          schedule_day,
          schedule_time_start,
          schedule_time_end,
          status,
          id,
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Delete section
  deleteSection: async (id) => {
    try {
      const [result] = await pool.query(
        "DELETE FROM sections WHERE section_id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Get enrollment count for section
  getEnrollmentCount: async (sectionId) => {
    try {
      const [rows] = await pool.query(
        "SELECT current_enrolled FROM sections WHERE section_id = ?",
        [sectionId]
      );
      return rows[0]?.current_enrolled || 0;
    } catch (error) {
      throw error;
    }
  },

  // Update enrollment count
  updateEnrollmentCount: async (sectionId, increment = true) => {
    try {
      const operator = increment ? "+" : "-";
      const [result] = await pool.query(
        `UPDATE sections 
        SET current_enrolled = current_enrolled ${operator} 1 
        WHERE section_id = ?`,
        [sectionId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
};

export default SectionsModel;
