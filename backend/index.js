require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const response = require('./utils/responses');
const seatRoutes = require('./routes/seat-routes'); 
const startExpirationTimer = require('./services/timer');const { Seat } = require('./models/seat');
const settings = require('./config');

const app = express();
const port = process.env.APP_PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/seats', seatRoutes);

app.use((req, res) => response(res, 404, 'Page not found.'));

const seedSeats = async () => {
    const count = await Seat.countDocuments();
    if (count === 0) {
        const seats = [];
        for (let i = 1; i <= settings.SEATS_COUNT; i++) {
            seats.push({ seat_number: i });
        }
        await Seat.insertMany(seats);
        console.log(`Seeded ${settings.SEATS_COUNT} seats`);
    }
};

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('DB connected');
        await seedSeats();
        startExpirationTimer();
        app.listen(port, () => {
            console.log(`Server is running on ${process.env.BASE_URL || `http://localhost:${port}`}`);
        });
    })
    .catch((error) => {
        console.log(error.message);
    });