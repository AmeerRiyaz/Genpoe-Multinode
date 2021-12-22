const mongoose = require('mongoose');

const PoeCertsSchema = mongoose.Schema({

    fileName: {
        type: String,
        required: "Please provide file Name"
    },
    fileType: {
        type: String,
        required: "Please provide file Type"
    },
    documentType: {
        type: String,
        required: "Please provide Doc Type"
    },
    sha256Hash: {
        type: String,
        required: "Please provide sha256hash"
    },
    sha1Hash: {
        type: String,
        required: "Please provide sha1hash"
    },
    issuedByOrg: {
        type: String,
        required: "Please provide issuerOrg"
    },
    issuedByUser: {
        type: String,
        required: "Please provide issuer Name"
    },
    issuedTo: {
        type: String,
        required: "Please provide issued To"
    },
    year:
    {
        type: String
    },
    month:
    {
        type: String
    },
    course:{
        type: String
    },
    centre:{
        type: String
    },
    txId: {
        type: String
    },
    timestamp: {
        type: String
    },
    txstatus: {
        type: String

    },
    sharedTo:[
        {
            eMail: String
        }
    ],
    posHash:{
        type: String
    },
    emailStatus:{
        type: Boolean
    },
    posStatus:{
        type:Boolean
    }
});

PoeCertsSchema.index({
    sha256Hash: 1,
    documentType: 1,

}, {
    unique: true
});
module.exports = mongoose.model("certificates", PoeCertsSchema);