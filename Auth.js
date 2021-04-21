var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
var app = express();
// var cookieParser=require('cookie-parser');
var bodyParser = require('body-parser');
const cors = require("cors");
var crypto = require('crypto');
const port = process.env.PORT || 5001
app.use(bodyParser.json());
app.use(cors());
"use strict";



var nodemailer = require("nodemailer");
const ID = require("nodejs-unique-numeric-id-generator")
var generateOTP = ID.generate(new Date().toJSON())
console.log("generate", generateOTP)
var transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
        user: "akhilas_reddy@outlook.com",
        pass: "ucandoit@",
    },
});



// generate a hash from string
key = "";

/* AWS CONF. BOL */
AWS.config.update({ region: "us-east-1", endpoint: "http://localhost:8000" });
var docClient = new AWS.DynamoDB.DocumentClient();

const dynamoDB = new AWS.DynamoDB();
const findDBtables = dynamoDB.listTables();
// console.log("findDB", findDBtables);

findDBtables
    .promise()
    .then(async (getTableNames) => {
        const findUserDataTable = getTableNames.TableNames.find(
            (tableName) => tableName === "Auth"
        );
        if (findUserDataTable) {
            console.log("Data inserted");
            await insertAuthRecords();
        } else {
            await createAuthTable().then(async () => {
                await insertAuthRecords();
                console.log("Table created & Data inserted");
            });
        }
    })
    .catch((error) => {
        console.log(error);
    });

const createAuthTable = () => {
    const tableSchemaParam = {
        TableName: "Auth",
        KeySchema: [
            { AttributeName: "email", KeyType: "HASH" },
            // { AttributeName: "age", KeyType: "RANGE" },
        ],

        AttributeDefinitions: [
            { AttributeName: "email", AttributeType: "S" },
            // { AttributeName: "age", AttributeType: "N" },
        ],

        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 1,
        },
    };
    return new Promise((resolve, reject) => {
        dynamoDB.createTable(tableSchemaParam, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(data);
        });
    });
};
var itemList = [];
console.log(itemList, "itemList");
const insertAuthRecords = () => {
    const Auth = {
        TableName: "Auth",
        Item: {
            email: "aaa",
            password: "#1234",
            userName: "aaas"

        },
    };
    dataList = Auth.Item;
    const docClient = new AWS.DynamoDB.DocumentClient();
    return new Promise((resolve, reject) => {
        docClient.put(Auth, (err, data) => {
            // console.log("Auth", data);
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(data);
            console.log("Auth", Auth);
        });
    });
};

/*
----------------------------
    Registration section
----------------------------
*/


app.post("/sendOTP", (req, res, err) => {
    // AWS.config.update({
    //   region: "us-west-2",
    //   endpoint: "http://localhost:8000",
    // });
    const { email } = req.body;
    try {
        var mailOptions = {
            from: "akhilas_reddy@outlook.com",
            to: email,
            subject: "Sending OTP",
            text:
                `Use ${generateOTP} to verify your account..`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.json({ "Error": { "Response": "Error while sending Mail" } });
            } else {
                console.log("Email sent: " + info.response);
                res.json({ "OK": { "Response": "OTP sent to your Email", "OTP": generateOTP } });
            }
        });
    }
    catch (error) {
        res.send({
            success: false,
            message: "Error:Error while fetching data",
        });
    }


    // const docClient = new AWS.DynamoDB.DocumentClient();
    // const params = {
    //   TableName: "Auth",
    //   Item: {
    //     email:email
    //   },
    // };

    // docClient.put(params, function (err, data) {
    //   console.log("data", data,params);
    //   if (err) {
    //     res.send({
    //       success: false,
    //       message: "Error:Error while fetching data",
    //     });
    //   } else {
    //     console.log("data", data);
    //     console.log("data",params.Item.email);
    //     var mailOptions = {
    //         from: "akhilas_reddy@outlook.com",
    //         to: params.Item.email,
    //         subject: "Sending OTP",
    //         text:
    //           `Use ${generateOTP} to verify your account..`,
    //       };
    //     transporter.sendMail(mailOptions, function (error, info) {
    //         if (error) {
    //           console.log(error);
    //           res.json({"Error":{"Response":"Error while sending Mail"}});
    //         } else {
    //           console.log("Email sent: " + info.response);
    //           res.json({"OK":{"Response":"OTP sent to your Email","OTP":generateOTP}});
    //         }
    //       });

    //   }
    // });
});

app.post("/validateOTP", (req, res, next) => {

    const { otp } = req.body;
    try {
        if (generateOTP === otp) {
            console.log("otp validated");
            res.json({ "OK": { "Response": "OTP is Verified" } });
        }
        else if (generateOTP != otp) {
            res.json({ "Error": { "Response": "OTP is not valid" } });
        }
        else {
            res.json({ "Error": { "Response": "OTP is not valided" } });
        }

    }
    catch(error){
        res.send({
            success: false,
            message: "Error in fetching data",
        });
    }
    
    // AWS.config.update({
    //   region: "us-west-2",
    //   endpoint: "http://localhost:8000",
    // });
    // const docClient = new AWS.DynamoDB.DocumentClient();
    // const params = {
    //   TableName: "Auth",
    //   Item: {
    //     otp:otp
    //   },
    // };
    // docClient.put(params, function (err, data) {
    //   console.log("data", data,params);
    //   if (err) {
    //     res.send({
    //       success: false,
    //       message: "Error in fetching data",
    //     });
    //   } else {
    //       if(generateOTP === params.Item.otp ){
    //         console.log("otp validated");
    //         res.json({"OK":{"Response":"OTP is Verified"}});
    //       }
    //       else if(generateOTP != params.Item.otp ){
    //         res.json({"Error":{"Response":"OTP is not valid"}});
    //       }
    //       else{
    //         res.json({"Error":{"Response":"OTP is not valided"}}); 
    //       }


    //   }
    // });
});


app.post("/registration", (req, res, next) => {
    AWS.config.update({
        region: "us-west-2",
        endpoint: "http://localhost:8000",
    });
    const { email, firstname, lastname, password } = req.body;
    userEmail = req.body.email
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: "Auth",
        Item: {
            email: email,
            firstname: firstname,
            lastname: lastname,
            password: password
        },
    };
    console.log(params.Item, "items");
    docClient.put(params, function (err, data) {
        console.log("data", data, params);
        if (err) {
            res.send({
                success: false,
                message: "Error:Error while fetching data",
            });
        } else {
            res.json({ "OK": { "Response": "Thanks for signing up!" } });
        }
    });
});























































app.post('/registration1', function (req, res, next) {
    /* Paramaters */
    AWS.config.update({
        region: "us-west-2",
        endpoint: "http://localhost:8000",
    });
    var { email, userName, password } = req.body;
    //Read for current user.
    console.log(req.body)
    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
        TableName: "Auth",
        // Key:JSON.stringify({
        //     email: req.body.email
        // }),
        Item: {
            "email": email,
            "password": password,
            "userName": userName,
            // "dateCreated": Date().toString(),
            // "userEnabled": 1
        }

    };
    console.log(params, "paramss")
    const data = params.Item;
    docClient.get(params, function (err, data) {
        console.log(params, data, "paramss")
        if (err) {
            res.json({ "Error": { "Critical": "Unable to read item. Error JSON:" + err } });
        } else {

            res.json({ "OK": { "Response": "Thanks for signing up!" } });

        }
    });



    function addUser() {
        // create hahs
        //    var hash = crypto.createHmac('sha512', key);
        //    hash.update(password);
        //    var hashed_pass = hash.digest('hex').toString();

        /* INTO DATABASE */
        var paramsWrite = {
            TableName: "Authentication",
            Item: {
                "password": password,
                "email": email,
                "userName": userName,
                "dateCreated": Date().toString(),
                "userEnabled": 1
            }
        };
        docClient.put(paramsWrite, function (err, data) {
            if (err) {
                res.json({ "Error": { "Critical": "Unable to add item. Error JSON:" + err } });
            } else {
                res.json({ "OK": { "Response": "Thanks for signing up!" } });
            }
        });
    };
});

/*
----------------------------
      Login section
----------------------------
*/
app.post('/login', function (req, res, next) {
    var username_from_header = req.get('userName').toString();
    var password_from_header = req.get('password').toString();

    //Generate password from header submission
    var hash = crypto.createHmac('sha512', key);
    hash.update(password_from_header);
    var hashed_pass = hash.digest('hex').toString();
    var SearchHashedPass = hashed_pass;

    var params = {
        TableName: "Authentication",
        Key: {
            "userName": username_from_header
        }
    };
    function SessionID_Generator() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
    function writeSessiontoDB(SessionID) {
        var WriteSessionID = {
            TableName: "AuthenticationSessionKeys",
            Item: {
                "SessionId": SessionID,
                "userName": username_from_header,
                "createDate": Date().toString()

            }
        };
        docClient.put(WriteSessionID, function (err, data) {
            if (err) {
                console.log("Unable to add item. Error JSON:", err, 2);
            } else {
            }
        });
    };

    docClient.get(params, function (err, data) {
        if (err) {
            res.json({ "Error": { "Critical": "Unable to read item. " + err } });
        } else {
            for (hashed_pass in data) {
                foundpassword_from_DB = data.Item.password_SHA512;
                if (SearchHashedPass === foundpassword_from_DB) {
                    var SessionID = SessionID_Generator()
                    writeSessiontoDB(SessionID)
                    res.send({ "OK": { "SessionID": SessionID } });
                } else {
                    res.json({ "Warning": { "Response": "Login failed, credentials are incorrect." } });
                    // Commit IP to the BLOCK DB after 10 attempts
                }
            }
        };

    });
});


var server = app.listen(port, function (err) {
    if (err) {
        console.log("Server creation error..");
    } else {
        console.log("Server is running on.." + port);
    }
});
module.exports = server;

// https://github.com/SteveMB1/Authentication-NodeJS-DynamoDB/blob/master/verifySessionID.js