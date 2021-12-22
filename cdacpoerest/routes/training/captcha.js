module.exports = (app) => {
const captcha =  require('../../controllers/training/captcha.controller');
    app.get('/captcha', captcha.createCaptcha);
    app.post('/captchaVeri', captcha.validateCaptcha);
}