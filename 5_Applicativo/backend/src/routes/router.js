const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", (req, res) => {
  res.send("API attiva!");
});

// Endpoint per ottenere i dati dei sensori
router.get("/temperature", async (req, res) => {
  const data = await prisma.temperature.findMany();
  res.json(data);
});

// Endpoint per aggiungere una nuova lettura
router.post("/temperature", async (req, res) => {
  const { value } = req.body;
  const newEntry = await prisma.temperature.create({
    data: { value },
  });
  res.json(newEntry);
});

module.exports = router;
