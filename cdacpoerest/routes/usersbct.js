module.exports = (app) => {
    const users = require('../controllers/userbct.controller.js');

    // set secret variable
    app.set('secret', 'thisismysecret');

    // Create a new BCT user
    app.post('/usersbct', users.create);

    //Create Normal User for General POE
    app.post('/genpoe/userreg', users.register)

    //Create Normal User for General POE
    app.post('/genpoe/userregNC', users.registerNC)

     // change password for gen poe
     app.post('/genpoe/user/changepwd', users.genpoechangepassword);

    // Get registered users list
   // app.get('/usersbct', users.findAll);

    // Authenticate a user
    app.post('/users/auth', users.authenticate);

    //Authenticate General POE user
    app.post('/users/genpoeauth', users.genpoeauthenticate);

    //Authenticate General POE user No Captcha
    app.post('/users/genpoeauthNC', users.genpoeauthenticateNC);


    // Enable/disable user
    app.post('/usersbct/status', users.update);

    //activate user
    app.post('/user/verify', users.genpoeactivateuser)


    //forgotpwd req
    app.post('/user/forgotpwd', users.genpoeforgotpwd)
    //General POE:: forgot password No Captcha
    app.post('/user/forgotpwdNC', users.genpoeforgotpwdNC)
    

    //forgotpwd change
    app.post('/user/forgotpwdchange', users.genpoeforgotpwdchange)
    //General POE:: forgot password Change No Captcha
    app.post('/user/forgotpwdchangeNC', users.genpoeforgotpwdchangeNC)


    app.get('/genpoe/getUserInfo',users.userProfileInfo);

    //Registration of an Organization under PoE
    app.post('/generic/orgReg', users.registerOrganization)

    app.post('/generic/orgRegNC', users.registerOrganizationNC)

    
    //Organization Admin can add normal users in generic PoE
    app.post('/generic/orgUserReg', users.registerOrgUser)

    app.post('/generic/orgUserRegNC', users.registerOrgUserNC)
 
    //Authentication or login for generic users
    app.post('/generic/orgUserAuthenticate', users.genericOrgAuthenticate)

    app.post('/generic/orgUserAuthenticateNC', users.genericOrgAuthenticateNC)


    //Change Password for Org Users
    app.post('/generic/changepwd', users.genericOrgChangePassword);

    //Forgot Password for Org Users
    app.post('/generic/forgotpwd', users.genericOrgForgotPwd);

    //Change password in case of Forgot Password for Org Users
    app.post('/generic/forgotpwdchange', users.genericOrgforgotpwdchange);
    

    //Organization Management REST APIs
    //Retreives the details of a Organization such as List of users and their details
    /****** Arguments Required are Token and in server from token required are userOrgID, userOrgName ***********/
    app.post('/generic/orgDetails', users.genericOrgUsersList)

    //Retrieves Organization user Profile 
    /****** Arguments Required are Token and in server from token required are userOrgID, userOrgEmail ***********/
    //app.post('/generic/userDetails', users.genericOrgUserProfileInfo)
    app.get('/generic/userDetails', users.genericOrgUserProfileInfo)
    

    //activate Organization user
    app.post('/org/verify', users.genericpoeactivateuser)

    //update organization users only by Admin User
    //requires token and userEmail, enable to be updated as arguments
    app.post('/generic/userUpdate', users.genericpoeuserupdate)

    app.post('/generic/org/uploadLogo', users.genericpoeorgUploadLogo)
    app.get('/generic/org/getLogo', users.genericpoeorgGetLogo)
    
    //For Managing Document categories
    app.post('/generic/addCategories', users.addCategories)
    
    app.post('/generic/remCategories', users.remCategories)

    app.get('/generic/listCategories', users.listCategories)

}