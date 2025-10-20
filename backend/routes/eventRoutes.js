const express = require("express");
const router = express.Router();
const {
  listEvents,
  listOrganizerEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { auth, authorizeRoles } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.post(
  "/upload",
  auth,
  authorizeRoles("organizer"),
  upload.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No se subió imagen" });

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ image_url: imageUrl });
  }
);


router.get(
  "/organizer",
  auth,
  authorizeRoles("organizer", "admin"),
  listOrganizerEvents
);

router.get("/", listEvents);
router.get("/:id", getEvent);

// 🔹 Solo organizadores pueden crear eventos
router.post("/", auth, authorizeRoles("organizer"), createEvent);

// 🔹 Organizer edita los suyos / Admin edita todos
router.put("/:id", auth, authorizeRoles("organizer", "admin"), updateEvent);

// 🔹 Solo admin puede eliminar
router.delete("/:id", auth, authorizeRoles("admin"), deleteEvent);

module.exports = router;
