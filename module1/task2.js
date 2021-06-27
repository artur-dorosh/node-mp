const csv = require('csvtojson');
const fs = require('fs');

const readStream = fs.createReadStream('./csv/addresses.csv');
const writeStream = fs.createWriteStream('./module1/task2.txt');

readStream
    .pipe(csv())
    .on('error', (error) => console.log(error))
    .pipe(writeStream)
    .on('error', (error) => console.log(error));
