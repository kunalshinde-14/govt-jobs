const jwt = require("jsonwebtoken");

const verifyAdmin = (
  req,
  res,
  next
) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        message: "No token",
      });

    }



    const token =
      authHeader.split(" ")[1];



    const decoded =
      jwt.verify(
        token,
        process.env.ADMIN_JWT_SECRET
      );



    if (!decoded.admin) {

      return res.status(403).json({
        message: "Not admin",
      });

    }



    next();

  } catch (error) {

    res.status(401).json({
      message: "Invalid token",
    });

  }

};

module.exports =
  verifyAdmin;