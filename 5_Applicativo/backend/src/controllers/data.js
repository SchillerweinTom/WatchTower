const logger = require("../utils/apiLogger");
const prisma = require("../config/db");

async function getLastHourData(type, res) {
  try {
    const data = await prisma[type].findMany({
      orderBy: { timestamp: "desc" },
      take: 13,
    });

    let lastHourData = [];

    if (!data || data.length === 0) {
      logger.info(`No ${type} data available for the last hour.`);
      return res.json(lastHourData);
    }

    logger.info(`Successfully fetched ${type} records for the last hour.`);

    lastHourData = data.map((item) => ({
      time: item.timestamp.toISOString().slice(11, 16),
      value: item.value,
    }));

    return res.json(lastHourData.reverse());
  } catch (error) {
    logger.error(`Error fetching last hour ${type} records. ${error}`);
    return res
      .status(500)
      .json({ message: `Error fetching last hour ${type} records.` });
  }
}

async function getLastDayData(type, res) {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now);
    twentyFourHoursAgo.setHours(now.getHours() - 23, 0, 0, 0); // Start exactly 24 hours back

    const data = await prisma[type].findMany({
      where: { timestamp: { gte: twentyFourHoursAgo.toISOString() } },
      orderBy: { timestamp: "asc" },
    });

    let hourlyData = [];

    if (!data || data.length === 0) {
      logger.info(`No ${type} data available for the last day.`);
      return res.json(hourlyData);
    }

    logger.info(`Successfully fetched ${type} records for the last day.`);

    for (let i = 0; i < 24; i++) {
      const hourTime = new Date(twentyFourHoursAgo);
      hourTime.setHours(hourTime.getHours() + i);

      const hourLabel = `${String(hourTime.getHours()).padStart(2, "0")}:00`;

      const dataForHour = data.filter((item) => {
        const itemTime = new Date(item.timestamp);
        return (
          itemTime.getHours() === hourTime.getHours() &&
          itemTime.getDate() === hourTime.getDate() &&
          itemTime.getMonth() === hourTime.getMonth()
        );
      });

      hourlyData.push({
        time: hourLabel,
        value: dataForHour.length
          ? dataForHour[dataForHour.length - 1].value
          : null,
      });
    }

    return res.json(hourlyData);
  } catch (error) {
    logger.error(`Error fetching last day ${type} records: ${error.message}`);
    return res.status(500).json({ message: `Error fetching last day ${type} records.` });
  }
}

async function getLastWeekData(type, res) {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const data = await prisma[type].findMany({
      where: { timestamp: { gte: sevenDaysAgo.toISOString() } },
      orderBy: { timestamp: "asc" },
    });

    let dailyData = {};
    let formattedData = [];

    if (!data || data.length === 0) {
      logger.info(`No ${type} data available for the last week.`);
      return res.json(formattedData);
    }

    logger.info(`Successfully fetched ${type} records for the last week.`);

    data.forEach((entry) => {
      const date = new Date(entry.timestamp).toISOString().split("T")[0];
      if (!dailyData[date] || entry.value > dailyData[date]) {
        dailyData[date] = entry.value;
      }
    });

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      formattedData.push({
        time: date.toLocaleDateString("en-US", { weekday: "long" }),
        value: dailyData[dateString] || null,
      });
    }

    return res.json(formattedData);
  } catch (error) {
    logger.error(`Error fetching last week ${type} records.`);
    return res
      .status(500)
      .json({ message: `Error fetching last week ${type} records.` });
  }
}

module.exports = { getLastDayData, getLastHourData, getLastWeekData };
