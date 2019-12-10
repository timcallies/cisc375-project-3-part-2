var express = require('express');
var cors = require('cors')
var app = express();
const port = 8000;

app.use(cors());
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Now listening on port ${port}.`);
})