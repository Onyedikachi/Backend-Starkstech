const express = require('express');
const router = express.Router();


const {
    index,
    create,
    show,
    destroy
} = require('../controllers/EventController');

router
  .route('/list')
  .get(index)

router
    .route('/')
    .post(create)

router
    .route('/:eventId')
    .get(show)
    .delete(destroy)

module.exports = router;
