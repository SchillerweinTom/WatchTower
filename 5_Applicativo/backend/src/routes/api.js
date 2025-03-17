const nodemailer = require("nodemailer");
const express = require("express");
const { authenticateToken } = require("../middlewares/auth");
const { createNotifications } = require("../controllers/alert");
const logger = require("../utils/apiLogger");
const prisma = require("../config/db");
const { fetchLdapUsers } = require("../controllers/ldap");

const api = express.Router();
api.use(express.json());

api.post("/temperature", authenticateToken, async (req, res) => {
  try {
    const { value, timestamp } = req.body;

    if (value && timestamp) {
      if (!isNaN(value) && !isNaN(Date.parse(timestamp))) {
        await prisma.temperature.create({
          data: {
            timestamp: new Date(timestamp).toISOString(),
            value,
          },
        });
        logger.info("Temperature data saved successfully in /api/temperature");

        createNotifications("TEMPERATURE", value, timestamp);

        return res
          .status(201)
          .json({ message: "Temperature data saved successfully" });
      } else {
        logger.error("Temperature value or timestamp not valid at /api/temperature");
      }
    } else {
      logger.error("Wrong data sended to /api/temperature");
    }
    return res.status(500).json({ message: "Invalid temperature data." });
  } catch (error) {
    logger.error(`Error saving temperature data.`);
    return res.status(500).json({ message: "Error saving temperature data." });
  }
});

api.post("/humidity", authenticateToken, async (req, res) => {
  try {
    const { value, timestamp } = req.body;

    if (value && timestamp) {
      if (!isNaN(value) && !isNaN(Date.parse(timestamp))) {
        await prisma.humidity.create({
          data: {
            timestamp: new Date(timestamp),
            value,
          },
        });
        logger.info("Humidity data saved successfully in /api/humidity");

        createNotifications("HUMIDITY", value, timestamp);

        return res
          .status(201)
          .json({ message: "Humidity data saved successfully" });
      } else {
        logger.error("Humidity value or timestamp not valid at /api/humidity");
      }
    } else {
      logger.error("Wrong data sended to /api/humidity");
    }
    return res.status(500).json({ message: "Invalid humidity data." });
  } catch (error) {
    logger.error(`Error saving humidity data.`);
    return res.status(500).json({ message: "Error saving humidity data." });
  }
});

api.post("/co2", authenticateToken, async (req, res) => {
  try {
    const { value, timestamp } = req.body;

    if (value && timestamp) {
      if (!isNaN(value) && !isNaN(Date.parse(timestamp))) {
        await prisma.co2.create({
          data: {
            timestamp: new Date(timestamp),
            value,
          },
        });
        logger.info("CO2 data saved successfully in /api/co2");

        createNotifications("CO2", value, timestamp);

        return res.status(201).json({ message: "CO2 data saved successfully" });
      } else {
        logger.error("CO2 value or timestamp not valid at /api/co2");
      }
    } else {
      logger.error("Wrong data sended to /api/co2");
    }
    return res.status(500).json({ message: "Invalid co2 data." });
  } catch (error) {
    logger.error(`Error saving co2 data.`);
    return res.status(500).json({ message: "Error saving co2 data." });
  }
});

api.post("/access", authenticateToken, async (req, res) => {
  try {
    const { name, motive, authorized, timestamp } = req.body;

    const ldapUsers = await fetchLdapUsers(["CN=Docenti", "CN=Sistemisti"]);
    
    if (timestamp && !isNaN(Date.parse(timestamp))) {

      if (!ldapUsers.some(user => user.username[0] === name)) {
        logger.info("User no more in LDAP in /api/access");
        logger.info("Removing user from link badge in /api/access");

        await prisma.badge_link.deleteMany({
          where: { user: name },
        });

        await prisma.access.create({
          data: {
            timestamp: new Date(timestamp),
            name: "",
            motive: "",
            authorized: false
          },
        });

        createNotifications("ACCESS", 0, timestamp);

        return res.status(403).json({ message: "User not in LDAP" });
      }

      await prisma.access.create({
        data: {
          timestamp: new Date(timestamp),
          name: name || "",
          motive: motive || "",
          authorized,
        },
      });
      logger.info("Access data saved successfully in /api/access");

      if (!authorized) {
        createNotifications("ACCESS", 0, timestamp);
      }

      return res
        .status(201)
        .json({ message: "Access data saved successfully" });
    } else {
      logger.error("Wrong data sended to /api/access");
    }
    return res.status(500).json({ message: "Invalid access data." });
  } catch (error) {
    logger.error(`Error saving access data. ${error}`);
    return res.status(500).json({ message: "Error saving access data." });
  }
});

api.post("/badge", authenticateToken, async (req, res) => {
  try {
    const { badge, code, timestamp } = req.body;

    const badgeData = await prisma.badge_link.findUnique({
      where: { otp: code }
    });

    if(!badgeData){
      logger.info("Badge otp invalid in /api/badge");
      return res.status(403).json({message: "Invalid OTP"});
    }

    const update = await prisma.badge_link.update({
      where: { otp: code },
      data: { badge: badge, otp: null}
    });

    await prisma.access.create({
      data: {
        timestamp: new Date(timestamp),
        name: badgeData.user || "",
        motive: "Badge linked",
        authorized: true,
      },
    });

    logger.info("Badge data saved successfully in /api/badge");
    return res.status(201).json({message: "Badge data updated"});    
  } catch (error) {
    logger.error(`Error saving badge data.`, error);
    return res.status(500).json({ message: "Error saving badge data." });
  }
});

api.get("/badge-linked", authenticateToken, async (req, res) => {
  try {
    const { badge } = req.body;

    const badgeData = await prisma.badge_link.findUnique({
      where: { badge: badge }
    });

    logger.info("Badge linked status requested in /api/badge-linked");  

    if(!badgeData){
      return res.json({linked: false});
    }else{
      return res.json({linked: true});
    }

  } catch (error) {
    logger.error(`Error fetching badge status.`, error);
    return res.status(500).json({ message: "Error fetching badge status." });
  }
});

api.get("/badge", authenticateToken, async (req, res) => {
  try {
    const { badge } = req.body;

    const badgeData = await prisma.badge_link.findUnique({
      where: { badge: badge }
    });

    logger.info("Badge user requested");  

    if(!badgeData){
      return res.json({user: ""});
    }else{
      return res.json({user: badgeData.user});
    }

  } catch (error) {
    logger.error(`Error fetching badge status.`, error);
    return res.status(500).json({ message: "Error fetching badge status." });
  }
});

module.exports = api;
