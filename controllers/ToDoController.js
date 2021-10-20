const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const ToDos = require('../models/ToDoItem');

const createItem = async (req, res) => {
    const { attachments, name, description, accomplished } = req.body;

  let taskAttachments = [];

  for (const item of attachments) {
    const dbToDo = await ToDos.findOne({ _id: item.todo });
    if (!dbToDo) {
      throw new CustomError.NotFoundError(
        `No todo with id : ${item.todo}`
      );
    }
    const { name, _id } = dbToDo;
    const Attachment = {
      name,
      path: item.path,
      fileType: item.fileType,
      todo: _id,
    };
    taskAttachments = [...taskAttachments, Attachment];
  }

  const toDo = await ToDos.create({
    name,
    description,
    accomplished,
    attachments
  });

  res
    .status(StatusCodes.CREATED)
    .json({ toDo });

}

const updateItem = async (req, res) => {

}

const deleteItem = async (req, res) => {

}


module.exports = {
    createItem,
    updateItem,
    deleteItem
}