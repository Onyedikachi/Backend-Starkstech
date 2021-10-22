const { StatusCodes } = require('http-status-codes');

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const appDir = path.dirname(require.main.filename);

const logger = require('../utils/logger');
const read = promisify(fs.readFile);


const {listEvents, addEvent, removeEvent, updateEvent, authorize} = require('../utils/calender');

const index = async (req, res) => {
    
    const content = await read(appDir + '/utils/client_secret.json');

    const result = await authorize(JSON.parse(content), listEvents);

    res.status(StatusCodes.OK).json(result);
};

const create = async (req, res) => {
    const {startTime, endTime} = req.params
    const options = {
        summary: req.params.summary || "No title",
        startTime: (new Date(parseInt(startTime))).toISOString(),
        endTime: (new Date(parseInt(endTime))).toISOString()
    };

    const content = await read(appDir + '/utils/client_secret.json');

    const result = await authorize(JSON.parse(content), addEvent, options);

    res.status(StatusCodes.OK).json(result);
};

const show = async (req, res) => {
    const content = await read(appDir + '/utils/client_secret.json');

    const result = await authorize(JSON.parse(content), getEvent, { eventId: req.params.eventId});

    res.status(StatusCodes.OK).json(result);
};

const update = (req, res) => {
};

const destroy = async (req, res) => {
    const content = await read(appDir + '/utils/client_secret.json');

    const result = await authorize(JSON.parse(content), removeEvent, { eventId: req.params.eventId});

    res.status(StatusCodes.OK).json(result);
};

module.exports =  {
    index,
    create,
    update,
    show,
    destroy
}