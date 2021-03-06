
import Users from '../models/users.js';
import randomize from 'randomatic';

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
function AdminHandler() {
  this.getAllUsers = (req, res, next) => {
    Users
      .find({}, {})
      .exec((err, result) => {
        if (err) { return next(err); }
        const users = [];
        result.forEach((user) => {
          users.push({
            username: user.twitter.username,
            display: user.twitter.displayName,
            email: user.twitter.email,
            password: user.twitter.password,
            clicks: user.nbrClicks.clicks,
            datas: user.info.data,
          });
        });
        /* eslint-disable object-shorthand */
        res.send({ users: users });
        /* eslint-enable object-shorthand */
      }).catch(next);
  };
  this.adminAddUser = (req, res, next) => {
    const form = {};
    // eslint-disable-next-line max-len
    form.username = unescape(req.originalUrl.toString().split('?username=')[1].split('?display=')[0]);
    form.display = unescape(req.originalUrl.toString().split('?display=')[1].split('?email=')[0]);
    form.email = req.originalUrl.toString().split('?email=')[1].split('?password=')[0];
    form.password = req.originalUrl.toString().split('?password=')[1].split('?clicks=')[0];
    form.clicks = req.originalUrl.toString().split('?clicks=')[1].split('?datas=')[0];
    form.datas = req.originalUrl.toString().split('?datas=');
    form.datas.shift();
    const newData = [];
    form.datas.map((data) => {
      newData.push({ name: data.split('::')[0], value: data.split('::')[1] });
      return 0;
    });
    form.datas = newData;
//    console.log(form);
    let final = {};
    /* eslint-disable max-len */
    Users
        .findOneAndUpdate({ 'twitter.username': form.username }, { 'twitter.displayName': form.display, 'twitter.email': form.email, 'twitter.password': form.password, 'nbrClicks.clicks': form.clicks, 'info.data': form.datas })
          /* eslint-enable max-len */
          .exec((err, result) => {
            if (err) { return next(err); }
            if (result === null) {
              const newUser = new Users();
              newUser.twitter.username = form.username;
              const emailU = validateEmail(form.email);
              if (emailU !== false) { newUser.twitter.email = emailU; }
              newUser.twitter.password = form.password;
              newUser.twitter.id = randomize('0', 7);
              newUser.twitter.displayName = form.display;
              newUser.nbrClicks.clicks = form.clicks;
              newUser.info.data = form.datas;
              newUser.save((erru) => {
                if (erru) {
                  return next(erru);
                }
                final = { result: 'created-new' };
              });
            }
            /* eslint-disable object-shorthand */
            final = { result: result };
            /* eslint-enable object-shorthand */
          }).catch(next);
    res.send(final);
  };
  this.adminDelUser = (req, res, next) => {
    const form = {};
    form.username = req.originalUrl.toString().split('?username=')[1];
    // console.log(form);
    let final = {};
    Users
        .findOne({ 'twitter.username': form.username }, {})
          .remove().exec((err, result) => {
            if (err) { return next(err); }
            /* eslint-disable object-shorthand */
            final = { result: result };
            /* eslint-enable object-shorthand */
          }).catch(next);
    res.send(final);
  };
}
/* eslint-enable func-names */
/* eslint-enable consistent-return */
module.exports = AdminHandler;
