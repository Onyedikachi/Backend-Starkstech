const express = require('express');
const router = express.Router();


const {
 createItem,
 deleteItem,
 getSingleTodoTask
} = require('../controllers/ToDoController');

router
  .route('/')
  .post(createItem)

router.route('/:id').
  delete(deleteItem)
  .get(getSingleTodoTask)
module.exports = router;
