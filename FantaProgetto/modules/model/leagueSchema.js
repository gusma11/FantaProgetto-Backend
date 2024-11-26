const mongoose = require('mongoose');

const standingsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true
    }
});

const leagueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        }
    ],
    standings: {
        type: [standingsSchema],
        default: []
    }
});

const League = mongoose.model('leagues', leagueSchema);

module.exports = League;
