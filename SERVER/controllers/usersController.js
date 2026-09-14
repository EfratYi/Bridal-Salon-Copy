const usersModel = require('../model/usersModel');
const clientModel = require('../model/clientsModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


async function loginController(email, password) {
    try {
        const userToLogIn = await usersModel.loginModel(email);
        if (!userToLogIn) {
            throw new Error('User not found');
        }

        if (userToLogIn && password == null) {
            throw new Error('enter password');
        }
        const passwordMatch = await bcrypt.compare(password, userToLogIn.password);
        console.log('Password match:', passwordMatch);

        if (!passwordMatch) {
            throw new Error('Incorrect password');
        }
        const returnUser={id:userToLogIn.id, email:userToLogIn.email}
        // create token
        const secret = process.env.JWT_SECRET || 'dev_secret';
        const token = jwt.sign({ id: userToLogIn.id, email: userToLogIn.email }, secret, { expiresIn: '7d' });
        return { user: returnUser, token };
    }
    catch (err) {
        throw err;
    }
}
async function getUserByEmail(email) {
    try {
        return usersModel.getUserByEmail(email);
    }
    catch (err) {
        throw err;
    }
}
async function getUsers() {
    try {
        return usersModel.getUsers();
    }
    catch (err) {
        throw err;
    }
}

async function getUserById(userId) {
    try {
        console.log('userId')
        console.log(userId)
        return usersModel.getUserById(userId);
    }
    catch (err) {
        throw err;
    }
}



async function postClient(name, email, phone1, password, dressStyle, remarks) {
    try {
        const userToRegister = await usersModel.getUserByEmail(email);

        if (userToRegister.length != 0) {
            throw Error("user is already exist")
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const response = await clientModel.createClient(name, email, phone1, hashedPassword, dressStyle, remarks);
            console.log('responsecontroller')
            console.log(response)
            return response;
        }
    }
    catch (err) {
        throw err;
    }
}
async function updateUser(id, name, email, phone1, phone2, password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return usersModel.updateUser(id, name, email, phone1, phone2, hashedPassword);
    }
    catch (err) {
        throw err;
    }
}
async function deleteUser(id) {
    try {
        return usersModel.deleteUser(id);
    }
    catch (err) {
        throw err;
    }
}



async function createUser(userId, name, email, phone1, phone2, password) {
    try {
        const userToRegister = await usersModel.getUserByEmail(email);
        if (userToRegister.length != 0) {
            throw Error("user is already exist")
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const response = await usersModel.createUser(userId, name, email, phone1, phone2, hashedPassword);
            return response;
        }
    }
    catch (err) {

        throw err;

    }
}

module.exports = { loginController, getUserByEmail, createUser, getUsers, getUsers, getUserById, postClient, updateUser, deleteUser }
