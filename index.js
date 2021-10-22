require('dotenv').config();
require('express-async-errors');
// express

const express = require('express');
const app = express();
// rest of the packages
const morgan = require('morgan');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');



const logger = require('./utils/logger');

// database
const noSqlDB = require('./db/mongoose');
const sqlDB = require('./db/sequelize');

//  routers

const toDoRoutes = require('./routes/toDoRoutes');
const eventRoutes = require('./routes/eventRoutes');


// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(morgan('tiny'));
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());

app.use(express.static('./public'));

app.use('/api/v1/todos', toDoRoutes);
app.use('/api/v1/events', eventRoutes);


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.use(express.static('./public'));

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await noSqlDB(process.env.MONGODB_URL);

    await sqlDB.sequelize.sync({ force: false})

    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      });
   
  } catch (error) {
    console.log(error);
  }
};

start();
