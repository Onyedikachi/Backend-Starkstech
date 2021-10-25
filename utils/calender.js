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
*/
 function authorize(credentials, callback, options={}) {
    return new Promise(
        (resolve, reject) => {
            const {client_secret, client_id, redirect_uris} = credentials.web;
            const oAuth2Client = new google.auth.OAuth2(
                client_id, client_secret, redirect_uris[0]);
          
            // Check if we have previously stored a token.
            fs.readFile(TOKEN_PATH, (err, token) => {
              if (err) 
              return resolve(getAccessToken(oAuth2Client, callback));
              oAuth2Client.setCredentials(JSON.parse(token));
              resolve(callback(oAuth2Client, options));
            });
        }
    )
   
  }

  /**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    return new Promise(
        (resolve, reject) => {
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
                  if (err) {
                    logger.error('Error retrieving access token', err);
                    return  reject(err)
                  }
                  
                  oAuth2Client.setCredentials(token);
                  // Store the token to disk for later program executions
                  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return logger.error(err);
                    logger.info('Token stored to', TOKEN_PATH);
                  });
                  return resolve(callback(oAuth2Client));
                });
              });
        }
    );
    
  }

  /**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {Object} options containing event details
 */
const listEvents = (auth,  options) => {
    const calendar = google.calendar({version: 'v3', auth});
    return calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
  }

  const getEvent = (auth, options) => {
    const calendar = google.calendar('v3');
    return calendar.events.get({
        auth: auth,
        calendarId: 'primary',
        eventId: options.eventId
    });
};

const addEvent = (auth, options) => {
    const calendar = google.calendar('v3');
    const summary = options.summary;
    const startTime = options.startTime;
    const endTime = options.endTime;
    const event = {
        summary: summary,
        start: {
            dateTime: startTime,
            timeZone: "Africa/Lagos"
        },
        end: {
            dateTime: endTime,
            timeZone: "Africa/Lagos"
        },
        recurrence: [
          'RRULE:FREQ=DAILY;COUNT=2'
        ],
        attendees: options.attendees,
        reminders: {
          useDefault: false,
          overrides: [
            {method: 'email', minutes: 24 * 60},
            {method: 'popup', minutes: 10},
          ],
        },
        sendUpdates: true
    };
    logger.info("add Event: ", event);
    return calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: event,
        sendUpdates: true,
    });
};

const updateEvent = (auth, options) => {
    const calendar = google.calendar('v3');
    return calendar.events.update({
        auth: auth,
        calendarId: 'primary',
        eventId: options.eventId,
        resources: options.resources
    });
};

const removeEvent = (auth, options) => {
    const calendar = google.calendar('v3');
    return calendar.events.delete({
        auth: auth,
        calendarId: 'primary',
        eventId: options.eventId
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
