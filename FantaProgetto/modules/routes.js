const express = require('express');
const router = express.Router();

const raceRoutes = require('./controller/races');
const userRoutes = require('./controller/users');
const teamRoutes = require('./controller/teams');
const driverRoutes = require('./controller/drivers');
const leagueRoutes = require('./controller/leagues');

router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/races', raceRoutes);
router.use('/drivers', driverRoutes);
router.use('/leagues', leagueRoutes);

module.exports = router;
