const mongoose = require('mongoose');

const cdacUserSchema = mongoose.Schema({

    fullname: {
        type: String,
        required: "Please provide username"
    },
    username: {
        type: String,
        required: "Please provide username"
    },
    password: {
        type: String
        // required: "Please provide password"
    },
    email: {
        type: String
    },
    centre: {
        type: String
    },
    role: {
        type: String,
        required: "Please provide role"
    },
    token: {
        type: String
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
// cdacUserSchema.index({
//     username: 1
// }, {
//     unique: true
// });
module.exports = mongoose.model("cdacUser", cdacUserSchema);

