const mongoose = require('mongoose');

const PoeSchema = mongoose.Schema({

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
    allowStorage:{
        type: Boolean
    },
    posHash:{
        type:String
    },
    posStatus:{
        type: Boolean
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

});

PoeSchema.index({
    sha256Hash: 1
}, {
    unique: true
});
module.exports = mongoose.model("proofofexists", PoeSchema);