const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
    seat_number: {
        type: Number,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['Available', 'Held', 'Confirmed'],
        default: 'Available'
    },
    holder_email: {
        type: String,
        required: false,
        default: null
    },
    hold_code: {
        type: String,
        required: false,
        default: null
    },
    hold_expiration: {
        type: Date,
        required: false,
        default: null
    },
    extension_count: {
        type: Number,
        default: 0
    }
});

const WaitlistSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    joined_at: {
        type: Date,
        default: Date.now
    }
});

const ActivitySchema = new mongoose.Schema({
    email: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const EventLogSchema = new mongoose.Schema({
    event_type: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    seat_number: { type: Number, required: false },
    email: { type: String, required: false },
    hold_code: { type: String, required: false }
});

const Seat = mongoose.model('Seat', SeatSchema);
const Waitlist = mongoose.model('Waitlist', WaitlistSchema);
const Activity = mongoose.model('Activity', ActivitySchema);
const EventLog = mongoose.model('EventLog', EventLogSchema);

module.exports = { Seat, Waitlist, Activity, EventLog };