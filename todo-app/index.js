const app = require('./app');
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log("started express server at port 5050")
})
