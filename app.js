// Load environment variables
require('dotenv').config();

// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Enable CORS for frontend at localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

// Middleware
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies

// Import and run cron jobs
require('./scripts/cronJobs');

// API version prefix
const API_VERSION = '/api/v1';

// Import routes
const routes = {
  auth: require('./routes/authRoutes'),
  users: require('./routes/userRoutes'),
  subscriptions: require('./routes/subscriptionRoutes'),
  financialAdvice: require('./routes/financialAdviceRoutes'),
  ebooks: require('./routes/ebookRoutes'),
  forexSignals: require('./routes/forexSignalRoutes'),
  fundamentalAnalysis: require('./routes/fundamentalAnalysisRoutes'),
  sentimentAnalysis: require('./routes/sentimentAnalysisRoutes'),
};

// Register routes
app.use(`${API_VERSION}/auth`, routes.auth);
app.use(`${API_VERSION}/users`, routes.users);
app.use(`${API_VERSION}/subscriptions`, routes.subscriptions);
app.use(`${API_VERSION}/financial-advice`, routes.financialAdvice);
app.use(`${API_VERSION}/ebooks`, routes.ebooks);
app.use(`${API_VERSION}/forex-signals`, routes.forexSignals);
app.use(`${API_VERSION}/fundamental-analysis`, routes.fundamentalAnalysis);
app.use(`${API_VERSION}/sentiment-analysis`, routes.sentimentAnalysis);

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start the server and export it
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});

// Export both the app and server
module.exports = { app, server };
