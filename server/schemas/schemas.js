const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://strangesongs:LF7uSXURA4bZt9i@fruit.26ngu.mongodb.net/fruit?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, {
    // options for the connect method to parse the URI
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // sets the name of the DB that our collections are part of
    dbName: 'fruit'
  })
    .then(() => console.log('Connected to Mongo DB.'))
    .catch(err => console.log(err));
  
  const Schema = mongoose.Schema;

  const userSchema = new Schema({
      userName: String,
      password: String,
      savedPins: Object
  })



  const User = mongoose.model('users', userSchema);

  module.exports = {
      User
  };