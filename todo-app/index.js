const app = require('./app');
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log("started express server at port 10000")
})
