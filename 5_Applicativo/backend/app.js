const express = require("express");
const cors = require("cors");
const logger = require("./src/utils/serverLogger.js");
const router = require('./src/routes/router.js');
const login = require('./src/routes/login.js');
const api = require('./src/routes/api.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', router);
app.use('/login', login);
app.use('/api', api);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server started on http://watchtower.caprover.samt.local/${PORT}`);
});
