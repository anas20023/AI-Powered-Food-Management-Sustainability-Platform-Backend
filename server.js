import dotenv from 'dotenv';
import app from './src/app.js';
import { setupSwagger } from './src/Documentation/swagger.js';
dotenv.config();
setupSwagger(app);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
