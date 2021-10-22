const express = require('express');
const router = express.Router();


const {
    index,
    create
} = require('../controllers/EventController');

router
  .route('/list')
  .get(index)

router
    .route('/')
    .post(create)

module.exports = router;
