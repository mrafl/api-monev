import * as dotenv from 'dotenv';
dotenv.config()

import express from "express";
import Router from "./utilities/router";
import * as BodyParser from "body-parser";
import * as cors from 'cors';

const port = process.env.PORT;
const app = express();
const cron = require('node-cron');

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