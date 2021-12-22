'use strict'
let loginResponse=
{
  status: 'captcha Verified',
}
let logininvalidResponse =
{
  status: "unauthorized",
  message: "Invalid captcha...!"


}
// const svgCaptcha = require('svg-captcha')
const expressCaptcha = require('express-svg-captcha')
const captcha = new expressCaptcha({
  isMath: false,           // if true will be a simple math equation
  useFont: null,          // Can be path to ttf/otf font file
  size: 4,             // number of characters for string capthca
  // ignoreChars: '0o1i',    // characters to not include in string capthca
  noise: 2,               // number of noise lines
  color: false,            // if true noise lines and captcha characters will be randomly colored
  // (is set to true if background is set)
  background:null,      // HEX or RGB(a) value for background set to null for transparent
  width: 150,             // width of captcha
  height: 50,             // height of captcha
  fontSize: 56,           // font size for captcha
  charPreset: null,
  // string of characters for use with string captcha set to null for default aA-zZ
})

exports.createCaptcha = (captcha.generate())//generate svgcaptcha

exports.validateCaptcha =async (req) => {
  // console.log("-----------post----------")
  // console.log(req.sessionID)
  console.log('inside captchValidation ' + req.headers.origin)
  // console.log(req.headers)
  console.log("Captcha generated " + req.session.captcha)
  console.log("Captcha Requested " + req.body.captchaval)
  var message = "";
  if (captcha.validate(req,req.body.captchaval) && req.body.captchaval!=undefined) {
     console.log("valid");
     message = "valid";
     return message;
    //return loginResponse;// res.statusMessage = "Verified...";
    //res.end();
  } else {
    message = "invalid";
    return message;
    //console.log(logininvalidResponse);
   //return logininvalidResponsep;
  }
}//creaCaptcha
