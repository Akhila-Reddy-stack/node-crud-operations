'use strict';
var AWS = require('aws-sdk');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const cors = require('cors');
const config = require('../config.js');
var dataList = [];
const port = process.env.PORT || 8000

var env = process.env.NODE_ENV || 'development';
console.log(env, "env")
console.log("process.env.PORT", process.env.PORT)

if (env === 'development') {
  AWS.config.update(config.aws_local_config);
}
else {
  AWS.config.update(config.aws_remote_config);
}

// AWS.config.update(config.aws_remote_config);
app.use(bodyParser.json());
app.use(cors());
const dynamoDB = new AWS.DynamoDB();
const findDBtables = dynamoDB.listTables();

findDBtables
  .promise()
  .then(async getTableNames => {
    const findUserDataTable = getTableNames.TableNames.find(
      tableName => tableName === 'userData'
    );
    if (findUserDataTable) {
      await insertUserDataRecords();
      console.log('Data inserted');
    } else {
      await createUserDataTable().then(async () => {
        await insertUserDataRecords();
        console.log('Table created & Data inserted');
      });
    }
  })
  .catch(error => {
    console.log(error);
  });

const createUserDataTable = () => {
  const tableSchemaParam = {
    TableName: 'userData',
    KeySchema: [
      { AttributeName: 'Itemnumber', KeyType: 'HASH' },
      // { AttributeName: "age", KeyType: "RANGE" },
    ],

    AttributeDefinitions: [
      { AttributeName: 'Itemnumber', AttributeType: 'N' },
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
console.log(itemList, 'itemList');
const insertUserDataRecords = () => {
  const userData = {
    TableName: 'userData',
    Item: {
      Departmentoftheitem: 'Beverages',
      Itemnumber: 123457,
      Description: 'weikfield coffee',
      SecondDescription: 'chocolate coffee',
      Qty: '100g',
      Avgcost: 95,
      Priceyoucharge: 120,
      Pricewithtax: "5%",
      Instock: 30,
      MRP:100
    },
  };
  dataList = userData.Item;
  const docClient = new AWS.DynamoDB.DocumentClient();
  return new Promise((resolve, reject) => {
    docClient.put(userData, (err, data) => {
      // console.log("userData", data);
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(data);
      console.log('userData', userData);
    });
  });
};

class Inventry {
  async getInventryList(req, res) {
    console.log('dattttt');

    if (env === 'development') {
      AWS.config.update(config.aws_local_config);
    }
    else {
      AWS.config.update(config.aws_remote_config);
    }

    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
      TableName: 'userData',
    };
    docClient.scan(params, function (err, data) {
      console.log(data);
      if (err) {
        res.send({
          success: false,
          message: 'Error:Server error',
        });
      } else {
        const { Items } = data;

        res.send({
          status: true,
          message: 'Loaded List',
          data: Items,
        });
      }
    });
  }

  async addInventryData(req, res) {
    if (env === 'development') {
      AWS.config.update(config.aws_local_config);
    }
    else {
      AWS.config.update(config.aws_remote_config);
    }

    const {
      Departmentoftheitem,
      Itemnumber,
      Description,
      SecondDescription,
      Qty,
      Avgcost,
      Priceyoucharge,
      Pricewithtax,
      Instock,
      MRP
    } = req.body;
    // Generate random string ID
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
      TableName: "userData",
      Item: {
        Departmentoftheitem: Departmentoftheitem,
        Itemnumber: Itemnumber,
        Description: Description,
        SecondDescription: SecondDescription,
        Qty: Qty,
        Avgcost: Avgcost,
        Priceyoucharge: Priceyoucharge,
        Pricewithtax: Pricewithtax,
        Instock: Instock,
        MRP:MRP
      },
    };
    console.log(params.Item, "items");
    const data = params.Item;
    docClient.put(params, function (err, data) {
      console.log("data", data);
      if (err) {
        res.send({
          success: false,
          message: "Error:Server error",
        });
      } else {
        console.log("data", data);
        const { Items } = data;
        res.send({
          status: true,
          message: "Added Successfully!!",
        });
      }
    });
  }

  // Update By Id

  async updateInventryData(req, res) {
    if (env === 'development') {
      AWS.config.update(config.aws_local_config);
    }
    else {
      AWS.config.update(config.aws_remote_config);
    }

    const docClient = new AWS.DynamoDB.DocumentClient();

    const {
      Departmentoftheitem,
      Description,
      SecondDescription,
      Qty,
      Avgcost,
      Priceyoucharge,
      Pricewithtax,
      Instock,
      MRP
    } = req.body;
    const Itemnumber = Number(req.query.Itemnumber);
    docClient.update(
      {
        TableName: "userData",
        Key: {
          Itemnumber: Itemnumber,
        },

        ExpressionAttributeValues: {
          ":a": Departmentoftheitem,
          ":b": Description,
          ":c": SecondDescription,
          ":d": Qty,
          ":e": Avgcost,
          ":f": Priceyoucharge,
          ":g": Pricewithtax,
          ":h": Instock,
          ":i":MRP


        },
        UpdateExpression:
          "SET Departmentoftheitem = :a,Description = :b,SecondDescription = :c,Qty = :d,Avgcost = :e,Priceyoucharge = :f,Pricewithtax = :g,Instock = :h,MRP= :i",
      },
      function (err, data) {
        if (err) {
          console.log("Unable to update item", JSON.stringify(err, null, 2));
          res.send({
            status: false,
            message: "Error:Server error",
          });

        } else {
          res.send({
            status: true,
            message: "Updated Successfully!!",
            clients: data,
          });

        }
      }
    );

  }


  //Delete

  async deleteInventryData(req, res) {
    if (env === 'development') {
      AWS.config.update(config.aws_local_config);
    }
    else {
      AWS.config.update(config.aws_remote_config);
    }
    // Generate random string ID
    const Itemnumber = Number(req.query.Itemnumber);

    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
      TableName: "userData",
      Key: {
        Itemnumber: Itemnumber,

      },
    };

    console.log("deleting item", params.Key);
    docClient.delete(params, function (err, data) {
      console.log(err, data);
      if (err) {
        console.log("Unable to delete item", JSON.stringify(err, null, 2));
        res.send({
          status: false,
          message: "Error:Server error",
        });
      } else {
        console.log("deleted");
        const { Items } = data;
        res.send({
          status: true,
          message: "Deleted Successfully!!",
        });
      }
    });
  }



}

const InventryMaster = new Inventry();

module.exports = InventryMaster;
