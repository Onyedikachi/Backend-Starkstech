const express = require('express');
const router = express.Router();


const {
 createItem,
 deleteItem,
 getSingleTodoTask,
 getAllTasks
} = require('../controllers/ToDoController');

router
  .route('/')
  .post(createItem)
  .get(getAllTasks)

router.route('/:id').
  delete(deleteItem)
  .get(getSingleTodoTask)
module.exports = router;
