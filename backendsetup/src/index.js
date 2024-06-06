import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send("hello");
})

app.listen(port, () => {
    console.log(`server listeing on ${port}`);
})