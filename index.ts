import * as dotenv from 'dotenv';
dotenv.config()

import express, {static} from "express";
import Router from "./utilities/router";
import * as BodyParser from "body-parser";
import * as cors from 'cors';
import {knex} from "./utilities/knex";
import {createLog, error, now, success, tanggalExpired} from "./utilities/Utils";
import {stat} from "fs";

const port = process.env.PORT;
const app = express();
const cron = require('node-cron');
const nodemailer = require('nodemailer');

app.use(cors.default((_, callback) => callback(null, {
    origin: "*",
    credentials: true
})));
app.use(BodyParser.json({limit: '25mb'}));
app.use(BodyParser.urlencoded({extended: true, limit: '25mb'}));
app.use(express.static("public"));
app.use(express.static("build/public"));

Router.route(app);

app.listen(port);
console.log("Server Started")


cron.schedule('* * * * * *', function (){
    let expiredBimbingan = null;
    expiredBimbingan = await knex("bimbingan")
        .where("expiredAt", now())
});