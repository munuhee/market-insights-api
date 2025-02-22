// Load environment variables
require('dotenv').config();

// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(cookieParser()); // for parsing cookies

// Import and run the cron job
require('./scripts/cronJobs');

// API version prefix
const API_VERSION = '/api/v1';

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const financialAdviceRoutes = require('./routes/financialAdviceRoutes');
const ebookRoutes = require('./routes/ebookRoutes');
const forexSignalRoutes = require('./routes/forexSignalRoutes');
const fundamentalAnalysisRoutes = require('./routes/fundamentalAnalysisRoutes');
const sentimentAnalysisRoutes = require('./routes/sentimentAnalysisRoutes');

// Routes
app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/users`, userRoutes);
app.use(`${API_VERSION}/subscriptions`, subscriptionRoutes);
app.use(`${API_VERSION}/financial-advice`, financialAdviceRoutes);
app.use(`${API_VERSION}/ebooks`, ebookRoutes);
app.use(`${API_VERSION}/forex-signals`, forexSignalRoutes);
app.use(`${API_VERSION}/fundamental-analysis`, fundamentalAnalysisRoutes);
app.use(`${API_VERSION}/sentiment-analysis`, sentimentAnalysisRoutes);

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
