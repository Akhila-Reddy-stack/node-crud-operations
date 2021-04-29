
'use strict';


var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
var app = express();
// var cookieParser=require('cookie-parser');
var bodyParser = require('body-parser');
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");
var crypto = require('crypto');

var SendMail = function () { };

module.exports = SendMail;
const port = process.env.PORT || 5000
app.use(bodyParser.json());
app.use(cors());


const config = require('../config.js');

var env = process.env.NODE_ENV || 'development';
console.log(env, "env")
console.log("process.env.PORT", process.env.PORT)

if (env === 'development') {
    AWS.config.update(config.aws_local_config);
}
else {
    AWS.config.update(config.aws_remote_config);
}
var nodemailer = require("nodemailer");
// const ID = require("nodejs-unique-numeric-id-generator")
// var generateOTP = ID.generate(new Date(4).toJSON())

var otpGenerator = require('otp-generator')

var generateOTP = otpGenerator.generate(4, { digits: true, alphabets: false, upperCase: false, specialChars: false });
console.log("generate", generateOTP)

var svc = new AWS.DynamoDB();
const params = {
    TableName: "users",

};
var tableCount;
svc.describeTable(params, function (err, data) {
    if (err) {
        // error
    } else {
        var table = data['Table'];
        tableCount = table['ItemCount']
        console.log(table['ItemCount']);
    }
});


// generate a hash from string
// key = "";

/* AWS CONF. BOL */
// AWS.config.update({ region: "us-east-1", endpoint: "http://localhost:8000" });
var docClient = new AWS.DynamoDB.DocumentClient();

const dynamoDB = new AWS.DynamoDB();
const findDBtables = dynamoDB.listTables();
// console.log("findDB", findDBtables);

findDBtables
    .promise()
    .then(async (getTableNames) => {
        const findUserDataTable = getTableNames.TableNames.find(
            (tableName) => tableName === "users"
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
        TableName: "users",
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
    const auth = {
        TableName: "users",
        Item: {
            id:1,
            email: "akhilasreddy34@gmail.com",
            password: "#1234",
            firstname: "abc",
            lastname:"xyz"


        },
    };
    // dataList = Auth.Item;
    const docClient = new AWS.DynamoDB.DocumentClient();
    return new Promise((resolve, reject) => {
        docClient.put(auth, (err, data) => {
            // console.log("Auth", data);
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(data);
            console.log("auth", auth);
        });
    });
};

/*
----------------------------
    Registration section
----------------------------
*/
var transporter = nodemailer.createTransport({
    service: "outlook",
    host: "akhilas_reddy@outlook.com",
    secureConnection: false,
    auth: {
        user: "akhilas_reddy@outlook.com",
        pass: "ucandoit@",
    },
});


function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&'*+,-@^_`~",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

console.log(`id with 8 digits - ${generatePassword(8)}`);
var randomPassword = `${generatePassword(8)}`

function sendMailtoUser(MailOptions) {
    // console.log("sendmailer")
    var readHTMLFile = function (path, callback) {
        fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
            if (err) {
                callback(err);
                throw err;
            } else {
                callback(null, html);
            }
        });
    };

    var transporter = nodemailer.createTransport({
        service: "outlook",
        // host: "akhilas_reddy@outlook.com",
        secureConnection: false,
        auth: {
            user: "akhilas_reddy@outlook.com",
            pass: "ucandoit@",
        },
    });
    readHTMLFile(MailOptions.htmlPath, (err, html) => {
        var template = handlebars.compile(html);
        var htmlToSend = template(MailOptions.replacements);
        console.log(MailOptions.replacements.email)
        let mailOptions = {
            from: "akhilas_reddy@outlook.com",
            to: MailOptions.replacements.email,
            subject: MailOptions.subject,
            html: htmlToSend,
            attachments: MailOptions.attachments,
        };
        // console.log(mailOptions)
        transporter.sendMail(mailOptions, (error, info) => {
            // console.log("mailOptions", mailOptions)
            // console.log("mailOptions", error)
            if (error) return resolve({ status: false, message: error.message });
            return resolve({ status: true, message: "Mail has been sent." });
        });
    });

}



// var GuestName = "hloooooo"
// var HotelName = "aaaa"
// var BookingId = 4
// var webUrl = "werw"
// var HotelId = 1
// const MailOptions = {
//     subject: `Feedback`,

//     replacements: {
//         GuestName,
//         HotelName,
//         BookingId,
//         webUrl,
//         HotelId,
//     },
//     attachments: [

//         {
//             path: path.join(__dirname + "/welcome-img.jpg"),
//             cid: "o2",
//             contentDisposition: "inline",
//         },
//     ],
//     htmlPath: path.join(__dirname + "/Newpassword.html"),
// };
// const mailRes = sendMailtoUser(MailOptions);
// mailRes;

class Auth {

    // List of Users
    async getUsersList(req, res) {
        console.log('dattttt');

        if (env === 'development') {
            AWS.config.update(config.aws_local_config);
        }
        else {
            AWS.config.update(config.aws_remote_config);
        }

        const docClient = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: 'users',
        };
        docClient.scan(params, function (err, data) {
            console.log("user scan", data);
            if (err) {
                res.send({
                    status: false,
                    message: "Error:Server error",
                });
            } else {
                const { Items } = data;

                res.send({
                    status: true,
                    message: "Users List",
                    data: Items,
                });
            }
        });
    }


    async sendOTP(req, res) {

        const { email } = req.body;
        console.log(email)
        try {
            var mailOptions = {
                from: "akhilas_reddy@outlook.com",
                to:email,
                // to: "prematix_akhilas@outlook.com",
                subject: "Sending OTP",
                text:
                    `Use ${generateOTP} to verify your account..`,
            };
            // let mailOptions = {
            //     from: "akhilas_reddy@outlook.com",
            //     to: email,
            //     subject: MailOptions.subject,
            //     subject: "Sending OTP"
            //   };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.send({
                        status: false,
                        message: "Error while sending Mail",
                    });

                } else {
                    console.log("Email sent: " + info.response);
                    res.send({
                        status: true,
                        message: "OTP sent to your Email !!",
                        "OTP": generateOTP
                    });

                }
            });
        }
        catch (error) {
            res.send({
                status: false,
                message: "Error:Error while fetching data",
            });
        }
    }

    async validateOTP(req, res) {
        const { otp } = req.body;
        try {
            if (generateOTP === otp) {
                console.log("otp validated");
                res.send({
                    status: true,
                    message: "OTP is Verified !!",
                });
                res.json({ "OK": { "Response": "OTP is Verified" } });
            }
            else if (generateOTP != otp) {
                res.send({
                    status: false,
                    message: "OTP is not valid !!",
                });
            }
            else {
                res.send({
                    status: false,
                    message: "OTP is not valided !!",
                });
            }

        }
        catch (error) {
            res.send({
                status: false,
                message: "Error in fetching data",
            });
        }
    }


    async registration(req, res) {
        if (env === 'development') {
            AWS.config.update(config.aws_local_config);
        }
        else {
            AWS.config.update(config.aws_remote_config);
        }

        const { email, firstname, lastname, password } = req.body;
     
        const docClient = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: "users",
            Item: {
                id: tableCount,
                email: email,
                firstname: firstname,
                lastname: lastname,
                password: randomPassword
            },
        };
        console.log(params.Item, "items");
        docClient.put(params, function (err, data) {
            console.log("data", data, params);
            if (err) {
                res.send({
                    status: false,
                    message: "Error:Error while fetching data",
                });
            } else {
                res.send({
                    status: true,
                    message: "Thanks for signing up!",
                });
            }
        });
    }


    //   LOGIN

    async Login(req, res) {
        console.log('dattttt');
        if (env === 'development') {
            AWS.config.update(config.aws_local_config);
        }
        else {
            AWS.config.update(config.aws_remote_config);
        }

        const docClient = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: "users",
        };
        var loggedUser = [];
        const { email, password } = req.query;
        console.log("query", email, password)
        docClient.scan(params, function (err, data) {
            console.log("user scan", data);
            if (err) {
                res.send({
                    status: false,
                    message: "Error:Server error",
                });
            }
            else if (!email && !password) {
                res.send({
                    status: false,
                    message: "Please Enter the Login Credentails !!",
                });
            }
            else if (email && !password) {
                res.send({
                    status: false,
                    message: "Please Enter the Password to Login!!",
                });
            }
            else if (password && !email) {
                res.send({
                    status: false,
                    message: "Please Enter the Email to Login!!",
                });
            }
            else {
                console.log(data)
                const validation = data.Items.some(function (element, index) {
                    console.log(element.email, email, typeof (element.password), typeof (password), element.password.toString() === password)
                    if (element.email === email && element.password.toString() === password) {
                        return loggedUser.push(element)
                    }
                    return false;
                })

                console.log("validation", validation === true)
                if (validation === true) {
                    res.send({
                        status: true,
                        message: "LoggedIn Successfully !!",
                        data: loggedUser,
                    });
                } else if (validation === false) {
                    res.send({
                        status: true,
                        message: "Login failed, credentials are incorrect.!!"
                    });
                }
            }
        });
    }

    //   forgotPassword
    async forgotPassword(req, res) {
        if (env === 'development') {
            AWS.config.update(config.aws_local_config);
        }
        else {
            AWS.config.update(config.aws_remote_config);
        }

        const docClient = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: "users",
        };
        var loggedUser = [];
        const { email } = req.query;
        docClient.scan(params, function (err, data) {
            console.log("user scan", data);
            if (err) {
                res.send({
                    status: false,
                    message: "Error:Server error",
                });
            }

            else {
                console.log(data)
                const validation = data.Items.some(function (element, index) {
                    if (element.email === email) {
                        return loggedUser.push(element)
                    }
                    return false;
                })
                console.log(validation)
                var mailOptions = {
                    from: "akhilas_reddy@outlook.com",
                    to: email,
                    subject: "Sending OTP",
                    text:
                        `Use ${generateOTP} to verify your account..`,
                };
                var transporter = nodemailer.createTransport({
                    service: "outlook",
                    // host: "akhilas_reddy@outlook.com",
                    secureConnection: false,
                    auth: {
                        user: "akhilas_reddy@outlook.com",
                        pass: "ucandoit@",
                    },
                });
                console.log("validation", validation)
                if (validation === true) {
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                            res.json({ "Error": { "Response": "Error while sending Mail" } });
                        } else {
                            console.log("Email sent: " + info.response);

                            var GuestName = "hloooooo"
                            var HotelName = "aaaa"
                            var BookingId = 4
                            var webUrl = "http://localhost:3000"
                            var HotelId = 1
                            const MailOptions = {
                                subject: `Feedback`,

                                replacements: {
                                    webUrl,
                                    email,
                                },
                                attachments: [

                                    {
                                        path: path.join(__dirname + "/welcome-img.jpg"),
                                        cid: "o2",
                                        contentDisposition: "inline",
                                    },
                                ],
                                htmlPath: path.join(__dirname + "/Newpassword.html"),
                            };
                            try{
                                const mailRes = sendMailtoUser(MailOptions);
                                mailRes;
                                console.log(mailRes,"mailRes")
                                    res.send({
                                        status: true,
                                        message: "Link sent to your Mail,Please login ",
                                    });
                            }
                            catch(error){
                                res.send({
                                    status: false,
                                    message: "Sorry Failed !!",
                                });  
                            }
                        }
                    });
                } else if (validation === false) {
                    res.send({
                        status: false,
                        message: "Eamil is not Registered!!"
                    });
                }
            }
        });
    }

    // NewPassword

    async newPassword(req, res) {
        if (env === 'development') {
            AWS.config.update(config.aws_local_config);
        }
        else {
            AWS.config.update(config.aws_remote_config);
        }

        const { password } = req.body;
        const docClient = new AWS.DynamoDB.DocumentClient();
        // const params = {
        //     TableName: "Auth",
        //     Item: {
        //         email: email,
        //     },
        // };
        const email = req.query.email;
        console.log(params.Item, "items");
        docClient.update(
            {
                TableName: "users",
                Key: {
                    email: email,
                },

                ExpressionAttributeValues: {
                    ":a": password,

                },
                UpdateExpression:
                    "SET password = :a",
            },

            function (err, data) {
                if (err) {
                    res.send({
                        status: false,
                        message: "Error:Error while fetching data",
                    });

                } else {
                    res.send({
                        status: true,
                        message: "Password Resetted Successfully!",
                    });

                }
            }
        );
    }

}

const AuthMaster = new Auth();

module.exports = AuthMaster;
