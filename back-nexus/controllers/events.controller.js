import EventsService from "../services/events.service.js";

const EventsController = {
  getAll: async (req, res) => {
    try {
      const events = await EventsService.getAllEvents(req.query);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const event = await EventsService.getEventById(req.params.id);
      res.json(event);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const user = JSON.parse(req.headers.user || '{}');
      req.body.created_by = user.user_id;
      const id = await EventsService.createEvent(req.body);
      res.status(201).json({ event_id: id, message: "Event created successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const user = JSON.parse(req.headers.user || '{}');
      req.body.updated_by = user.user_id;
      await EventsService.updateEvent(req.params.id, req.body);
      res.json({ message: "Event updated successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await EventsService.deleteEvent(req.params.id);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getStatistics: async (req, res) => {
    try {
      const stats = await EventsService.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default EventsController;
