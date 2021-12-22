const mongoose = require('mongoose');

const genericUserSchema = mongoose.Schema({

    userOrgName: {
        type: String,
        required: "Please provide Organization Name"
    },
    userOrgID: {
        type: String,
        required: "Please provide Organization ID"
    },
    fullName: {
        type: String,
        required: "Please provide fullName"
    },
    password: {
        type: String
        // required: "Please provide password"
    },
    userOrgemail: {
        type: String,
        required: "Please provide email"
        //for Admin it is userOrgAdminemail and for normal users it is userOrgemail
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
    },
    isEmailVerified:{
        type: Boolean
    },
    orgLogo: {
        type: String
    },
    orgCategories: {
        type: [String]
    }
    /*,
    reset:{
        type: Boolean
    }*/
});

genericUserSchema.index({
    userOrgemail: 1
}, {
    unique: true
});

module.exports = mongoose.model("genericUser", genericUserSchema);