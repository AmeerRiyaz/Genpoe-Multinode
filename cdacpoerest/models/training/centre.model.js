const mongoose = require('mongoose');

const centreSchema = mongoose.Schema({

    name: {
        type: String
    },
    code: {
        type: Number
    }
});

/* centreSchema.index({
    code: 1
}, {
    unique: true
}); */

module.exports = mongoose.model("centre", centreSchema);