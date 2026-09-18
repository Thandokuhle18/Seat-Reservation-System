const assert = require('assert');
const generateHoldCode = require('../utils/code-generator');

describe('Seat Reservation Rules Tests', () => {
    it('should generate a 6-character code without illegal characters', () => {
        const code = generateHoldCode();
        assert.strictEqual(code.length, 6);
        assert.match(code, /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/);
        assert.doesNotMatch(code, /[0O1IL]/);
    });
});