const express = require('express');
const router = express.Router();


const {
 createItem,
 deleteItem,
 getSingleTodoTask,
 getAllTasks,
 markTaskDone,
 markTaskUnDone
} = require('../controllers/ToDoController');

const Validator = require('../middleware/validator');

router
  .route('/')
  .post(Validator('createTask'),createItem)
  .get(getAllTasks)


router
  .route('/:id/done').post(markTaskDone)

router
  .route('/:id/undone').post(markTaskUnDone)

router.route('/:id').
  delete(deleteItem)
  .get(getSingleTodoTask)


module.exports = router;
