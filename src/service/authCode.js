const Chance = require('chance');
const chance = new Chance();

class AuthCode {
    code() {
        return chance.integer({ min: 100000, max: 999999 });
    }
}
module.exports = new AuthCode()