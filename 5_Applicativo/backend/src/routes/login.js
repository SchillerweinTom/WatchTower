require("dotenv").config();
const express = require("express");
const { authenticate } = require("../controllers/ldap");
const logger = require("../controllers/authLogger");
const jwt = require("jsonwebtoken");

const login = express.Router();
login.use(express.json());

// API di login
login.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    try {
      // Autenticazione tramite LDAP
      const user = await authenticate(username, password);

      if (user) {
        // JWT Token
        const token = jwt.sign(
          { username: user.username, role: user.role },
          process.env.SECRET_KEY,
          { expiresIn: "6h" }
        );

        logger.info(`Login successful: ${username} (Role: ${user.role})`);
        return res.json({ token });
      }
    } catch (error) {
      if (error.code === "INVALID_CREDENTIALS") {
        logger.warn(`Failed login attempt: ${username} (Invalid credentials)`);
        return res.json({ message: "Invalid username or password" });
      }

      logger.error(`Login error for ${username}: ${error.message}`);
      return res.status(500).json({ message: "Internal server error" });
    }
  }else{
    logger.warn(`Failed login attempt: - (No credentials)`);
    return res.json({ message: "Insert username and password" });
  }
});


module.exports = login;
