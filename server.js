import dotenv from 'dotenv';
import app from './src/app.js';
import  setupSwagger  from './src/config/swagger.js';
dotenv.config();
const PORT = process.env.PORT || 5000;
setupSwagger(app,PORT);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
