const { Seat, Waitlist, Activity, EventLog } = require('../models/seat');
const response = require('../utils/responses');
const generateHoldCode = require('../utils/code-generator');

const PlaceHold = async (req, res) => {
    try {
        const { email, seat_number } = req.body;

        if (!email || !seat_number) {
            return response(res, 400, { message: "Email and seat number can't be empty" });
        }

        const seat = await Seat.findOne({ seat_number });
        if (!seat) {
            return response(res, 400, { message: 'Invalid seat number' });
        }

        if (seat.status !== 'Available') {
            return response(res, 400, { message: 'Seat is already taken' });
        }

        // Check active holds count (< 2)
        const activeHoldsCount = await Seat.countDocuments({ holder_email: email, status: 'Held' });
        if (activeHoldsCount >= 2) {
            return response(res, 400, { message: 'Maximum active holds reached (2)' });
        }

        // Check hourly holds (< 5)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const hourlyHoldsCount = await Activity.countDocuments({ email, timestamp: { $gte: oneHourAgo } });
        if (hourlyHoldsCount >= 5) {
            return response(res, 400, { message: 'Maximum holds per hour reached (5)' });
        }

        // Generate unique hold code
        let hold_code = generateHoldCode();
        let existingCode = await Seat.findOne({ hold_code });
        while (existingCode) {
            hold_code = generateHoldCode();
            existingCode = await Seat.findOne({ hold_code });
        }

        const hold_expiration = new Date(Date.now() + 60 * 1000); // 60 seconds

        seat.status = 'Held';
        seat.holder_email = email;
        seat.hold_code = hold_code;
        seat.hold_expiration = hold_expiration;
        seat.extension_count = 0;
        await seat.save();

        await Activity.create({ email });
        await EventLog.create({ event_type: 'hold placed', seat_number, email, hold_code });

        return response(res, 200, { message: 'Hold placed successfully', seat_number, hold_code, hold_expiration });
    } catch (error) {
        return response(res, 500, { message: error.message });
    }
};

const ConfirmHold = async (req, res) => {
    try {
        const { email, hold_code } = req.body;

        const seat = await Seat.findOne({ hold_code });
        if (!seat || seat.holder_email !== email) {
            return response(res, 400, { message: 'Invalid hold code or email' });
        }

        if (seat.status === 'Confirmed') {
            return response(res, 200, { message: 'Hold confirmed already', seat });
        }

        if (seat.status !== 'Held' || new Date() > new Date(seat.hold_expiration)) {
            return response(res, 400, { message: 'Hold is expired or inactive' });
        }

        seat.status = 'Confirmed';
        seat.hold_expiration = null;
        await seat.save();

        await EventLog.create({ event_type: 'hold confirmed', seat_number: seat.seat_number, email, hold_code });

        return response(res, 200, { message: 'Hold confirmed successfully', seat });
    } catch (error) {
        return response(res, 500, { message: error.message });
    }
};

const ExtendHold = async (req, res) => {
    try {
        const { email, hold_code } = req.body;

        const seat = await Seat.findOne({ hold_code });
        if (!seat || seat.holder_email !== email) {
            return response(res, 400, { message: 'Invalid hold code or email' });
        }

        if (seat.status !== 'Held' || new Date() > new Date(seat.hold_expiration)) {
            return response(res, 400, { message: 'Hold is not active' });
        }

        if (seat.extension_count >= 2) {
            return response(res, 400, { message: 'Maximum extensions reached (2)' });
        }

        seat.hold_expiration = new Date(Date.now() + 60 * 1000);
        seat.extension_count += 1;
        await seat.save();

        await EventLog.create({ event_type: 'hold extended', seat_number: seat.seat_number, email, hold_code });

        return response(res, 200, { message: 'Hold extended', hold_expiration: seat.hold_expiration });
    } catch (error) {
        return response(res, 500, { message: error.message });
    }
};

const ReleaseSeat = async (req, res) => {
    try {
        const { email, hold_code } = req.body;

        const seat = await Seat.findOne({ hold_code });
        if (!seat || seat.holder_email !== email) {
            return response(res, 400, { message: 'Invalid hold code or email' });
        }

        const seatNumber = seat.seat_number;
        seat.status = 'Available';
        seat.holder_email = null;
        seat.hold_code = null;
        seat.hold_expiration = null;
        seat.extension_count = 0;
        await seat.save();

        await EventLog.create({ event_type: 'seat released', seat_number: seatNumber, email, hold_code });

        // Waitlist promotion logic
        const nextInQueue = await Waitlist.findOne().sort({ joined_at: 1 });
        if (nextInQueue) {
            await Waitlist.deleteOne({ _id: nextInQueue._id });
            const newCode = generateHoldCode();
            seat.status = 'Held';
            seat.holder_email = nextInQueue.email;
            seat.hold_code = newCode;
            seat.hold_expiration = new Date(Date.now() + 60 * 1000);
            seat.extension_count = 0;
            await seat.save();
            await EventLog.create({ event_type: 'waitlist promoted', seat_number: seatNumber, email: nextInQueue.email, hold_code: newCode });
        }

        return response(res, 200, { message: 'Seat released successfully' });
    } catch (error) {
        return response(res, 500, { message: error.message });
    }
};

const JoinWaitlist = async (req, res) => {
    try {
        const { email } = req.body;

        const availableSeats = await Seat.countDocuments({ status: 'Available' });
        if (availableSeats > 0) {
            return response(res, 400, { message: 'Seats are available, hold a seat instead' });
        }

        const existingWaitlist = await Waitlist.findOne({ email });
        if (existingWaitlist) {
            return response(res, 400, { message: 'Already on the waitlist' });
        }

        const activeHoldOrConfirmed = await Seat.findOne({ holder_email: email, status: { $in: ['Held', 'Confirmed'] } });
        if (activeHoldOrConfirmed) {
            return response(res, 400, { message: 'User has an active hold or confirmed seat' });
        }

        await Waitlist.create({ email });
        await EventLog.create({ event_type: 'waitlist joined', email });

        return response(res, 200, { message: 'Joined waitlist successfully' });
    } catch (error) {
        return response(res, 500, { message: error.message });
    }
};

const GetEventLogs = async (req, res) => {
    try {
        const logs = await EventLog.find().sort({ timestamp: -1 });
        return response(res, 200, logs);
    } catch (error) {
        return response(res, 500, { message: error.message });
    }
};

const GetAllSeats = async (req, res) => {
    try {
        const seats = await Seat.find().sort({ seat_number: 1 });
        return response(res, 200, seats);
    } catch (error) {
        return response(res, 500, { message: error.message });
    }
};

module.exports = { PlaceHold, ConfirmHold, ExtendHold, ReleaseSeat, JoinWaitlist, GetEventLogs, GetAllSeats };