// backend/src/app.js
console.log("--- 1. Loading app.js ---");

const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || [
    'http://localhost:5173',
    'https://bug-free-cod-vg7gg5v67j6cp79g-5173.app.github.dev',
    'https://bug-free-cod-vg7gg5v67j6cp79g.app.github.dev'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body) console.log('Body:', req.body);
  next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", apiRoutes);

// Placeholder for server listen logic
// To be implemented after setting up environment and dependencies
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


module.exports = app;
