const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const cors = require("cors");

require("dotenv").config();

dns.setServers([
  "1.1.1.1",
  "8.8.8.8",
]);

const app = express();



// ROUTES
const userRoutes =
  require("./routes/userRoutes");

const adminRoutes =
  require("./routes/adminRoutes");

const jobRoutes =
  require("./routes/jobRoutes");

const authRoutes =
  require("./routes/authRoutes");

const cronRoutes =
  require("./routes/cronRoutes");



// CRON
const startDeleteExpiredJobs =
  require("./cron/deleteExpiredJobs");



// MIDDLEWARE
app.use(cors());

app.use(express.json());



// API ROUTES
app.use("/api/jobs", jobRoutes);

app.use("/api/jobs", cronRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/admin", adminRoutes);



// TEST ROUTE
app.get("/", (req, res) => {

  res.send("Backend running...");

});



// MONGODB CONNECTION
mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log(
      "MongoDB Connected"
    );



    // ✅ START CRON
    startDeleteExpiredJobs();

  })

  .catch((err) =>
    console.log(err)
  );



// SERVER
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});