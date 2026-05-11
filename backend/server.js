const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns")

const userRoutes =
  require("./routes/userRoutes");

dns.setServers([ 
  '1.1.1.1',
  '8.8.8.8',
])

const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
const jobRoutes = require("./routes/jobRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);  
app.use("/api/users", userRoutes); 
// 🔥 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running...");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});