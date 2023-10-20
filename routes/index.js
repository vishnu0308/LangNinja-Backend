const express = require("express");
const router = express.Router();

const authRoute = require("./auth");
const langRoute = require("./language");

router.use("/auth",authRoute);

router.use("/lang",langRoute);

module.exports = router;
