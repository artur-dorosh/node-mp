const express = require('express');
const app = express();
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({
    passError: true,
});
const userSchema = Joi.object({
    id: Joi.string().required(),
    login: Joi.string().required(),
    password: Joi.string().regex(new RegExp('^[a-zA-Z0-9]+$')).required(),
    age: Joi.number().min(4).max(130).required(),
    isDeleted: Joi.boolean().required(),
});
let users = [
    {
        id: '234c7463-5345-4010-8d22-b75ac906695f',
        login: 'Artemii',
        password: 'test',
        age: 26,
        isDeleted: false
    }, {
        id: '21486c2b-215b-4afd-9597-de4e16a9e4d7',
        login: 'Marina',
        password: 'test',
        age: 24,
        isDeleted: false
    }, {
        id: "234c7463-5345-4010-8d22-b75ac706435f",
        login: "Vladislava",
        password: "test",
        age: 0,
        isDeleted: false
    }
];
app.listen(3000, () => {
    console.log('server running on port 3000');
});
app.use(express.json());
app.use('/', router);
router.param('id', (req, res, next, id) => {
    req.user = users.find((user) => user.id === id);
    if (!req.user) {
        res.status(404).send('User not found...');
    }
    next();
});
router.route('/:id')
    .get((req, res, next) => {
    res.json(req.user);
    next();
})
    .put(validator.body(userSchema), (req, res, next) => {
    users = users.map((item) => item.id === req.user.id ? req.body : item);
    res.send('Complete user update was successfully!');
    next();
})
    .patch((req, res, next) => {
    users = users.map((item) => item.id === req.user.id ? Object.assign(Object.assign({}, item), req.body) : item);
    res.send('Partial user update was successfully!');
    next();
})
    .delete((req, res) => {
    users = users.map((item) => {
        if (item.id === req.user.id) {
            if (!item.isDeleted) {
                return Object.assign(Object.assign({}, item), { isDeleted: true });
            }
            else {
                res.status(204);
            }
        }
        return item;
    });
    res.send('User deleted successfully!');
});
router.route('/')
    .get((req, res, next) => {
    res.json(getAutoSuggestUsers(req.query.login, req.query.limit));
    next();
})
    .post(validator.body(userSchema), (req, res) => {
    users.push(req.body);
    res.send('User added successfully!');
});
function getAutoSuggestUsers(loginSubstring = '', limit) {
    return users
        .filter((item) => item.login.toLocaleLowerCase().includes(loginSubstring.toLocaleLowerCase()))
        .slice(0, limit || users.length);
}
app.use((err, req, res, next) => {
    if (err && err.error && err.error.isJoi) {
        console.log(err.error.details);
        res.status(400).json({
            type: err.type,
            message: err.error.toString(),
        });
    }
    else {
        next(err);
    }
});
