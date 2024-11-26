require("dotenv").config();
const express = require('express');
const router = express.Router();
const Drivers = require('../model/driverSchema');

router.get('/read', async (req, res) => {
    try {
        const result = await Drivers.find({});
        if (result.length !== 0) {
            res.send(result);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

router.get('/classifica-piloti', async (req, res) => {
    try {
        const drivers = await Drivers.find({}).sort({ points: -1 });

        // Converte i piloti in un array di oggetti { driverId, points }
        const driverPointsArray = drivers.map(driver => ({
            driverId: driver.full_name,
            driverImage: driver.headshot_url,
            points: driver.points,
            country_code: driver.country_code
        }));

        // Restituisci la classifica dei piloti
        res.send({ driverRanking: driverPointsArray });
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

module.exports = router;