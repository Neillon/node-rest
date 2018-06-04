const express = require("express");
const bodyParser = require('body-parser')

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

require('./controller/authController')(app)
require('./controller/projectController')(app)

app.listen(3000);