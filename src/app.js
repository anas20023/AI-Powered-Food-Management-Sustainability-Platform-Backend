import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes/index.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
import requestLogger from './middlewares/requestLogger.js';
import specs from './config/swagger.js';
import swaggerUi from 'swagger-ui-express'

const app = express();
app.use(requestLogger)

app.use(cors());
app.use(bodyParser.json());
app.use('/api', router);
// serve swagger-ui at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// expose raw openapi JSON (useful to import into Postman)
app.get("/openapi.json", (req, res) => res.json(specs));
app.use('/',(req,res)=>{
    return res.send({
        "message": "Welcome to Server !"
    })
})

app.use(errorMiddleware);

export default app;
