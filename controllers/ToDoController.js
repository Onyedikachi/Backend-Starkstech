const { StatusCodes } = require('http-status-codes');

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const appDir = path.dirname(require.main.filename);

const { authorize, addEvent, removeEvent} = require('../utils/calender')
const { isObject } = require('../utils/helper');
const logger = require('../utils/logger');
const read = promisify(fs.readFile);

const CustomError = require('../errors');
const ToDos = require('../models/ToDoItem');
const Events = require('../db/sequelize').Events;


const createItem = async (req, res) => {
    let { attachments } = req.files

    if (isObject(attachments)) attachments = [ attachments ]

    const { name, description, accomplished, startTime, endTime } = req.body;

    const oldTask = await ToDos.findOne({ name });

  if (oldTask) {
    throw new CustomError.BadRequestError(`A task with name : '${name}' already exists`);
  }
  // create event in google calender
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
    const subDirectory = '/public/uploads/' + `${filename}`
    const filePath = path.join(
      __dirname,
      '..' + `${subDirectory}`
    );
    await file.mv(filePath);

    const Attachment = {
      name: filename,
      path: subDirectory,
      fileType: file.mimetype,
      originalName: file.name
    };
    taskAttachments = [...taskAttachments, Attachment];
  }
  
     // create toDo in noSQL DB
     const toDo = await ToDos.create({
      name,
      description,
      accomplished: (accomplished.trim().toLowerCase() === 'true'),
      attachments: taskAttachments,
      eventId: id
    });

    // track events in SQL db
   const event = new Events({  
    eventId: id,
    summary,
    description,
    location,
    timeZone,
    startTime: new Date(parseInt(startTime)),
    endTime: new Date(parseInt(endTime)),
  });

  
  await event.save() 
  const data = { ... toDo._doc, location, timeZone, startTime, endTime }

  if (data.hasOwnProperty('__v')){
    delete  data.__v
  }

  res
    .status(StatusCodes.CREATED)
    .json(data);

}

const getAllTasks = async (req, res) => {
  const todos = await ToDos.find({});

  res.status(StatusCodes.OK).json({ todos, count: todos.length });
}

const getSingleTodoTask = async (req, res) => {
  const { id: todoId } = req.params;

  const toDo = await ToDos.findOne({ _id: todoId });
  if (!toDo) {
    throw new CustomError.NotFoundError(`No task with id : ${todoId}`);
  }
  
  const { eventId } = toDo

  const event = await Events.findOne({ 
    where: {
      eventId
    },
  });

  const {
    location,
    timeZone,
    startTime,
    endTime
  } = event || {location: "", timeZone: "", startTime: "", endTime: "" };

  res.status(StatusCodes.OK).json({ ... toDo._doc, location, timeZone, 
  startTime, endTime });
};

const markTaskDone = async (req, res) => {
  const { id : todoId } = req.params;

  const toDo = await ToDos.findOneAndUpdate(
    { _id: todoId },
    { accomplished: true },
    { new: true, runValidators: true }
  );

  res.status(StatusCodes.OK).json({ msg: "task marked complete" });

}

const updateItem = async (req, res) => {
  const { id: todoId } = req.params;

 

}

const deleteItem = async (req, res) => {
  const { id: todoId } = req.params;

  const toDo = await ToDos.findOne({ _id: todoId });
  if (!toDo) {
    throw new CustomError.NotFoundError(`No task with id : ${todoId}`);
  }
  
  const { eventId } = toDo
  // delete from google calender
  const content = await read(appDir + '/utils/client_secret.json');
  await authorize(JSON.parse(content), removeEvent, { eventId });

  // delete from NoSQl DB
  await toDo.remove();

  // delete from events SQL DB
  const event = await Events.findOne({ 
    where: {
      eventId
    },
  });

  if(event) {
    await event.destroy({ 
      where: {
        eventId
      },
    });
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Task removed.' });
}


module.exports = {
    createItem,
    updateItem,
    deleteItem,
    getSingleTodoTask,
    getAllTasks,
    markTaskDone
}