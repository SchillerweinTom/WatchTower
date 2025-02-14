const logger = require("../utils/apiLogger");
const prisma = require("../config/db");

async function getLastHourData(type, res) {
    try {
      const data = await prisma[type].findMany({
        orderBy: { timestamp: "desc" },
        take: 12,
      });
  
      if (!data || data.length === 0) {
        return res.status(404).json({ message: `No ${type} data found` });
      }
  
      const formattedData = data.map((item) => ({
        time: item.timestamp.toISOString().slice(11, 16),
        value: item.value,
      }));
  
      logger.info(`API call to /${type}/lastHour`);
      return res.json(formattedData.reverse());
    } catch (error) {
      logger.error(`Error fetching last hour ${type} records.`);
      return res
        .status(500)
        .json({ message: `Error fetching last hour ${type} records.` });
    }
  }
  
  async function getLastDayData(type, res) {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now);
      twentyFourHoursAgo.setHours(now.getHours() - 24);
  
      const data = await prisma[type].findMany({
        where: { timestamp: { gte: twentyFourHoursAgo.toISOString() } },
        orderBy: { timestamp: "asc" },
      });
  
      const hourlyData = [];
  
      logger.info(`API call to /${type}/lastDay`);
  
      if (!data || data.length === 0) {
        return res.json(hourlyData);
      }
  
      for (let i = 0; i < 24; i++) {
        const hourTime = new Date(now);
        hourTime.setHours(now.getHours() - i, 0, 0, 0);
        const hourLabel = `${String(hourTime.getHours()).padStart(2, "0")}:00`;
  
        const dataForHour = data.filter(
          (item) => new Date(item.timestamp).getHours() === hourTime.getHours()
        );
  
        hourlyData.push({
          time: hourLabel,
          value: dataForHour.length
            ? dataForHour[dataForHour.length - 1].value
            : null,
        });
      }
  
      return res.json(hourlyData.reverse());
    } catch (error) {
      logger.error(`Error fetching last day ${type} records.`);
      return res
        .status(500)
        .json({ message: `Error fetching last day ${type} records.` });
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
  
      const dailyData = {};
      const formattedData = [];
  
      if (!data || data.length === 0) {
        return res.json(formattedData);
      }
      
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
  
      logger.info(`API call to /${type}/lastWeek`);
      return res.json(formattedData);
    } catch (error) {
      logger.error(`Error fetching last week ${type} records.`);
      return res
        .status(500)
        .json({ message: `Error fetching last week ${type} records.` });
    }
  }

  module.exports = { getLastDayData, getLastHourData, getLastWeekData };