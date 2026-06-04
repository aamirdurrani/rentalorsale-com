// server.js - Place this in your project root
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('dist'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Email endpoint
app.post('/api/send-email', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    const { email, name, propertyAddress, recommendation, wealthDifference, rentWealth, sellWealth } = req.body;
    
    if (!email || !name) {
        return res.status(400).json({ error: 'Email and name are required' });
    }
    
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('📧 Email would be sent to:', email);
        console.log('📧 Name:', name);
        console.log('📧 Property:', propertyAddress);
        return res.status(200).json({ success: true, message: 'Email logged (SMTP not configured)' });
    }
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><style>body{font-family:Arial,sans-serif;}</style></head>
        <body>
            <div style="max-width:600px;margin:0 auto;padding:20px;">
                <h1 style="color:#2563EB;">🏠 RentalOrSale.com</h1>
                <h2>Hello ${name},</h2>
                <p>Thank you for using RentalOrSale.com!</p>
                <p><strong>Property:</strong> ${propertyAddress}</p>
                <p><strong>Recommendation:</strong> ${recommendation === 'rent' ? 'RENT IT OUT' : 'SELL NOW'}</p>
                <p><strong>Additional Wealth:</strong> $${Math.round(wealthDifference || 0).toLocaleString()}</p>
                <a href="https://rentalorsale.com" style="background:#2563EB;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">View Full Analysis →</a>
            </div>
        </body>
        </html>
    `;
    
    try {
        await transporter.sendMail({
            from: '"RentalOrSale.com" <noreply@rentalorsale.com>',
            to: email,
            subject: 'Your Rent vs Sell Analysis Report',
            html: htmlContent
        });
        
        console.log(`✅ Email sent to ${email}`);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});