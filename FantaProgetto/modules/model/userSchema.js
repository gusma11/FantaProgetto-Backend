const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
    drivers: [mongoose.Schema.Types.ObjectId],
    teams: [mongoose.Schema.Types.ObjectId]
});

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    team: {
        type: teamSchema
    },
    admin: {
        type: Boolean,
        default: false
    },
    drivers_points: {
        type: Number,
        default: 0
    },
    teams_points: {
        type: Number,
        default: 0
    },
    total_points: {
        type: Number,
        default: 0
    }
});

const User = mongoose.model('users', userSchema);

module.exports = User;
