// backend/routes/covidRoutes.js
const express = require('express');
const router  = express.Router();
const controller = require('../controllers/covidController');

// specific / literal routes first
router.get('/historical/global', controller.getHistoricalGlobal);  
router.get('/global',            controller.getGlobalStats);
router.get('/countries',         controller.getAllCountries);
router.get('/countries/:country',controller.getCountryStats);
router.get('/vaccine/:country',  controller.getVaccine);

// parameter route last
router.get('/historical/:country', controller.getHistorical);      

module.exports = router;
