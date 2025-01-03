const express = require('express');
const router = express.Router();

const mapsController = require('../controllers/maps.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/getAddressCoordinates', mapsController.getCoordinates);

router.get('/getAutoComplete', mapsController.getAutoComplete);

router.get('/getDistance', mapsController.getDistance);

module.exports = router;