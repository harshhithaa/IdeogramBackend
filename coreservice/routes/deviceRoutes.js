var express = require('express');
var router = express.Router();

var deviceApi = require('../api/deviceAPI');

router.post('/registerdevicetoken', deviceApi.registerDeviceToken);
router.post('/userlogout',deviceApi.userLogout);

module.exports = router;