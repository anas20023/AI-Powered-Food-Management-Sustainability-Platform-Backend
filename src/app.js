import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes/index.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
import requestLogger from './middlewares/requestLogger.js';
import cookieParser from 'cookie-parser';
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();

app.use(requestLogger);
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini route
app.post("/api/gemini/generate", async (req, res) => {
    try {
        const { prompt, model = "gemini-2.5-flash" } = req.body;

        if (!prompt) return res.status(400).json({ error: "prompt is required" });

        const geminiModel = genAI.getGenerativeModel({ model });

        const result = await geminiModel.generateContent(prompt);

        res.json({
            ok: true,
            text: result.response.text(),
        });

    } catch (err) {
        console.error("Gemini error:", err);
        res.status(500).json({ error: "generation_failed", details: err?.message || err });
    }
});

app.use('/api', router);

app.use('/', (req, res) => {
    res.send({ message: "Welcome to Server !" });
});

app.use(errorMiddleware);

export default app;
