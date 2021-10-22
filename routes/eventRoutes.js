const express = require('express');
const router = express.Router();


const {
    index
} = require('../controllers/EventController');

router
  .route('/list')
  .get(index)

module.exports = router;
