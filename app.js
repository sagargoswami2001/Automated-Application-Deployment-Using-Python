const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hi, My name is Sagar Goswami. An ambitious DevOps Engineer with experience in AWS, Docker, CI/CD, Shell Script, Linux, and Git.');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
