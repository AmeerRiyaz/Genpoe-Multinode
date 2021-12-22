module.exports = (app) => {
    const poeusers = require('../controllers/training/poeusers.controller.js');
    
    // set secret variable
    app.set('secret', 'thisismysecret');

    app.get('/centres',poeusers.listCentres);
    app.get('/courses',poeusers.listCourses);
    app.get('/roles',poeusers.listRoles);
    app.get('/usersbct',poeusers.listcdacusers);
    app.post('/insertuserdetails',poeusers.userdetails);
    // Create a new account for student
    app.post('/signup', poeusers.studentaccount);

    // Sign In student user
    app.get('/signin', poeusers.studentlogin);

    // Create a new account for organization users
    app.post('/org/signup', poeusers.orgaccount);

    // Sign In for Organization users page
    app.post('/org/signin', poeusers.signin);

    // Enable/disable user
    app.post('/users/update', poeusers.update);

    // change password
    app.post('/user/changepwd', poeusers.changepassword);

    

  

    app.post('/user/year', poeusers.fetchyear);
    app.post('/user/batch', poeusers.fetchbatch);
    app.post('/user/course', poeusers.fetchcourse);
    app.post('/user/rollno', poeusers.fetchrollNo);
    

}