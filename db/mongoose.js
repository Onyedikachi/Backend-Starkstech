const mongoose = require('mongoose')

const fs = require('fs');
// const certFileBuf = fsreadFileSync('./rds-combined-ca-bundle.pem');


const connectDB = (url) => {
  // return mongoose.connect(url, {
  //   useNewUrlParser: true,
  //   useCreateIndex: true,
  //   useFindAndModify: false,
  //   useUnifiedTopology: true,ß
  // })
  return mongoose.connect(url, { 
    useNewUrlParser: true,
    // useUnifiedTopology: true,
    // sslCA: certFileBuf,
  });
}

module.exports = connectDB