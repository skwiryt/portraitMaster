const Photo = require('../models/Photo.model');
const Voter = require('../models/Voter.model');
var sanitize = require('mongo-sanitize');

/****** SUBMIT PHOTO ********/

const onlyAlphanum = (text) => text.match(/([A-z0-9\s-&!?_,.])*/g).join('').length === text.length;

const emailOK = (email) => /@/.test(email);


exports.add = async (req, res) => {

  try {
    let { title, author, email } = req.fields;
    // title = sanitize(title);
    const file = req.files.file;
    const ext = file.name.split('.')[1];
    const inputOK = title && author && email && file 
      && (ext === 'jpg' || ext === 'png' || ext === 'svg') 
      && title.length <= 25 && author.length <= 50
      && onlyAlphanum(title) && onlyAlphanum(author) && emailOK(email);
    
    if(inputOK) { // if fields are not empty and file is an image...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const ip = req.clientIp;
    const voter = await Voter.findOne({ip: ip});
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else if (!voter) {
      const newVoter = new Voter({ip: ip, votes: [req.params.id]});
      newVoter.save();
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    } else if (!voter.votes.includes(req.params.id)) {
      voter.votes.push(req.params.id);
      voter.save();
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    } else {
      throw new Error('Already voted');
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
