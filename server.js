// server.js
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from './db.js';  // Import Supabase connection

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('dist'));

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
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
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
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .header { background: linear-gradient(135deg, #2563EB, #7C3AED); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .recommendation { color: ${recommendation === 'rent' ? '#2563EB' : '#10B981'}; font-weight: bold; }
            </style>
        </head>
        <body>
            <div style="max-width: 600px; margin: 0 auto;">
                <div class="header">
                    <h1>🏠 RentalOrSale.com</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    <p>Thank you for using RentalOrSale.com!</p>
                    <p><strong>Property:</strong> ${propertyAddress}</p>
                    <p><strong>Recommendation:</strong> <span class="recommendation">${recommendation === 'rent' ? 'RENT IT OUT' : 'SELL NOW'}</span></p>
                    <p><strong>Additional Wealth:</strong> $${Math.round(wealthDifference || 0).toLocaleString()}</p>
                    <a href="https://rentalorsale.com" style="background:#2563EB;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">View Full Analysis →</a>
                </div>
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
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Serve React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});