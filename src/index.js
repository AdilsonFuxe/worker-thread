const express = require("express");
const { Worker } = require("worker_threads");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

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
  const worker = new Worker(path.resolve(__dirname, 'worker.js'));
  worker.on('message', data => {
    res.status(200).send(`result is ${data}`);
  })
  worker.on('error', msg => {
    res.status(404).send(`An error occurred: ${msg}`);
  })
});


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});