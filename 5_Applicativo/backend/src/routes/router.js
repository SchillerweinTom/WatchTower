const express = require("express");
const router = express.Router();
const logger = require("../utils/apiLogger");
const { authenticateToken } = require("../middlewares/auth");
const { getLastHourData, getLastDayData, getLastWeekData } = require("../controllers/data");
const prisma = require("../config/db");

//TEMPERATURE, HUMIDITY, CO2

router.get("/:type/lastHour", authenticateToken, async (req, res) => {
  await getLastHourData(req.params.type, res);
});

router.get("/:type/lastDay", authenticateToken, async (req, res) => {
  await getLastDayData(req.params.type, res);
});

router.get("/:type/lastWeek", authenticateToken, async (req, res) => {
  await getLastWeekData(req.params.type, res);
});

//ACCESS

router.get("/access/chart", authenticateToken, async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const accessEvents = await prisma.access.findMany({
      where: { timestamp: { gte: oneWeekAgo } },
      orderBy: { timestamp: "desc" },
    });

    const accessSummary = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      accessSummary[dateStr] = { authorized: 0, unauthorized: 0 };
    }

    accessEvents.forEach((event) => {
      const dateStr = formatDate(event.timestamp);
      if (accessSummary[dateStr]) {
        if (event.authorized) {
          accessSummary[dateStr].authorized++;
        } else {
          accessSummary[dateStr].unauthorized++;
        }
      }
    });

    const chartLabels = Object.keys(accessSummary);
    const authorizedData = chartLabels.map(
      (date) => accessSummary[date].authorized
    );
    const unauthorizedData = chartLabels.map(
      (date) => accessSummary[date].unauthorized
    );

    logger.info("API call to /access/chart");

    return res.json({
      labels: chartLabels,
      datasets: [
        {
          label: "Authorized",
          data: authorizedData,
          backgroundColor: "#28A745",
        },
        {
          label: "Unauthorized",
          data: unauthorizedData,
          backgroundColor: "#F44336",
        },
      ],
    });
  } catch (error) {
    logger.error("Error fetching access control chart data.");
    res
      .status(500)
      .json({ message: "Error fetching access control chart data" });
  }
});

router.get("/access/table", authenticateToken, async (req, res) => {
  try {
    const accessEvents = await prisma.access.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    const formattedAccessList = accessEvents.map((event) => ({
      id: event.id,
      name: event.name,
      time: `${formatDate(event.timestamp)} ${formatTime(event.timestamp)}`,
      motive: event.motive,
      authorized: event.authorized,
    }));

    logger.info("API call to /access/table");

    return res.json(formattedAccessList);
  } catch (error) {
    logger.error("Error fetching recent access events.");
    res.status(500).json({ message: "Error fetching recent access events" });
  }
});

//NOTIFICATIONS

router.get("/alerts", authenticateToken, async (req, res) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const notifications = await prisma.alert.findMany({
      where: { user: req.user.username, status: "ACTIVE" },
      orderBy: { timestamp: "desc" },
    });

    const formattedNotifications = notifications.map((notification) => {
      return {
        ...notification,
        timestamp: `${formatDate(notification.timestamp)} ${formatTime(notification.timestamp)}`,
        severity: notification.severity.toLowerCase(),
        type: notification.type.toLowerCase()
      };
      
    });

    logger.info("API call to /alerts");

    return res.json(formattedNotifications);
  } catch (error) {
    logger.error("Error fetching alerts.", error);
    res.status(500).json({ message: "Error fetching alerts" });
  }
});

router.post("/alert-settings", authenticateToken, async (req, res) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const {
      user,
      co2_limit_max,
      hum_limit_max,
      hum_limit_min,
      temp_limit_max,
      temp_limit_min,
    } = req.body;

    if (!user) {
      return res.json({ message: "LDAP user is required" });
    }

    if (temp_limit_min >= temp_limit_max) {
      return res.json({
        message: "Minimum temperature must be less than maximum temperature",
      });
    }
    if (hum_limit_min >= hum_limit_max) {
      return res.json({
        message: "Minimum humidity must be less than maximum humidity",
      });
    }
    if (co2_limit_max <= 0) {
      return res.json({
        message: "Maximum CO2 limit must be a positive number",
      });
    }

    const MIN_TEMP = -50;
    const MAX_TEMP = 100;
    const MIN_HUMIDITY = 0;
    const MAX_HUMIDITY = 100;
    const MIN_CO2 = 0;
    const MAX_CO2 = 5000;

    if (temp_limit_min < MIN_TEMP || temp_limit_min > MAX_TEMP) {
      return res.json({
        message: `Temperature minimum must be between ${MIN_TEMP} and ${MAX_TEMP}°C`,
      });
    }
    if (temp_limit_max < MIN_TEMP || temp_limit_max > MAX_TEMP) {
      return res.json({
        message: `Temperature maximum must be between ${MIN_TEMP} and ${MAX_TEMP}°C`,
      });
    }
    if (hum_limit_min < MIN_HUMIDITY || hum_limit_min > MAX_HUMIDITY) {
      return res.json({
        message: `Humidity minimum must be between ${MIN_HUMIDITY}% and ${MAX_HUMIDITY}%`,
      });
    }
    if (hum_limit_max < MIN_HUMIDITY || hum_limit_max > MAX_HUMIDITY) {
      return res.json({
        message: `Humidity maximum must be between ${MIN_HUMIDITY}% and ${MAX_HUMIDITY}%`,
      });
    }
    if (co2_limit_max < MIN_CO2 || co2_limit_max > MAX_CO2) {
      return res.json({
        message: `CO2 maximum must be between ${MIN_CO2} ppm and ${MAX_CO2} ppm`,
      });
    }

    const newSetting = await prisma.alert_setting.upsert({
      where: { user },
      update: {
        temp_limit_min,
        temp_limit_max,
        hum_limit_min,
        hum_limit_max,
        co2_limit_max,
      },
      create: {
        user,
        temp_limit_min,
        temp_limit_max,
        hum_limit_min,
        hum_limit_max,
        co2_limit_max,
      },
    });

    logger.info(`Alert settings saved for ${user}`);

    return res.status(201).json({ message: "Success" });
  } catch (error) {
    logger.error(`Error saving alert settings`);
    return res.status(500).json({ message: "Error saving alert settings" });
  }
});

router.get("/alert-settings", authenticateToken, async (req, res) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const user = req.user.username;
    if (user) {
      const settings = await prisma.alert_setting.findUnique({
        where: { user },
      });

      if (!settings) {
        return res.json({ message: "No settings found" });
      }

      logger.info(`API call to /alert-settings`);

      return res.json(settings);
    }
  } catch (error) {
    logger.error("Error fetching alert settings.");
    return res.status(500).json({ message: "Error fetching alert settings" });
  }
});

router.put("/alert-resolved/:id", authenticateToken, async (req, res) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    logger.info(`API call to /alert-resolved`);

    const alertId = parseInt(req.params.id, 10);
    if (isNaN(alertId)) {
      return res.status(400).json({ message: "Invalid alert id" });
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: { status: "RESOLVED" },
    });

    logger.info(`Alert id ${alertId} marked as RESOLVED`);

    return res.json({ message: "Alert resolved successfully" });
  } catch (error) {
    logger.error("Error resolving an alert.");
    return res.status(500).json({ message: "Error resolving an alert" });
  }
});

// DASHBOARD

router.get("/temperature", authenticateToken, async (req, res) => {
  try {
    const temperatureData = await prisma.temperature.findFirst({
      orderBy: { timestamp: "desc" },
    });

    const previousTemperatureData = await prisma.temperature.findFirst({
      where: { timestamp: { lt: temperatureData.timestamp } },
      orderBy: { timestamp: "desc" },
    });

    const change = previousTemperatureData
      ? temperatureData.value - previousTemperatureData.value
      : 0;
    const description = previousTemperatureData
      ? `${change > 0 ? "+" : ""}${change.toFixed(1)}°C from last hour`
      : "No previous data available";

    logger.info(`API call to /temperature`);

    return res.json({
      value: temperatureData ? temperatureData.value : null,
      change: change,
      description: description,
    });
  } catch (error) {
    logger.error("Error fetching temperature data.");
    res.status(500).json({ message: "Error fetching temperature data" });
  }
});

router.get("/humidity", authenticateToken, async (req, res) => {
  try {
    const humidityData = await prisma.humidity.findFirst({
      orderBy: { timestamp: "desc" },
    });

    const previousHumidityData = await prisma.humidity.findFirst({
      where: { timestamp: { lt: humidityData.timestamp } },
      orderBy: { timestamp: "desc" },
    });

    const change = previousHumidityData
      ? humidityData.value - previousHumidityData.value
      : 0;

    const description = previousHumidityData
      ? `${change > 0 ? "+" : ""}${change.toFixed(1)}% from last hour`
      : "No previous data available";

    logger.info(`API call to /humidity`);

    return res.json({
      value: humidityData ? humidityData.value : null,
      change: change,
      description: description,
    });
  } catch (error) {
    logger.error("Error fetching humidity data.");
    res.status(500).json({ message: "Error fetching humidity data" });
  }
});

router.get("/access-attempts", authenticateToken, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);

    const accessAttemptsToday = await prisma.access.count({
      where: { timestamp: { gte: todayStart } },
    });

    const accessAttemptsYesterday = await prisma.access.count({
      where: { timestamp: { gte: yesterdayStart, lt: todayStart } },
    });

    const change = accessAttemptsToday - accessAttemptsYesterday;
    const description =
      change !== 0
        ? `${change > 0 ? "+" : ""}${change} access attempts from yesterday`
        : "No change in access attempts";

    logger.info(`API call to /access-attempts`);

    return res.json({
      value: accessAttemptsToday + "",
      description: description,
    });
  } catch (error) {
    logger.error("Error fetching access attempts data.");
    res.status(500).json({ message: "Error fetching access attempts data" });
  }
});

router.get("/co2", authenticateToken, async (req, res) => {
  try {
    const co2Data = await prisma.co2.findFirst({
      orderBy: { timestamp: "desc" },
    });

    const previousCo2Data = await prisma.co2.findFirst({
      where: { timestamp: { lt: co2Data.timestamp } },
      orderBy: { timestamp: "desc" },
    });

    const change = previousCo2Data ? co2Data.value - previousCo2Data.value : 0;
    const description = previousCo2Data
      ? `${change > 0 ? "+" : ""}${change.toFixed(1)} ppm from last hour`
      : "No previous data available";

    logger.info(`API call to /co2`);

    return res.json({
      value: co2Data ? co2Data.value : null,
      change: change,
      description: description,
    });
  } catch (error) {
    logger.error("Error fetching CO2 data.");
    res.status(500).json({ message: "Error fetching CO2 data" });
  }
});

// Helpers

const isAuthorized = (req) => {
  return (
    req.user && (req.user.role === "sistemista" || req.user.role === "docente")
  );
};

const formatDate = (date) => {
  return date.toISOString().split("T")[0].split("-").reverse().join(".");
};

const formatTime = (date) => {
  return date.toISOString().slice(11, 16);
};

module.exports = router;
