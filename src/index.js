const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const route = require('./routes/route');
const app = express();

app.use(express.json());
app.use(cookieParser());

mongoose.connect("mongodb+srv://shailesh123:rYbeOdoWZtY9NdKU@cluster0.e1ege.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});