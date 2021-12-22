const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
  //res.send("PoE as a Service");
  res.render('index',{data:'PoE as a Service(PoEaaS)'});
});

router.get('/registration', (req, res) => {

  res.send("PM BCT USER REGISTRATION");
});

module.exports = router;