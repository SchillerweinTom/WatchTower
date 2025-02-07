const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const logger = require("../controllers/apiLogger");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  res.send("API attiva!");
});

//TEMPERATURE

router.get("/temperature/lastHour", async (req, res) => {
  try {
    const data = await prisma.temperature.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take: 12,
    });

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No temperature data found" });
    }

    const formattedData = data.map(item => ({
      time: item.timestamp.toISOString().slice(11, 16),
      value: item.value,
    }));
    logger.info(`API call to /temperature/lastHour`);

    return res.json(formattedData);
  } catch (error) {
    console.error("Error fetching last hour records:", error);
    return res.status(500).json({ message: "Error fetching last hour records" });
  }
});

router.get("/temperature/lastDay", async (req, res) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now);
    twentyFourHoursAgo.setHours(now.getHours() - 24);

    const data = await prisma.temperature.findMany({
      where: {
        timestamp: {
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    const hourlyData = [];

    for (let hourOffset = 0; hourOffset < 24; hourOffset++) {
      const hourTime = new Date(now);
      hourTime.setHours(now.getHours() - hourOffset, 0, 0, 0);
      const hourLabel = `${String(hourTime.getHours()).padStart(2, "0")}:00`;

      const dataForHour = data.filter(item => new Date(item.timestamp).getHours() === hourTime.getHours());

      if (dataForHour.length > 0) {
        const latest = dataForHour[dataForHour.length - 1];
        hourlyData.push({
          time: hourLabel,
          value: latest.value,
        });
      } else {
        hourlyData.push({
          time: hourLabel,
          value: null,
        });
      }
    }
    logger.info(`API call to /temperature/lastDay`);

    return res.json(hourlyData.reverse());
  } catch (error) {
    console.error("Error fetching hourly temperature:", error);
    return res.status(500).json({ message: "Error fetching hourly temperature" });
  }
});

router.get("/temperature/lastWeek", async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const data = await prisma.temperature.findMany({
      where: {
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    const dailyData = {};

    data.forEach((entry) => {
      const date = new Date(entry.timestamp).toISOString().split("T")[0];

      if (!dailyData[date] || entry.value > dailyData[date]) {
        dailyData[date] = entry.value; 
      }
    });

    const formattedData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      formattedData.push({
        time: date.toLocaleDateString("en-US", { weekday: "long" }),
        value: dailyData[dateString] || null,
      });
    }

    logger.info(`API call to /temperature/lastWeek`);

    return res.json(formattedData);
  } catch (error) {
    console.error("Error fetching last week data:", error);
    return res.status(500).json({ message: "Error fetching last week temperature data" });
  }
});



//HUMIDITY

router.get("/humidity", async (req, res) => {
  const data = await prisma.humidity.findMany();
  res.json(data);
});

router.get("/humidity/g1", async (req, res) => {
  const data = [
    { time: "00:00", value: 45 },
    { time: "04:00", value: 41 },
    { time: "08:00", value: 48 },
    { time: "12:00", value: 50 },
    { time: "16:00", value: 52 },
    { time: "20:00", value: 48 },
    { time: "23:59", value: 46 },
  ];
  res.json(data);
});


//GAS (CO2)

router.get("/co2", async (req, res) => {
  const data = await prisma.humidity.findMany();
  res.json(data);
});

router.get("/co2/g1", async (req, res) => {
  const data = [
    { time: "00:00", value: 400 },
    { time: "04:00", value: 420 },
    { time: "08:00", value: 450 },
    { time: "12:00", value: 500 },
    { time: "16:00", value: 480 },
    { time: "20:00", value: 430 },
    { time: "23:59", value: 410 },
  ];
  res.json(data);
});


//ALERTS

router.post("/alert-settings", authenticateToken, async (req, res) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { user, co2_limit_max, hum_limit_max, hum_limit_min, temp_limit_max, temp_limit_min } = req.body;

    if (!user) {
      return res.json({ message: "LDAP user is required" });
    }

    if (temp_limit_min >= temp_limit_max) {
      return res.json({ message: "Minimum temperature must be less than maximum temperature" });
    }
    if (hum_limit_min >= hum_limit_max) {
      return res.json({ message: "Minimum humidity must be less than maximum humidity" });
    }
    if (co2_limit_max <= 0) {
      return res.json({ message: "Maximum CO2 limit must be a positive number" });
    }

    const MIN_TEMP = -50;
    const MAX_TEMP = 100;
    const MIN_HUMIDITY = 0;
    const MAX_HUMIDITY = 100;
    const MIN_CO2 = 0;
    const MAX_CO2 = 5000;

    if (temp_limit_min < MIN_TEMP || temp_limit_min > MAX_TEMP) {
      return res.json({ message: `Temperature minimum must be between ${MIN_TEMP} and ${MAX_TEMP}°C` });
    }
    if (temp_limit_max < MIN_TEMP || temp_limit_max > MAX_TEMP) {
      return res.json({ message: `Temperature maximum must be between ${MIN_TEMP} and ${MAX_TEMP}°C` });
    }
    if (hum_limit_min < MIN_HUMIDITY || hum_limit_min > MAX_HUMIDITY) {
      return res.json({ message: `Humidity minimum must be between ${MIN_HUMIDITY}% and ${MAX_HUMIDITY}%` });
    }
    if (hum_limit_max < MIN_HUMIDITY || hum_limit_max > MAX_HUMIDITY) {
      return res.json({ message: `Humidity maximum must be between ${MIN_HUMIDITY}% and ${MAX_HUMIDITY}%` });
    }
    if (co2_limit_max < MIN_CO2 || co2_limit_max > MAX_CO2) {
      return res.json({ message: `CO2 maximum must be between ${MIN_CO2} ppm and ${MAX_CO2} ppm` });
    }
    
    const newSetting = await prisma.alert_setting.upsert({
      where: { user },
      update: { temp_limit_min, temp_limit_max, hum_limit_min, hum_limit_max, co2_limit_max },
      create: { user, temp_limit_min, temp_limit_max, hum_limit_min, hum_limit_max, co2_limit_max },
    });

    logger.info(`Alert settings saved for ${user}`);

    return res.status(201).json({message: "Success"});
  } catch (error) {
    logger.error(`Error saving alert settings`);
    console.error("Error saving alert settings:", error);
    return res.status(500).json({ message: "Error saving alert settings" });
  }
});

router.get("/alert-settings", authenticateToken, async (req, res) => {
  try {
    const user = req.user.username;
    if(user){
      const settings = await prisma.alert_setting.findUnique({
        where: { user },
      });
  
      if (!settings) {
        return res.json({ message: "No settings found" });
      }
  
      return res.json(settings);
    }
    
  } catch (error) {
    console.error("Error fetching alert settings:", error);
    return res.status(500).json({ message: "Error fetching alert settings" });
  }
});

// Middleware
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  

  if (!token) {
    return res.status(403).json({ message: "Access denied" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

const isAuthorized = (req) => {
  return req.user && (req.user.role === "sistemista" || req.user.role === "docente");
};

module.exports = router;
