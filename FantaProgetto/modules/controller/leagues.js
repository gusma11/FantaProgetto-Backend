require("dotenv").config();
const express = require('express');
const router = express.Router();
const Leagues = require('../model/leagueSchema');
const Drivers = require('../model/driverSchema');
const Teams = require('../model/teamSchema');
const Users = require('../model/userSchema');

router.post('/:email/addTeam', async (req, res) => {
    try {
        const userEmail = req.params.email;
        const { drivers, teams } = req.body;
        console.log(req.body)
        if (!userEmail || !drivers || !teams) {
            return res.status(400).json({ error: "Invalid request. Expected email, drivers, and teams." });
        }

        if (drivers.length !== 5 || teams.length !== 2) {
            return res.status(400).json({ error: "Each team must have exactly 5 drivers and 2 teams." });
        }

        const driversData = await Drivers.find({ _id: { $in: drivers } });
        const teamsData = await Teams.find({ _id: { $in: teams } });

        if (driversData.length !== 5 || teamsData.length !== 2) {
            return res.status(400).json({ error: "Invalid drivers or teams provided." });
        }

        await Users.updateOne(
            { email: userEmail },
            {
                $set: {
                    "team.drivers": drivers,
                    "team.teams": teams
                }
            }
        );
        res.sendStatus(200);

    } catch (error) {
        console.log(error);
        res.sendStatus(401);
    }
});

router.post('/create', async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: "Invalid request. Expected league name and admin email." });
        }

        const adminUser = await Users.findOne({ email: email, admin: true });

        if (!adminUser) {
            return res.status(403).json({ error: "Only an admin can create a league." });
        }

        const checkLeague = await Leagues.findOne({ name: name });

        if (checkLeague) {
            return res.status(400).send({
                _id: checkLeague._id
            });
        }

        const newLeague = await Leagues.create({
            name,
            admin: adminUser._id,
            members: [adminUser._id]
        });

        return res.status(201).send();

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

router.post('/:leagueId/join', async (req, res) => {
    try {
        const { email } = req.body;
        const leagueId = req.params.leagueId;

        if (!email || !leagueId) {
            return res.status(400).json({ error: "Invalid request. Expected email and league ID." });
        }

        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        await Leagues.findByIdAndUpdate(leagueId, { $addToSet: { members: user._id } });

        return res.sendStatus(200);

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

router.get('/:leagueId/view', async (req, res) => {
    try {
        const leagueId = req.params.leagueId;

        const league = await Leagues.findById(leagueId);

        if (!league) {
            return res.status(404).json({ error: "League not found." });
        }

        const members = await Users.find({ _id: { $in: league.members } });

        const standings = members.map(member => {
            return {
                email: member.email,
                picture: member.picture,
                points: member.total_points ? member.total_points : 0
            };
        }).sort((a, b) => b.points - a.points);

        res.send({
            leagueName: league.name,
            admin: league.admin,
            standings
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

router.get('/view', async (req, res) => {
    try {
        const leagues = await Leagues.find({});

        const leaguesInfo = leagues.map(league => ({
            _id: league._id,
            name: league.name,
            players: league.members.length,
            members: league.members
        }));

        res.status(200).send(leaguesInfo);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

module.exports = router;