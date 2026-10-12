/* Original backend file: backend/routes/bookings.js  (unchanged, registered for the browser) */
VVServer.define("routes/bookings.js", function (require, module, exports, __dirname) {

// Bookings Routes
const express = require("express");
const router = express.Router();
const store = require("../lib/store");
const { requireAuth } = require("../middleware/auth");

// GET /api/bookings
router.get("/", requireAuth, (req, res) => {
  const bookings = store.getBookings();
  res.json({ count: bookings.length, bookings });
});

// POST /api/bookings
router.post("/", requireAuth, (req, res) => {
  try {
    const booking = store.createBooking(req.body, req.user);
    res.status(201).json({ message: "Booking confirmed.", booking });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

});
