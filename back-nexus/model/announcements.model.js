import db from "../config/db.js";

const AnnouncementsModel = {
  getAllAnnouncements: (filters = {}) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT a.*, 
               CONCAT(u.first_name, ' ', u.last_name) as creator_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.user_id
        WHERE 1=1
      `;
      const params = [];

      if (filters.status) {
        query += " AND a.status = ?";
        params.push(filters.status);
      }

      if (filters.announcement_type) {
        query += " AND a.announcement_type = ?";
        params.push(filters.announcement_type);
      }

      if (filters.priority) {
        query += " AND a.priority = ?";
        params.push(filters.priority);
      }

      if (filters.target_audience) {
        query += " AND a.target_audience = ?";
        params.push(filters.target_audience);
      }

      if (filters.search) {
        query += " AND (a.title LIKE ? OR a.content LIKE ?)";
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      query += " ORDER BY a.is_pinned DESC, a.publish_date DESC";

      db.query(query, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getAnnouncementById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT a.*, 
               CONCAT(u.first_name, ' ', u.last_name) as creator_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.user_id
        WHERE a.announcement_id = ?
      `;
      db.query(query, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  createAnnouncement: (data) => {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO announcements SET ?";
      db.query(query, data, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  updateAnnouncement: (id, data) => {
    return new Promise((resolve, reject) => {
      const query = "UPDATE announcements SET ? WHERE announcement_id = ?";
      db.query(query, [data, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  deleteAnnouncement: (id) => {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM announcements WHERE announcement_id = ?";
      db.query(query, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  incrementViews: (id) => {
    return new Promise((resolve, reject) => {
      const query = "UPDATE announcements SET views_count = views_count + 1 WHERE announcement_id = ?";
      db.query(query, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getStatistics: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_announcements,
          SUM(CASE WHEN status = 'Published' THEN 1 ELSE 0 END) as published_count,
          SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as draft_count,
          SUM(CASE WHEN priority = 'Urgent' THEN 1 ELSE 0 END) as urgent_count,
          SUM(views_count) as total_views
        FROM announcements
      `;
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },
};

export default AnnouncementsModel;
