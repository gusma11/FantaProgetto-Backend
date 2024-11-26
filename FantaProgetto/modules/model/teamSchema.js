const mongoose = require('mongoose');


const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    driver: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'drivers',
            required: true
        }
    ],
    info: {
        description: {
            type: String,
            required: true
        },
        country_code: {
            type: String,
            required: true
        },
        img: {
            type: String,
            required: true
        }
    },
    points: {
        type: Number,
        default: 0
    }
});

const Team = mongoose.model('teams', teamSchema);

module.exports = Team;
