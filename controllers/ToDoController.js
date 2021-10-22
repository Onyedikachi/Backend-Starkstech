const { StatusCodes } = require('http-status-codes');

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const appDir = path.dirname(require.main.filename);

const logger = require('../utils/logger');
const read = promisify(fs.readFile);

const CustomError = require('../errors');
const ToDos = require('../models/ToDoItem');
const Events = require('../db/sequelize').Events

const { upload } = require('../middleware/fileUpload');

const createItem = async (req, res) => {
    const { name, description, accomplished, startTime, endTime } = req.body;

  // create event in google calender
  const options = {
      summary: name || "No title",
      description: description || "No description",
      startTime: (new Date(startTime)).toISOString(),
      endTime: (new Date(endTime)).toISOString()
  };

  const content = read(appDir + '/utils/client_secret.json');

  const { eventId: id, summary, location, timeZone } 
    = await authorize(JSON.parse(content), addEvent, options);
  
  // track events in SQL db
   const event = new Events({  
          eventId,
          summary,
          description,
          location,
          timeZone,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        });
    
    await event.save() 

     // create toDo in noSQL DB
    const toDo = await ToDos.create({
      name,
      description,
      accomplished,
      attachments,
      eventId
    });


    await upload(req, res)

  // upload attachments
  let taskAttachments = [];
  
  for (let i = 0; i < req.files.length; i++) {
    const Attachment = {
      name: req.files[i].filename,
      path: req.files[i].path,
      fileType: req.files[i].mimetype,
      originalName: req.files[i].originalName
    };
    taskAttachments = [...taskAttachments, Attachment];
  }

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