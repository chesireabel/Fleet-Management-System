import express from 'express';
import cors from 'cors';

const app = express();

const PORT =  3000;

//MIDDLEWARE
app.use(express.json());
app.use(cors());

//ROUTES
app.get('/',(req,res) => {
    res.json('Lets get started!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});