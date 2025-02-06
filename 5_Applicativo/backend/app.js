require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const router = require('./src/routes/router.js');
const login = require('./src/routes/login.js');

app.use(cors());
app.use(express.json());


app.use('/', router);
app.use('/login', login);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
