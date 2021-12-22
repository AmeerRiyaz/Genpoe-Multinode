const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    host: "smtp.cdac.in",
    port: 587,
    secure: false,
    authMethod: 'STARTTLS',
    debug: true, // true for 465, false for other ports
    auth: {

        user: "cdacchain", // generated ethereal user
        pass: "cdachyd@567$" // generated ethereal password
        // pass: "cdachyd@123" // generated ethereal password
    },
    messageId: "cdacchain"
});
module.exports = {
    transporter: transporter

    // email: 'cdacchain@cdac.in',
    // id: 'cdacchain',
    // pass: 'cdachyd@123$'
}
