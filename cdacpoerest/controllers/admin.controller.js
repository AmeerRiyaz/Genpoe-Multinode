var registerAdmin = require('../hyperledger/registerAdmin');
var user = require('../models/user.model.js');

exports.adminEnroll = function adminEnroll() {

    ;
    //default values are taken for admin user
    var userdetails = new user({
        _id: new mongoose.Types.ObjectId(),
        username: 'admin',
        password: 'adminpw'
    });

    userdetails.save(function (err) {
        if (err) throw err;
        console.log("Admin user successfully saved");
    });

    // admin user need to be enrolled first for registering the other users
    registerAdmin.registerAdmin();
}