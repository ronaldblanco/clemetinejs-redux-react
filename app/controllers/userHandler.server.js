
import Users from '../models/users.js';
import message from '../models/message.js';
import email from 'emailjs/email';
import randomize from 'randomatic';
import md5Hex from 'md5-hex';

import winston from 'winston';
require('winston-daily-rotate-file');
import functions from '../common/functions.server.js';

// LOGGER//////////////////////////////////////////
const logger = new (winston.Logger)({
  transports: [
    functions.transport,
  ],
});
// eslint-disable-next-line consistent-return
function logIf(erra, messagea, env, next) {
  if (env === 'development') {
    functions.logIt(logger, erra || messagea);
  } else {
    return next(erra);
  }
}
// functions.logIt(logger,'//////////////////STARTING LOGGER INFO////////////////////////');
// ///////////////////////////////////////////////

// Helper to validate email based on regex
/* eslint-disable max-len */
const EMAIL_REGEX = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
/* eslint-enable max-len */
// ///////////////////////////////////////////////////
function validateEmail(emailV) {
  if (typeof emailV === 'string' && EMAIL_REGEX.test(emailV)) {
    return emailV.toLowerCase();
  }
  return false;
}
// ///////////////////////////////////////////////////
/* eslint-disable func-names */
/* eslint-disable consistent-return */
function UserHandler(emailServer, env) {
  const server = email.server.connect({
    user: emailServer.user,
    password: emailServer.password,
    host: emailServer.host,
    port: emailServer.port,
    ssl: true,
  });
  this.formValues = (req, res, next) => {
    const form = {};
    form.username = req.originalUrl.toString().split('?username=')[1].split('?display=')[0];
    form.display = req.originalUrl.toString().split('?display=')[1].split('?password=')[0];
    form.password = req.originalUrl.toString().split('?password=')[1];
    // console.log(form);
    Users
      .findOne({ 'twitter.username': req.body.username }, { _id: false })
        .exec((err, result) => {
          if (err) { return next(err); }
          if (result === null) {
            const newUser = new Users();
            newUser.twitter.username = form.username;
            const emailU = validateEmail(form.username);
            if (emailU !== false) { newUser.twitter.email = emailU; }
            newUser.twitter.password = md5Hex(form.password);
            newUser.twitter.id = randomize('0', 7);
            newUser.twitter.displayName = form.display;
            newUser.save((erru) => {
              if (erru) {
                return next(erru);
              }
            });
          }
        }).catch(next);
    // let message = {};
    message.message = 'The User was created correctly!';
    message.type = 'alert alert-success';
    // res.send({form: form});
    res.send(message);
  };
  /* eslint-disable func-names */
  this.addUser = (req, res, next) => { // Add Local user
  // console.log(newUser);
  /* eslint-enable func-names */
    Users
      .findOne({ 'twitter.username': req.body.username }, { _id: false })
        .exec((err, result) => {
          if (err) { return next(err); }
          if (result === null) {
            const newUser = new Users();
            newUser.twitter.username = req.body.username;
            const emailU = validateEmail(req.body.username);
            if (emailU !== false) { newUser.twitter.email = emailU; }
            newUser.twitter.password = md5Hex(req.body.password);
            newUser.twitter.id = randomize('0', 7);
            newUser.twitter.displayName = req.body.display;
            newUser.save((erru) => {
              if (erru) {
                return next(erru);
              }
						// ///////////Email send!!////////////////////
              if (emailU !== false) {
                // console.log(emailU);
                server.send({
                  text: 'Welcome to Clementine Pnald version!',
                  from: `Admin <${emailServer.user}>`,
                  to: `New User <${emailU}>`,
                  // cc: 'else <else@your-email.com>',
                  subject: 'Welcome Email!',
                }, (errm, messagem) => logIf(errm, messagem, env, next));
              }
						// //////////////////////////////
              message.message = 'The User was created correctly!';
              message.type = 'alert alert-success';
              res.redirect('/creationoklocal');
            });
          } else {
            message.message = 'The User already exist in the database!';
            message.type = 'alert alert-info';
            res.redirect('/creationoklocal');
          }
        }).catch(next);
  };
  /* eslint-disable func-names */
  this.resetPass = (req, res, next) => { // Reset Password
  /* eslint-enable func-names */
    const username = req.originalUrl.toString().split('?name=')[1];
    const newPass = randomize('0', 7);
    const emailR = validateEmail(username);
    if (emailR !== false) {
      Users
        .findOneAndUpdate({ 'twitter.username': username }, { 'twitter.password': md5Hex(newPass) })
          .exec((err, result) => {
            if (err) { return next(err); }
            if (result !== undefined && result !== null) {
              // send the message and get a callback with an error
              // or details of the message that was sent
              // console.log(server);
              server.send({
                text: `Your new password is: ${newPass}`,
                from: `Admin <${emailServer.user}>`,
                // to: 'New User <' + username + '>',
                to: `New User <${username}>`,
                // cc: 'else <else@your-email.com>',
                subject: 'Your password was reset!',
              }, (errm, messagem) => logIf(errm, messagem, env, next));
              message.message = 'The password was reset correctly; an email was send to the user!';
              message.type = 'alert alert-success';
              res.send({
                message: 'The password was reset correctly; an email was send to the user!',
                type: 'alert alert-success',
              });
            }
          }).catch(next);
    } else {
      message.type = 'alert alert-warning';
      message.message = 'The username it is not a valid email account!';
      res.send({
        message: 'The username it is not a valid email account!',
        type: 'alert alert-warning',
      });
    }
  };
  /* eslint-disable func-names */
  this.message = (req, res) => {
  /* eslint-enable func-names */
    res.send(message);
  };
}
/* eslint-enable func-names */
/* eslint-enable consistent-return */
module.exports = UserHandler;
