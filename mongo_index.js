import Express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import multer from "multer";

var app = Express()

var DATABASE_NAME = "ProjectIM";

var CONNECTION_STRING = "mongodb://127.0.0.1:27017/";

var database;

app.listen(9090, () => {
    MongoClient.connect(url=CONNECTION_STRING, (error, client) => {
        if(error) {
            console.log("Connected to `" + DATABASE_NAME + "`!");
            throw error;            
        }
        database = client.db(DATABASE_NAME);
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
})