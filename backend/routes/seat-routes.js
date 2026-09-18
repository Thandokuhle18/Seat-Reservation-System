const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/seat-controllers');

router.post('/hold', ctrl.PlaceHold);
router.post('/confirm', ctrl.ConfirmHold);
router.post('/extend', ctrl.ExtendHold);
router.post('/release', ctrl.ReleaseSeat);
router.post('/waitlist', ctrl.JoinWaitlist);
router.get('/logs', ctrl.GetEventLogs);
router.get('/all', ctrl.GetAllSeats);

module.exports = router;