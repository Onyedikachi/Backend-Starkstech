const { StatusCodes } = require('http-status-codes');
const { promisify } = require('util');
const path = require('path');

const appDir = path.dirname(require.main.filename);

const logger = require('../utils/logger');
const read = promisify(fs.readFile);

const CustomError = require('../errors');
const ToDos = require('../models/ToDoItem');
const Events = require('../db/sequelize').Events

const createItem = async (req, res) => {
    const { attachments, name, description, accomplished, startTime, endTime } = req.body;

  // upload attachments
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

  // create toDo in noSQL DB
  const toDo = await ToDos.create({
    name,
    description,
    accomplished,
    attachments
  });

  // create event in google calender
  const startTime = parseInt(req.params.startTime);
  const endTime = startTime + 1000 * 60 * 30;
  const options = {
      summary: name || "No title",
      description: description || "No description",
      startTime: (new Date(startTime)).toISOString(),
      endTime: (new Date(endTime)).toISOString()
  };

  const content = await read(appDir + '/utils/client_secret.json');

  const {eventId: id, summary, description, location, timeZone} 
    = await authorize(JSON.parse(content), addEvent, options);
  
  // track events in SQL db
   const event = new Event({  
          eventId,
          summary,
          description,
          location,
          timeZone,
          new Date(startTime),
          new Date(endTime),
        });
    
    await event.save() 

  res
    .status(StatusCodes.CREATED)
    .json({ ...toDo, eventId, location, timeZone, startTime, endTime });

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