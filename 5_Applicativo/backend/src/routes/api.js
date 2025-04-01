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
        logger.info(`API Call: Temperature data saved successfully - Value: ${value}`);

        createNotifications("TEMPERATURE", value, timestamp);

        return res
          .status(201)
          .json({ message: "Temperature data saved successfully" });
      } else {
        logger.error("API Call: Temperature value or timestamp not valid at /api/temperature");
      }
    } else {
      logger.error("API Call: Wrong data sended to /api/temperature");
    }
    return res.status(500).json({ message: "Invalid temperature data." });
  } catch (error) {
    logger.error(`API Call: Error saving temperature data in /api/temperature.`);
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
        logger.info(`API Call: Humidity data saved successfully - Value: ${value}`);

        createNotifications("HUMIDITY", value, timestamp);

        return res
          .status(201)
          .json({ message: "Humidity data saved successfully" });
      } else {
        logger.error("Api Call: Humidity value or timestamp not valid at /api/humidity");
      }
    } else {
      logger.error("API Call: Wrong data sended to /api/humidity");
    }
    return res.status(500).json({ message: "Invalid humidity data." });
  } catch (error) {
    logger.error(`API Call: Error saving humidity data in /api/humidity.`);
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
        logger.info(`API Call: CO2 data saved successfully - Value: ${value}`);

        createNotifications("CO2", value, timestamp);

        return res.status(201).json({ message: "CO2 data saved successfully" });
      } else {
        logger.error("API Call: CO2 value or timestamp not valid at /api/co2");
      }
    } else {
      logger.error("API Call: Wrong data sended to /api/co2");
    }
    return res.status(500).json({ message: "Invalid co2 data." });
  } catch (error) {
    logger.error(`API CAll: Error saving co2 data in /api/co2.`);
    return res.status(500).json({ message: "Error saving co2 data." });
  }
});

api.post("/access", authenticateToken, async (req, res) => {
  try {
    const { name, motive, authorized, timestamp } = req.body;

    const ldapUsers = await fetchLdapUsers(["CN=Docenti", "CN=Sistemisti"]);
    
    if (timestamp && !isNaN(Date.parse(timestamp))) {

      if (!ldapUsers.some(user => user.username[0] === name)) {
        logger.info("API Call: User no more in LDAP in /api/access");
        logger.info("API Call: Removing user from link badge in /api/access");

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
      logger.info("API Call: Access data saved successfully in /api/access");

      if (!authorized) {
        createNotifications("ACCESS", 0, timestamp);
      }

      return res
        .status(201)
        .json({ message: "Access data saved successfully" });
    } else {
      logger.error("API Call: Wrong data sended to /api/access");
    }
    return res.status(500).json({ message: "Invalid access data." });
  } catch (error) {
    logger.error(`API Call: Error saving access data in /api/access.`);
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
      logger.info("API Call: Badge otp invalid in /api/badge");
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

    logger.info("API Call: Badge data saved successfully in /api/badge");
    return res.status(201).json({message: "Badge data updated"});    
  } catch (error) {
    logger.error(`API Call: Error saving badge data in /api/badge.`);
    return res.status(500).json({ message: "Error saving badge data." });
  }
});

api.get("/badge-linked", authenticateToken, async (req, res) => {
  try {
    const { badge } = req.body;

    const badgeData = await prisma.badge_link.findUnique({
      where: { badge: badge }
    });

    logger.info("API Call: Badge linked status requested in /api/badge-linked");  

    if(!badgeData){
      return res.json({linked: false});
    }else{
      return res.json({linked: true});
    }

  } catch (error) {
    logger.error(`API Call: Error fetching badge status in /api/badge-linked.`);
    return res.status(500).json({ message: "Error fetching badge status." });
  }
});

api.get("/badge", authenticateToken, async (req, res) => {
  try {
    const { badge } = req.body;

    const badgeData = await prisma.badge_link.findUnique({
      where: { badge: badge }
    });

    logger.info("API Call: Badge user requested");  

    if(!badgeData){
      return res.json({user: ""});
    }else{
      return res.json({user: badgeData.user});
    }

  } catch (error) {
    logger.error(`API Call: Error fetching badge status in /api/badge.`);
    return res.status(500).json({ message: "Error fetching badge status." });
  }
});

module.exports = api;
