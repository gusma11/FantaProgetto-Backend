const express = require('express');
const router = express.Router();
const Users = require('../model/userSchema');

router.get('/read/:email', async (req, res) => {

    try {
        const userEmail = req.params.email;
        const result = await Users.findOne({ email: userEmail });

        if (result) {
            res.send(result);
        } else {
            res.sendStatus(404);
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

module.exports = router;