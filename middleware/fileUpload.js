const multer = require('multer');
const path = require('path');
const { promisify } = require('util')

const appDir = path.dirname(require.main.filename);

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, appDir + '/public/uploads')
    },
    filename: function (req, file, callback) {
      callback(null, file.fieldname + '-' + Date.now())
    }
  });
   
const upload = promisify(multer({ storage: storage }).array("multi-files", 10));

module.exports = {
    upload
}