const { Seat, Waitlist, EventLog } = require('../models/seat');
const generateHoldCode = require('../utils/code-generator');

const startExpirationTimer = () => {
    setInterval(async () => {
        try {
            const now = new Date();
            const expiredHolds = await Seat.find({ status: 'Held', hold_expiration: { $lte: now } });

            for (const seat of expiredHolds) {
                const seatNumber = seat.seat_number;
                const email = seat.holder_email;
                const holdCode = seat.hold_code;

                seat.status = 'Available';
                seat.holder_email = null;
                seat.hold_code = null;
                seat.hold_expiration = null;
                seat.extension_count = 0;
                await seat.save();

                await EventLog.create({ event_type: 'hold expired', seat_number: seatNumber, email, hold_code });

                // Waitlist promotion
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
            }
        } catch (error) {
            console.error('Timer error:', error.message);
        }
    }, 2000); // Runs every 2 seconds
};

module.exports = startExpirationTimer;