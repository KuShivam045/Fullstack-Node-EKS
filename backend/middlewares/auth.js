const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // Unauthorized

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired. Please log in again." });
      }
      return res.status(403).json({ message: "Invalid token." });
    }

    // Attach the decoded user information to the request object
    req.user = user;

    next(); // Proceed to the next middleware or route handler
  });
}

function checkRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res
        .status(403)
        .json({
          message: "Forbidden: You do not have access to this resource",
        });
    }
    next();
  };
}

module.exports = {authenticateToken,checkRole};
