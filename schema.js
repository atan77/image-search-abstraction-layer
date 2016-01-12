var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var imgsrchSchema = new mongoose.Schema({
  query: {type: String },
  when: Date
});

  var imgsrch = mongoose.model('imgsrch', imgsrchSchema);

//export Movie database and schema
module.exports = mongoose.model('imgsrch', imgsrchSchema);
