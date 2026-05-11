const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token",
      });
    }

    // 🔥 TOKEN FORMAT:
    // Bearer TOKEN

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      "secretkey"
    );

    req.userId = decoded.id;

    next();

  } catch (error) {

    res.status(401).json({
      message: "Invalid token",
    });

  }

};