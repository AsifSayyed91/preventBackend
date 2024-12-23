// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//     try {
//       const authHeader = req.headers.authorization;
//       if (!authHeader) {
//         // console.error("Authorization header missing");
//         return res.status(401).json({ error: "Authorization header missing" });
//       }
  
//       const token = authHeader.split(" ")[1];
//       if (!token) {
//         // console.error("Token missing in Authorization header");
//         return res.status(401).json({ error: "Token missing" });
//       }
  
//     //   console.log("Token received in request:", token);
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     //   console.log("Decoded token:", decoded);
  
//       req.user = decoded;
//       next();
//     } catch (err) {
//     //   console.error("Authorization error:", err.message);
//       return res.status(401).json({ error: "Unauthorized" });
//     }
//   };
  

// module.exports = authMiddleware;


// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).json({ error: "Authorization header missing" });
//     }

//     const token = authHeader.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ error: "Token missing" });
//     }

//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decodedToken) {
//       return res.status(401).json({ error: "Invalid token" });
//     }

//     // Attach `id` and `role` to `req.user`
//     req.user = {
//       id: decodedToken.id, // User ID from token payload
//       role: decodedToken.role, // Role (SP or SSP) from token payload
//       partnerCode: user.partner_code,
//     };

//     next(); // Proceed to the next middleware or route handler
//   } catch (error) {
//     console.error("Authorization error:", error.message);
//     return res.status(401).json({ error: "Unauthorized" });
//   }
// };

// module.exports = authMiddleware;

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Attach `id`, `role`, and `partnerCode` to `req.user`
    req.user = {
      id: decodedToken.id, // User ID from the token payload
      role: decodedToken.role, // Role (e.g., SP or SSP) from the token payload
      partnerCode: decodedToken.partnerCode, // Ensure this matches your token payload structure
    };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Authorization error:", error.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = authMiddleware;
