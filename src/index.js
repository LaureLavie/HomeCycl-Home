import express from 'express';
import dotenv from 'dotenv';
import authRoute from './routes/authRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use('/api/auth',authRoute);

app.get('/get',(req,res)=>{
    res.send('API HomeCyclHome fonctionnelle');
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});