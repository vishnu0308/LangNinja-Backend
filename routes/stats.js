const express = require('express');
const { isAuth } = require("../middlewares");
const {statsController} = require('../controllers')

const router = express.Router();

router.post('/get-my-stats', isAuth, statsController.getMyStats );

router.post('/get-leaderboard', isAuth, statsController.getLeaderboard );

router.post('/reset-progress', isAuth, statsController.resetProgress );

module.exports = router;