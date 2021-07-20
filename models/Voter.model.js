const mongoose = require('mongoose');

const VoterSchema = new mongoose.Schema({
  ip : {type: String, required: true},
  votes : {type: Array, required: true}
});

module.exports = mongoose.model('Voter', VoterSchema);