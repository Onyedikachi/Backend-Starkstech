const { StatusCodes } = require('http-status-codes');

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const path = require('path');
const appDir = path.dirname(require.main.filename)


const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const TOKEN_PATH = `${appDir}/utils/token.json`;

const logger = require('./logger');

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 * @param {function} res express response
*/
 function authorize(credentials, callback, res, options={}) {
    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client, res, options);
    });
  }

  /**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    logger.info('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return logger.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return logger.error(err);
          logger.info('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  /**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {function}res Response from the server
 * @param {Object} options containing event details
 */
const listEvents = (auth, res, options) => {
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, result) => {
      if (err){
        logger.error('The API returned an error: ' + err);
        return res.status(StatusCodes.BAD_REQUEST).json({error: err});
      } 
      const events = result.data.items;
      if (events.length) {
        logger.info('Upcoming 10 events:');
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          logger.info(`${start} - ${event.summary}`);
        });
      } else {
        logger.info('No upcoming events found.');
      }
      res.status(StatusCodes.OK).json(events)
    });
  }

  const getEvent = (auth, res, options) => {
    const calendar = google.calendar('v3');
    calendar.events.get({
        auth: auth,
        calendarId: 'primary',
        eventId: options.eventId
    }, (err, response) => {
        if (err) {
            logger.info('The API returns an error: ', err)
            res.status(StatusCodes.BAD_REQUEST).json({error: err});
        }
        res.status(StatusCodes.OK).json(response);
    });
};

const addEvent = (auth, res, options) => {
    const calendar = google.calendar('v3');
    const summary = options.summary;
    const startTime = options.startTime;
    const endTime = options.endTime;
    const event = {
        summary: summary,
        start: {
            dateTime: startTime
        },
        end: {
            dateTime: endTime
        }
    };
    logger.info("add Event: ", event);
    calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: event
    }, (err, response) => {
        if (err) {
            logger.error('Error: ', err);
            return res.status(StatusCodes.BAD_REQUEST).json({ error: err });
        }
        res.status(StatusCodes.OK).json(response);
    });
};

const updateEvent = (auth, res, options) => {
    const calendar = google.calendar('v3');
    calendar.events.update({
        auth: auth,
        calendarId: 'primary',
        eventId: options.eventId,
        resources: options.resources
    }, (err, response) => {
        if (err) {
            logger.error('Error: ', err);
            return res.status(StatusCodes.BAD_REQUEST).json({error: err});
        }
        res.status(StatusCodes.OK).json(response);
    });
};

const removeEvent = (auth, res, options) => {
    const calendar = google.calendar('v3');
    calendar.events.delete({
        auth: auth,
        calendarId: 'primary',
        eventId: options.eventId
    }, (err) => {
        if (err) {
            logger.error('Error: ', err);
            return res.status(StatusCodes.BAD_REQUEST).json({error: err});
        }
        res.status(StatusCodes.OK).json({status: 200, 'message': 'Deleted event successfully'});
    });
};


  module.exports = {
    listEvents,
    getEvent,
    addEvent,
    updateEvent,
    removeEvent,
    authorize
  };
