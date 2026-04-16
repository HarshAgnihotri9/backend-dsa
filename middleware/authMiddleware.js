import jwt from "jsonwebtoken";

const JWT_SECRET = "your_secret_key";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // console.log("Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token or invalid format" });
  }

  // 🔥 Extract token
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};