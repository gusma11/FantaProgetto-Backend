const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    driver_number: {
        type: Number,
        required: true,
        unique: true
    },
    broadcast_name: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    name_acronym: {
        type: String,
        required: true
    },
    team_name: {
        type: String,
        required: true
    },
    team_colour: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    headshot_url: {
        type: String,
        required: true
    },
    country_code: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    team_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teams',
        required: true
    }
});

const Driver = mongoose.model('drivers', driverSchema);

module.exports = Driver;
