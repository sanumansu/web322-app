const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: { type: String, unique: true },
  password: { type: String },
  email: { type: String },
  loginHistory: [
    {
      dateTime: { type: Date },
      userAgent: { type: String }
    }
  ]
});

let User;

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection("mongodb+srv://sanumansu602:SaniyaMansuri0602%23@cluster0.fa5f0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    db.on('error', (err) => {
      reject(err); 
    });
    db.once('open', () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

async function registerUser(userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt.hash(userData.password, 10)
        .then(hash => {
          let newUser = new User({
            userName: userData.userName,
            password: hash,
            email: userData.email,
            loginHistory: []
          });

          newUser.save((err) => {
            if (err) {
              if (err.code === 11000) {
                reject("User Name already taken");
              } else {
                reject(`There was an error creating the user: ${err}`);
              }
            } else {
              resolve();
            }
          });
        })
        .catch(err => {
          reject("There was an error encrypting the password");
        });
    }
  });
}

async function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName }, (err, users) => {
      if (err) {
        reject(`Unable to find user: ${userData.userName}`);
      } else if (users.length === 0) {
        reject(`Unable to find user: ${userData.userName}`);
      } else {
        const user = users[0];
        bcrypt.compare(userData.password, user.password)
          .then(result => {
            if (!result) {
              reject(`Incorrect Password for user: ${userData.userName}`);
            } else {
              user.loginHistory.push({
                dateTime: new Date().toString(),
                userAgent: userData.userAgent
              });

              User.updateOne({ userName: user.userName }, { $set: { loginHistory: user.loginHistory } }, (err) => {
                if (err) {
                  reject(`There was an error verifying the user: ${err}`);
                } else {
                  resolve(user);
                }
              });
            }
          })
          .catch(err => {
            reject(`There was an error verifying the user: ${err}`);
          });
      }
    });
  });
}

module.exports = {
  initialize: module.exports.initialize,
  registerUser,
  checkUser
};