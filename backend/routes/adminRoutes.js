const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();


// ✅ ADMIN LOGIN
router.post("/login", async (req, res) => {

  try {

    const { password } = req.body;

    // 🔒 PASSWORD FROM .env
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        message: "Wrong password",
      });
    }

    // ✅ SIGN WITH SEPARATE ADMIN SECRET
    const token = jwt.sign(
      { admin: true },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

});


module.exports = router;