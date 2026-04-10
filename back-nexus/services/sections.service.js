import SectionsModel from "../model/sections.model.js";
import pool from "../config/db.js";

const SectionsService = {
  getAllSections: async (filters) => {
    try {
      return await SectionsModel.getAllSections(filters);
    } catch (error) {
      throw new Error(`Error fetching sections: ${error.message}`);
    }
  },

  getSectionById: async (id) => {
    try {
      const section = await SectionsModel.getSectionById(id);
      if (!section) {
        throw new Error("Section not found");
      }
      return section;
    } catch (error) {
      throw new Error(`Error fetching section: ${error.message}`);
    }
  },

  // Helper function to get course department
  getCourseDetails: async (courseId) => {
    try {
      const query = `
        SELECT course_id, department_id, code, title 
        FROM courses 
        WHERE course_id = ?
      `;
      const [rows] = await pool.query(query, [courseId]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching course details: ${error.message}`);
    }
  },

  // Helper function to create room if it doesn't exist
  createRoomIfNotExists: async (roomData) => {
    try {
      // Check if room already exists
      const checkQuery = `
        SELECT room_id FROM rooms 
        WHERE room_number = ? AND building = ? AND department_id = ?
      `;
      const [existing] = await pool.query(checkQuery, [
        roomData.room_number,
        roomData.building || "Not Specified",
        roomData.department_id,
      ]);

      if (existing.length > 0) {
        return existing[0].room_id; // Room already exists
      }

      // Create new room
      const createQuery = `
        INSERT INTO rooms (room_number, building, room_name, capacity, room_type, department_id, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Available')
      `;
      const [result] = await pool.query(createQuery, [
        roomData.room_number,
        roomData.building || "Not Specified",
        roomData.room_name || `Room ${roomData.room_number}`,
        roomData.capacity || 40,
        roomData.room_type || "Classroom",
        roomData.department_id,
      ]);

      return result.insertId;
    } catch (error) {
      console.error("Warning: Could not create room:", error.message);
      return null; // Don't fail section creation if room creation fails
    }
  },

  createSection: async (sectionData) => {
    try {
      // Validate required fields
      if (
        !sectionData.course_id ||
        !sectionData.period_id ||
        !sectionData.section_name
      ) {
        throw new Error("Missing required fields");
      }

      // If room is provided, extract room details and create room in rooms table
      if (sectionData.room) {
        const course = await SectionsService.getCourseDetails(
          sectionData.course_id,
        );

        if (course && course.department_id) {
          // Parse room number from room string (e.g., "211" or "rOOM 101")
          const roomNumber = sectionData.room.replace(/^room\s*/i, "").trim();

          await SectionsService.createRoomIfNotExists({
            room_number: roomNumber,
            building: "Main Campus",
            room_name: `${course.code} - ${roomNumber}`,
            capacity: 40,
            room_type: "Classroom",
            department_id: course.department_id,
          });
        }
      }

      const sectionId = await SectionsModel.createSection(sectionData);
      return await SectionsModel.getSectionById(sectionId);
    } catch (error) {
      throw new Error(`Error creating section: ${error.message}`);
    }
  },

  updateSection: async (id, sectionData) => {
    try {
      const updated = await SectionsModel.updateSection(id, sectionData);
      if (!updated) {
        throw new Error("Section not found or not updated");
      }
      return await SectionsModel.getSectionById(id);
    } catch (error) {
      throw new Error(`Error updating section: ${error.message}`);
    }
  },

  deleteSection: async (id) => {
    try {
      const deleted = await SectionsModel.deleteSection(id);
      if (!deleted) {
        throw new Error("Section not found");
      }
      return { message: "Section deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting section: ${error.message}`);
    }
  },

  getEnrollmentCount: async (sectionId) => {
    try {
      return await SectionsModel.getEnrollmentCount(sectionId);
    } catch (error) {
      throw new Error(`Error fetching enrollment count: ${error.message}`);
    }
  },
};

export default SectionsService;
