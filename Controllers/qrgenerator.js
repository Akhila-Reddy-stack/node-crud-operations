
// const errorHandle = require("../services/errorHandler");
// const commonMsgs = require("../CommonMsg.json");
// const { poolPromise, sql } = require("../db");
const QRCode = require('qrcode');
const Excel = require('xlsx');

const ws = Excel.readFile("Sampledata.xlsx").Sheets["Sheet1"];
var data = Excel.utils.sheet_to_json(ws);
// console.log(data)
var qrdata ;
// qrdata = data;

// module.exports =  qrdata ;

const myFunc = async () => {
  return new Promise((res, rej) => {
      data.map(ele => {
          QRCode.toFile(
              ele.Description + ".png",
              JSON.stringify(ele.Itemnumber),
              () => {
                  res(true);
              }
          )
      })

  });
}


(async () => {
  await myFunc()
})()


class QrGenerator {

    async getQRData(req, res) {
      console.log(data,"dattttt")
      res.send({ data: data });
      }

      async getQRlistbyItemNumberData(req, res) {
        console.log("req", req.body.ItemNumber, req.query.ItemNumber);
      var ItemNumber = Number(req.query.ItemNumber);
      console.log(ItemNumber);
      var singleData = data;
      var outputData = [];
      singleData.forEach((item) => {
        console.log(ItemNumber, item.Itemnumber);
        if (ItemNumber === item.Itemnumber) {
          outputData.push(item);
        }
      });
      res.json({ data: outputData, status: true });
        }
   
}

const QRMaster = new QrGenerator();

module.exports = QRMaster;

