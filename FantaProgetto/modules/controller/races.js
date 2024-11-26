const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');
const Races = require('../model/raceSchema');
const Drivers = require('../model/driverSchema');
const Teams = require('../model/teamSchema');
const Users = require('../model/userSchema');

router.get('/read', async (req, res) => {
    try {
        const result = await Races.find({});
        if (result.length !== 0) {
            res.send(result);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(400);
    }
});

router.get('/read/:id', async (req, res) => {
    try {
        const raceId = req.params.id;
        const result = await Races.findById(raceId);
        if (result) {
            res.send(result);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(400);
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        const raceId = req.params.id;

        // controlla se la gara è già stata 
        const existingRace = await Races.findById(raceId);
        if (existingRace && existingRace.driver_list && existingRace.driver_list.length > 0) {
            return res.status(400).json({ error: "La gara ha già i risultati dei piloti e non può essere aggiornata." });
        }

        const drivers = await Drivers.find({});

        // mischia i piloti in modo randomico
        const shuffledDrivers = _.shuffle(drivers);

        // assegnazione punti ai piloti
        const points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
        const driverPoints = shuffledDrivers.slice(0, 10).map((driver, index) => ({
            driverId: driver._id,
            points: points[index],
            name: driver.full_name,
            image: driver.headshot_url
        }));

        // selezione random del pilota che ha fatto il giro più veloce
        const fastLapDriverId = shuffledDrivers[Math.floor(Math.random() * 10)]._id;

        const fastLapDriverIndex = driverPoints.findIndex(dp => dp.driverId.equals(fastLapDriverId));
        if (fastLapDriverIndex !== -1) {
            driverPoints[fastLapDriverIndex].points += 1;
        }

        // sort dei piloti per punti
        const sortedDrivers = driverPoints.sort((a, b) => b.points - a.points);

        // aggiornamento punti piloti
        for (const dp of driverPoints) {
            await Drivers.updateOne(
                { _id: dp.driverId },
                { $inc: { points: dp.points } }
            );
        }

        // calcolo punti team
        const teamPoints = {};
        for (const dp of driverPoints) {
            const driver = await Drivers.findById(dp.driverId);
            const teamId = driver.team_id;
            if (!teamPoints[teamId]) {
                teamPoints[teamId] = { points: 0, name: '' };
            }
            teamPoints[teamId].points += dp.points;
        }

        const teamList = [];
        for (const teamId in teamPoints) {
            const team = await Teams.findById(teamId);
            teamList.push({
                teamId: team._id,
                points: teamPoints[teamId].points,
                name: team.name
            });
        }

        // sort dei team per punti
        const sortedTeams = teamList.sort((a, b) => b.points - a.points);

        // aggioramento punti team
        for (const teamId in teamPoints) {
            await Teams.updateOne(
                { _id: teamId },
                { $inc: { points: teamPoints[teamId].points } }
            );
        }

        // aggiornamento risultati gara
        const raceUpdateResult = await Races.findByIdAndUpdate(
            raceId,
            {
                $set: {
                    driver_list: sortedDrivers.map(dp => ({
                        driverId: dp.driverId,
                        full_name: dp.name,
                        image: dp.image,
                        points: dp.points
                    })),
                    team_list: sortedTeams.map(team => ({
                        teamId: team.teamId,
                        name: team.name,
                        points: team.points
                    })),
                    pole: sortedDrivers[0].driverId,
                    fast_lap: fastLapDriverId
                }
            },
            { new: true }
        );

        if (!raceUpdateResult) {
            return res.status(404).send();
        }

        // aggiornamento punti utenti
        const users = await Users.find({});
        for (const user of users) {
            let totalPoints = 0;
            let driversPoints = 0;
            let teamsPoints = 0;

            const driverPointsArray = [];
            const teamPointsArray = [];

            // calcolo punti totali per i piloti dell'utente
            for (const driverBuffer of user.team.drivers) {
                const driverId = new mongoose.Types.ObjectId(driverBuffer.buffer);
                const driver = sortedDrivers.find(dp => dp.driverId.equals(driverId));
                if (driver) {
                    driverPointsArray.push({
                        driverId: driver.driverId,
                        points: driver.points
                    });
                    driversPoints += driver.points;
                }
            }

            // calcolo punti totali per i team dell'utente
            for (const teamBuffer of user.team.teams) {
                const teamId = new mongoose.Types.ObjectId(teamBuffer.buffer);
                const team = sortedTeams.find(t => t.teamId.equals(teamId));
                if (team) {
                    teamPointsArray.push({
                        teamId: team.teamId,
                        points: team.points
                    });
                    teamsPoints += team.points;
                }
            }

            // aggioirnamento punti utente
            totalPoints = driversPoints + teamsPoints;

            await Users.updateOne(
                { _id: user._id },
                {
                    $set: {
                        drivers_points: driversPoints,
                        teams_points: teamsPoints,
                        total_points: totalPoints
                    }
                }
            );
        }

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});


router.put('/reset', async (req, res) => {
    try {
        // reset gare
        await Races.updateMany({}, {
            $set: {
                driver_list: [],
                team_list: [],
                pole: null,
                fast_lap: null
            }
        });

        // reset punti piloti
        await Drivers.updateMany({}, {
            $set: {
                points
                    : 0
            }
        });

        // reset punti team
        await Teams.updateMany({}, {
            $set: { points: 0 }
        });

        // reset punti utenti
        await Users.updateMany({}, {
            $set: {
                drivers_points: 0,
                teams_points: 0,
                total_points: 0
            }
        });

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

module.exports = router;