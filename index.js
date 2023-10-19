require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const { xss } = require('express-xss-sanitizer');
const fileUpload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const { mongodbConnector } = require("./services");
const routes = require("./routes");

mongodbConnector(mongoose);
app.use(fileUpload({
    createParentPath: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
const allowedOrigins = ['http://localhost:3000'];
app.use(cors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    optionsSuccessStatus: 204,
}));
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

app.use("/", routes);

app.all('/*', (req, res) => {
    res.status(404).send({ errno: 404, message: 'Endpoint not found', type: "INVALID_ENDPOINT" });
});


app.listen(process.env.PORT || 4001, process.env.HOST || "localhost", () => {
    console.log(`Listening on http://${process.env.HOST || "localhost"}:${process.env.PORT || 4001}`)
});