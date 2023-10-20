const express = require("express");
const router = express.Router();

const authRoute = require("./auth");
const langRoute = require("./language");
const quizRoute = require("./quiz");

router.use("/auth",authRoute);

router.use("/lang",langRoute);

router.use("/quiz",quizRoute);

module.exports = router;
