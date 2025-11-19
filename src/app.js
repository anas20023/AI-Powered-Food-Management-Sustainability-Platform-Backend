import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes/index.js';
import errorMiddleware from './middleware/error.middleware.js';
import requestLogger from './middleware/requestLogger.js';

const app = express();
app.use(requestLogger)

app.use(cors());
app.use(bodyParser.json());
app.use('/api', router);
app.use('/',(req,res)=>{
    return res.send({
        "message": "Welcome to Server !"
    })
})
app.use(errorMiddleware);

export default app;
