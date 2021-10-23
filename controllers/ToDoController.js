const { StatusCodes } = require('http-status-codes');

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const appDir = path.dirname(require.main.filename);

const { authorize, addEvent} = require('../utils/calender')
const { isObject } = require('../utils/helper');
const logger = require('../utils/logger');
const read = promisify(fs.readFile);

const CustomError = require('../errors');
const ToDos = require('../models/ToDoItem');
const Events = require('../db/sequelize').Events;



const createItem = async (req, res) => {
    let { attachments } = req.files
    console.log(attachments)

    if (isObject(attachments)) attachments = [ attachments ]


    const { name, description, accomplished, startTime, endTime } = req.body;

  // create event in google calender
  logger.info(req.body.startTime)
  const options = {
      summary: name || "No title",
      description: description || "No description",
      startTime: (new Date(parseInt(startTime))).toISOString(),
      endTime: (new Date(parseInt(endTime))).toISOString()
  };

  const content = await read(appDir + '/utils/client_secret.json');

  const calEvent = await authorize(JSON.parse(content), addEvent, options);

  const { id, summary, location, timeZone }  = calEvent.data
  
  // upload attachments
  let taskAttachments = [];
  
  for (let i = 0; i < attachments.length; i++) {
    const file = attachments[i];
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename =  "attachments" + '-' + uniqueSuffix
    const filePath = path.join(
      __dirname,
      '../public/uploads/' + `${filename}`
    );
    await file.mv(filePath);

    const Attachment = {
      name: filename,
      path: filePath,
      fileType: file.mimetype,
      originalName: file.name
    };
    taskAttachments = [...taskAttachments, Attachment];
  }
  
     // create toDo in noSQL DB
     const toDo = await ToDos.create({
      name,
      description,
      accomplished: (accomplished.trim().toLowerCase() == 'true'),
      attachments: taskAttachments,
      eventId: id
    });

    // track events in SQL db
   const event = new Events({  
    todoId: toDo._id,
    summary,
    description,
    location,
    timeZone,
    startTime: new Date(parseInt(startTime)),
    endTime: new Date(parseInt(endTime)),
  });

  await event.save() 
  res
    .status(StatusCodes.CREATED)
    .json({ ...toDo, location, timeZone, startTime, endTime });

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