const mongoose = require('mongoose');

const bctUserSchema = mongoose.Schema({

    username: {
        type: String,
        required: "Please provide username"
    },
    password: {
        type: String
        // required: "Please provide password"
    },
    orgname: {
        type: String,
        required: "Please provide Org Name"
    },
    role: {
        type: String,
        required: "Please provide role"
    },
    token: {
        type: String,
        required: "Please provide token"
    },
    enable: {
        type: Boolean
    },
    regDate:{
        type: String
    }/*,
    reset:{
        type: Boolean
    }*/
});

module.exports = mongoose.model("bctUser", bctUserSchema);