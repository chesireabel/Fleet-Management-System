import express from 'express';

const app = express();

const PORT =  3000;

//MIDDLEWARE
app.use(express.json());

//ROUTES
app.get('/',(req,res) => {
    res.send('Lets get started!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});