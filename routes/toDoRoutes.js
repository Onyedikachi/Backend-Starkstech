const express = require('express');
const router = express.Router();


const {
 createItem,
 deleteItem,
 getSingleTodoTask,
 getAllTasks
} = require('../controllers/ToDoController');

const Validator = require('../middleware/validator');

router
  .route('/')
  .post(Validator('createTask'),createItem)
  .get(getAllTasks)

router.route('/:id').
  delete(deleteItem)
  .get(getSingleTodoTask)
module.exports = router;
