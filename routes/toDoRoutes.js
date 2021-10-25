const express = require('express');
const router = express.Router();


const {
 createItem,
 deleteItem
} = require('../controllers/ToDoController');

router
  .route('/')
  .post(createItem)

router.route('/:id').delete(deleteItem)
module.exports = router;
