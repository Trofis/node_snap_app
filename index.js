const express = require('express')
const cors = require('cors'); 
const app = express()
const fs = require('fs');

const getActualRequestDurationInMilliseconds = start => {
  const NS_PER_SEC = 1e9; //  convert to nanoseconds
  const NS_TO_MS = 1e6; // convert to milliseconds
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};


let logger = (req, res, next) => { //middleware function
  let current_datetime = new Date();
  let formatted_date =
    current_datetime.getFullYear() +
    "-" +
    (current_datetime.getMonth() + 1) +
    "-" +
    current_datetime.getDate() +
    " " +
    current_datetime.getHours() +
    ":" +
    current_datetime.getMinutes() +
    ":" +
    current_datetime.getSeconds();
  let method = req.method;
  let url = req.url;
  let status = res.statusCode;
  const start = process.hrtime();
  const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
  let log = `[${formatted_date}] ${method}:${url} ${status} ${durationInMilliseconds.toLocaleString()} ms`;
  console.log(log);
  fs.appendFile("request_logs.txt", log + "\n", err => {
    if (err) {
      console.log(err);
    }
  });
  next();
};

function readData() {
  let data = fs.readFileSync('data.json');
  return JSON.parse(data);
}


app.use(logger)
app.use(cors());

app.get('/facesnaps', function (req, res) {
  let snaps = readData();
  res.send(snaps["facesnaps"])
})

app.get('/facesnaps/:id', function (req, res) {
  let snaps = readData();
  const { id } = req.params;
  
  snaps["facesnaps"].filter((e) => e.id === id)
  res.send(snaps["facesnaps"][0])
})

app.post('/facesnaps', function ( req, res) {
  new Promise((resolve, reject) => {
    try {
      let snaps = readData();
      let new_snap = JSON.stringify(req.body);

      snaps["facesnaps"].push(new_snap);

      fs.writeFile('data.json', snaps);
      resolve("Data injected")
    } catch (error) {
      reject(`Error : ${err}`)
    }
  }).then((mess) => {
    res.status(200).send(mess)
  }).catch((err) => {
    res.status(500).send(err);
  });
})


app.put('/facesnaps/:id', function (req, res) {
  new Promise((resolve, reject) => {
    try {
      let snaps = readData();
      let new_snap = JSON.stringify(req.body);
      const { id } = req.params;

      const index_snap = snaps["facesnaps"].find(elem => elem.id === id);
      snaps["facesnaps"][index_snap] = new_snap;
      fs.writeFile('data.json', snaps);
      resolve(new_snap);
    } catch (error) {
      reject(`Error : ${err}`);
    }
  }).then((result) => {
    res.status(200).send(result);
  }).catch((err) => {
    res.status(500).send(err);
  })
})

app.listen(3000)