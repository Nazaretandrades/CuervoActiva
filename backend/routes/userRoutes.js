const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  deleteUser,
} = require("../controllers/userController");
const { auth, authorizeRoles } = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", auth, getProfile);

router.get("/", auth, authorizeRoles("admin"), getAllUsers);
router.delete("/:id", auth, authorizeRoles("admin"), deleteUser);

module.exports = router;
