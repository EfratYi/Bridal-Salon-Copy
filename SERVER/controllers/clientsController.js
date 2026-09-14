const clientsModel = require('../model/clientsModel');
const usersModel = require('../model/usersModel');
const ordersModel=require('../model/ordersModel');
const bcrypt = require('bcrypt');

async function createClient(name, email, phone1, password) {
    try {
        const users = await usersModel.getUserByEmail(email);
        if (users.length != 0) {
            throw Error("user is already exist")
        }
        else {
            console.log("inside else")
            const hashedPassword = await bcrypt.hash(password, 10);
            const response = await clientsModel.createClient(name, email, phone1, hashedPassword);
            return response;
        }
    }
    catch (err) {
        throw err;
    }
}

async function getClients() {
    try {
        return clientsModel.getClients();
    }
    catch (err) {
        throw err;
    }
}
async function updateClient(id, userId, name, email, phone1, phone2,weddingDate) {
    try {
        return clientsModel.updateClient(id, userId, name, email, phone1, phone2,weddingDate);
    } catch (err) {
        throw err;
    }
}
async function deleteClient(userId) {
    try {
        const ordersOfClients=await ordersModel.getOrdersOfClient(userId);
        if(ordersOfClients.length!=0)
        {
            throw new Error("cannot delete this client- he has orders")
        }
        return clientsModel.deleteClient(userId);
    }
    catch (err) {
        throw err;
    }
}

module.exports = { getClients ,updateClient, deleteClient,createClient}
