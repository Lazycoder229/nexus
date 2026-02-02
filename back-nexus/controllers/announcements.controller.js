import AnnouncementsService from "../services/announcements.service.js";

const AnnouncementsController = {
  getAll: async (req, res) => {
    try {
      const announcements = await AnnouncementsService.getAllAnnouncements(
        req.query,
      );
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const announcement = await AnnouncementsService.getAnnouncementById(
        req.params.id,
      );
      res.json(announcement);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  create: async (req, res) => {
    console.log("CREATE ANNOUNCEMENT - Request received:", req.body);
    try {
      // Use created_by from request body if provided, otherwise try to get from headers
      if (!req.body.created_by) {
        const user = JSON.parse(req.headers.user || "{}");
        req.body.created_by = user.user_id;
      }
      console.log("CREATE ANNOUNCEMENT - Calling service with data:", req.body);
      const id = await AnnouncementsService.createAnnouncement(req.body);
      console.log("CREATE ANNOUNCEMENT - Success, ID:", id);
      res.status(201).json({
        announcement_id: id,
        message: "Announcement created successfully",
      });
    } catch (error) {
      console.error("CREATE ANNOUNCEMENT - Error:", error);
      res.status(400).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const user = JSON.parse(req.headers.user || "{}");
      req.body.updated_by = user.user_id;
      await AnnouncementsService.updateAnnouncement(req.params.id, req.body);
      res.json({ message: "Announcement updated successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await AnnouncementsService.deleteAnnouncement(req.params.id);
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getStatistics: async (req, res) => {
    try {
      const stats = await AnnouncementsService.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default AnnouncementsController;
