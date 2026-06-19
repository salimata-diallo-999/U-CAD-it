const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const stepRoutes = require('./routes/step.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'ucadit-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/steps', stepRoutes);
app.use('/api', feedbackRoutes);

// Placeholder : sera branché au module IA (voir /ai-module)
app.use('/api/ai', require('./routes/ai.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
