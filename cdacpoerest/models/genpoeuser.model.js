const mongoose = require('mongoose');

const genPoeUserSchema = mongoose.Schema({

    username: {
        type: String,
        required: "Please provide username"
    },
    fullname: {
        type: String,
        required: "Please provide username"
    },
    password: {
        type: String
        // required: "Please provide password"
    },
    eMail: {
        type: String
        // required: "Please provide email ID"
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
    ,
    isEmailVerified:{
        type: Boolean
    }
    
});

module.exports = mongoose.model("genPoeUser", genPoeUserSchema);