const express = require("express");
const {Worker} = require("worker_threads");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const THREAD_COUNT = 40;

function createWorker() {
  return new Promise(function (resolve, reject) {
    const worker = new Worker(path.resolve(__dirname, 'four-worker.js'), {
      workerData: {thread_count: THREAD_COUNT},
    });
    worker.on("message", (data) => {
      resolve(data);
    });
    worker.on("error", (msg) => {
      reject(`An error ocurred: ${msg}`);
    });
  });
}

function calculateCount() {
  return new Promise((resolve, reject) => {
    let counter = 0;
    for (let i = 0; i < 20_000_000_000; i++) {
      counter++;
    }
    resolve(counter);
  });
}

app.get("/non-blocking/", (req, res) => {
  res.status(200).send("This page is non-blocking");
});

app.get("/blocking", async (req, res) => {
  const workerPromises = [];
  for (let i = 0; i < THREAD_COUNT; i++) {
    workerPromises.push(createWorker());
  }
  const thread_results = await Promise.all(workerPromises);
  const total = thread_results.reduce((prev, curr) => prev + curr, 0);
  res.status(200).send(`result is ${total}`);
});


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});