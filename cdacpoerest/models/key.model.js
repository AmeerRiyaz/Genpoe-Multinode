const mongoose = require('mongoose');

const bctkeys = mongoose.Schema({
    id: {
        type: String
    },
    cipherkey: {
        type: String
}
    
});

module.exports = mongoose.model("bctkeys", bctkeys);