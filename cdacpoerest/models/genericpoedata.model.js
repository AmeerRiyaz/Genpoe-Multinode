const mongoose = require('mongoose');

const genericPoeDataSchema = mongoose.Schema({

    sha256Hash: {
        type: String,
        required: "Please provide sha256hash"
    },
    sha1Hash: {
        type: String,
        required: "Please provide sha1hash"
    },
    uniqueID: {
        type: String,
        required: "Please provide uniqueID"
    },
    issuerOrgName: {
        type: String,
        required: "Please provide issuer Name"
    },
    issuerOrgEmail: {
        type: String,
        required: "Please provide issuer Name"
    },
    issuerOrgUserName: {
        type: String,
        required: "Please provide issuer Name"
    },
    issuerOrgUserEmail: {
        type: String,
        required: "Please provide issuer Name"
    },      
    allowStorage:{
        type: Boolean
    },
    posHash:{
        type:String
    },    
    txId: {
        type: String
    },
    recipientName: {
        type: String,
        required: "Please provide issuer Name"
    },
    recipientEmail: {
        type: String,
        required: "Please provide issuer Name"
    },
    recipientMobile: {
        type: String,
        required: "Please provide issuer Name"
    },
    documentType: {
        type: String,
        required: "Please provide issuer Name"
    },
    emailStatus: {
        type: Boolean
    }
});

genericPoeDataSchema.index({
    sha256Hash: 1
}, {
    unique: true
});
module.exports = mongoose.model("genericpoedata", genericPoeDataSchema);