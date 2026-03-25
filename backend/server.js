import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(helmet()); 

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true, 
    legacyHeaders: false,
    message: "Te veel verzoeken van dit IP, probeer het later opnieuw."
});
app.use("/api", limiter);

app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



