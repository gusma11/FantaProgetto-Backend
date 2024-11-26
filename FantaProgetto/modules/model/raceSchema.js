const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drivers',
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true
    }
}, { _id: false });

const teamSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teams',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true
    }
}, { _id: false });

const raceSchema = new mongoose.Schema({
    number_race: {
        type: Number,
        required: true,
        unique: true
    },
    info: {
        circuit_description: {
            type: String,
            required: true
        },
        drs_zones: {
            type: Number,
            required: true
        },
        nationality: {
            type: String,
            required: true
        },
        laps: {
            type: Number,
            required: true
        }
    },
    driver_list: [driverSchema],
    team_list: [teamSchema],
    pole: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drivers'
    },
    fast_lap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drivers'
    }
});

const Race = mongoose.model('races', raceSchema);

module.exports = Race;
