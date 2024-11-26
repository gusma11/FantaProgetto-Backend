require("dotenv").config();
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const { ObjectId } = require('mongoose').Types;
const Teams = require('../model/teamSchema');
const Races = require('../model/raceSchema');
const Drivers = require('../model/driverSchema');

router.get('/read', async (req, res) => {
    try {
        const teamResult = await Teams.find({});
        const detailedTeams = [];
        const teamPoints = {};

        if (teamResult.length > 0) {
            for (const team of teamResult) {
                const driverIds = _.map(team.driver, d => new ObjectId(d));
                const driverResult = await Drivers.find({ _id: { $in: driverIds } });
                const races = await Races.find({});
                _.map(races, race => {
                    _.map(race.team_list, team => {
                        const teamName = team.name;
                        teamPoints[teamName] = (teamPoints[teamName] || 0) + team.points;
                    });
                });

                // Aggiungi i dettagli dei driver al team
                const teamWithDrivers = {
                    ..._.omit(team.toObject(), 'drivers'),
                    driver: driverResult
                };

                detailedTeams.push(teamWithDrivers);
            }
            res.send(detailedTeams);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

router.get('/classifica-team', async (req, res) => {
    try {
        // Recupera i team ordinati per punti in ordine decrescente
        const teams = await Teams.find({}).sort({ points: -1 });

        // Converte i team in un array di oggetti { teamName, points }
        const teamPointsArray = teams.map(team => ({
            teamName: team.name,
            points: team.points,
            country_code: team.info.country_code
        }));

        // Restituisci la classifica dei piloti e dei team
        res.send({ teamRanking: teamPointsArray });
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

module.exports = router;