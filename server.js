import express from 'express';
import sendEmailHandler from './api/send-email.js';

const app = express();
app.use(express.json());
app.post('/api/send-email', sendEmailHandler);
app.listen(process.env.PORT || 3000);