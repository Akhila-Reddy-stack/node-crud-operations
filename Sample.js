// "use strict";

// // import AWS from "aws-sdk";
// var AWS = require("aws-sdk");
// var express = require("express");
// var bodyParser = require("body-parser");
// var app = express();
// const cors = require("cors");
// var dataList = [];
// AWS.config.update({
//   region: "us-west-2",
//   endpoint: "http://localhost:8000",
// });
// // app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());
// app.use(cors());
// const dynamoDB = new AWS.DynamoDB();

// const findDBtables = dynamoDB.listTables();
// // console.log("findDB", findDBtables);

// findDBtables
//   .promise()
//   .then(async (getTableNames) => {
//     const findUserDataTable = getTableNames.TableNames.find(
//       (tableName) => tableName === "userData"
//     );
//     if (findUserDataTable) {
//       await insertUserDataRecords();
//       console.log("Data inserted");
//     } else {
//       await createUserDataTable().then(async () => {
//         await insertUserDataRecords();
//         console.log("Table created & Data inserted");
//       });
//     }
//   })
//   .catch((error) => {
//     console.log(error);
//   });

// const createUserDataTable = () => {
//   const tableSchemaParam = {
//     TableName: "userData",
//     KeySchema: [
//       { AttributeName: "Itemnumber", KeyType: "HASH" },
//       // { AttributeName: "age", KeyType: "RANGE" },
//     ],

//     AttributeDefinitions: [
//       { AttributeName: "Itemnumber", AttributeType: "N" },
//       // { AttributeName: "age", AttributeType: "N" },
//     ],

//     ProvisionedThroughput: {
//       ReadCapacityUnits: 10,
//       WriteCapacityUnits: 1,
//     },
//   };
//   return new Promise((resolve, reject) => {
//     dynamoDB.createTable(tableSchemaParam, (err, data) => {
//       if (err) {
//         console.log(err);
//         reject(err);
//       }
//       resolve(data);
//     });
//   });
// };

// var itemList = [];
// console.log(itemList, "itemList");
// const insertUserDataRecords = () => {
//   const userData = {
//     TableName: "userData",
//     Item: {
//       Departmentoftheitem: "Beverages",
//       Itemnumber: 123457,
//       Description: "weikfield coffee",
//       SecondDescription: "chocolate coffee",
//       Qty: "100g",
//       Avgcost: 95,
//       Priceyoucharge: 102,
//       Pricewithtax: 110,
//       Instock: 30,
//     },
//   };
//   dataList = userData.Item;
//   const docClient = new AWS.DynamoDB.DocumentClient();
//   return new Promise((resolve, reject) => {
//     docClient.put(userData, (err, data) => {
//       // console.log("userData", data);
//       if (err) {
//         console.log(err);
//         reject(err);
//       }
//       resolve(data);
//       console.log("userData", userData);
//     });
//   });
// };


// app.get("/inventryList", (req, res, next) => {

//   AWS.config.update({
//     region: "us-west-2",
//     endpoint: "http://localhost:8000",
//   });
//   const docClient = new AWS.DynamoDB.DocumentClient();
//   const params = {
//     TableName: "userData",
//   };
//   docClient.scan(params, function (err, data) {
//     console.log(data);
//     if (err) {
//       res.send({
//         success: false,
//         message: "Error:Server error",
//       });
//     } else {
//       const { Items } = data;

//       res.send({
//         status: true,
//         message: "Loaded List",
//         data: Items,
//       });
//     }
//   });
// });

// app.post("/inventryList", (req, res, next) => {
 
//   AWS.config.update({
//     region: "us-west-2",
//     endpoint: "http://localhost:8000",
//   });
//   const {
//     Departmentoftheitem,
//     Itemnumber,
//     Description,
//     SecondDescription,
//     Qty,
//     Avgcost,
//     Priceyoucharge,
//     Pricewithtax,
//     Instock,
//   } = req.body;
//   // Generate random string ID
//   const docClient = new AWS.DynamoDB.DocumentClient();
//   const params = {
//     TableName: "userData",
//     Item: {
//       Departmentoftheitem: Departmentoftheitem,
//       Itemnumber: Itemnumber,
//       Description: Description,
//       SecondDescription: SecondDescription,
//       Qty: Qty,
//       Avgcost: Avgcost,
//       Priceyoucharge: Priceyoucharge,
//       Pricewithtax: Pricewithtax,
//       Instock: Instock,
//     },
//   };
//   console.log(params.Item, "items");
//   const data = params.Item;
//   docClient.put(params, function (err, data) {
//     console.log("data", data);
//     if (err) {
//       res.send({
//         success: false,
//         message: "Error:Server error",
//       });
//     } else {
//       console.log("data", data);
//       const { Items } = data;
//       res.send({
//         status: true,
//         message: "Added Successfully!!",
//       });
//     }
//   });
// });
// // Update By Id


// app.put("/inventryList", (req, res, next) => {

//   AWS.config.update({
//     region: "us-west-2",
//     endpoint: "http://localhost:8000",
//   });

//   const docClient = new AWS.DynamoDB.DocumentClient();

//   const {
//     Departmentoftheitem,
//     Description,
//     SecondDescription,
//     Qty,
//     Avgcost,
//     Priceyoucharge,
//     Pricewithtax,
//     Instock,
//   } = req.body;
//   const Itemnumber = Number(req.query.Itemnumber);
//   docClient.update(
//     {
//       TableName: "userData",
//       Key: {
//         Itemnumber: Itemnumber,
//       },

//       ExpressionAttributeValues: {
//         ":a": Departmentoftheitem,
//         ":b": Description,
//         ":c": SecondDescription,
//         ":d": Qty,
//         ":e": Avgcost,
//         ":f": Priceyoucharge,
//         ":g": Pricewithtax,
//         ":h": Instock,

     
//       },
//       UpdateExpression:
//         "SET Departmentoftheitem = :a,Description = :b,SecondDescription = :c,Qty = :d,Avgcost = :e,Priceyoucharge = :f,Pricewithtax = :g,Instock = :h",
//     },
//     function (err, data) {
//       if (err) {
//         console.log("Unable to update item", JSON.stringify(err, null, 2));
//         res.send({
//           status: true,
//           message: "Error:Server error",
//         });
  
//       } else {
//         res.send({
//           status: true,
//           message: "Updated Successfully!!",
//           clients: data,
//         });
     
//       }
//     }
//   );

 
// });

//  //Delete

// app.delete("/inventryList", (req, res, next) => {

//   AWS.config.update({
//     region: "us-west-2",
//     endpoint: "http://localhost:8000",
//   });

//   // Generate random string ID
//   const Itemnumber = Number(req.query.Itemnumber);

//   const docClient = new AWS.DynamoDB.DocumentClient();
//   const params = {
//     TableName: "userData",
//     Key: {
//       Itemnumber: Itemnumber,
  
//     },
//   };

//   console.log("deleting item", params.Key);
//   docClient.delete(params, function (err, data) {
//     console.log(err, data);
//     if (err) {
//       console.log("Unable to delete item", JSON.stringify(err, null, 2));
//       res.send({
//         status: false,
//         message: "Error:Server error",
//       });
//     } else {
//       console.log("deleted");
//       const { Items } = data;
//       res.send({
//         status: true,
//         message: "Deleted Successfully!!",
//       });
//     }
//   });
// });


// app.listen(5001, () => console.log("API listening on port 5001!"));
// // https://medium.com/@maeluenie/crud-functions-with-node-js-and-aws-dynamodb-56a8c861395d