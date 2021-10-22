const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const fs = require('fs');
const path = require('path');
const appDir = path.dirname(require.main.filename)

const logger = require('../utils/logger')

const {listEvents, addEvent, removeEvent, updateEvent, authorize} = require('../utils/calender');

const index = (req, res) => {
    fs.readFile(appDir + '/utils/client_secret.json', (err, content) => {
        if (err) {
            logger.error('Get error when loading client secret file: ' + err);
            return res.status(StatusCodes.BAD_REQUEST).json(err);
        }

        authorize(JSON.parse(content), listEvents, res);
    });
};

const create = (req, res) => {
    const startTime = parseInt(req.params.startTime);
    const endTime = startTime + 1000 * 60 * 30;
    const options = {
        summary: req.params.summary || "No title",
        startTime: (new Date(startTime)).toISOString(),
        endTime: (new Date(endTime)).toISOString()
    };

    fs.readFile(appDir + '/client_secret.json', (err, content) => {
        if (err) {
            console.log('Get error when loading client secret file: ' + err);
            return;
        }
        authorize(JSON.parse(content), addEvent, res, options);
    });
};

const show = (req, res) => {
    fs.readFile(appDir + '/client_secret.json', (err, content) => {
        if (err) {
            console.log('Get error when loading client secret file: ' + err);
            return;
        }
        authorize(JSON.parse(content), getEvent, res, { eventId: req.params.eventId});
    });
};

const update = (req, res) => {
};

const destroy = (req, res) => {
    fs.readFile(appDir + '/client_secret.json', (err, content) => {
        if (err) {
            console.log('Get error when loading client secret file: ' + err);
            return;
        }
        authorize(JSON.parse(content), removeEvent, res, { eventId: req.params.eventId});
    });
};

module.exports =  {
    index,
    create,
    update,
    show,
    destroy
}