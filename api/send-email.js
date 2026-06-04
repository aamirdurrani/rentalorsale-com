// api/send-email.js
// This runs as a serverless function on Hostinger

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { email, name, propertyAddress, recommendation, wealthDifference, rentWealth, sellWealth } = req.body;
    
    if (!email || !name) {
        return res.status(400).json({ error: 'Email and name are required' });
    }
    
    // Configure SMTP (using your Hostinger email)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER || 'noreply@rentalorsale.com',
            pass: process.env.SMTP_PASS
        }
    });
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2563EB, #7C3AED); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }
                .result { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${recommendation === 'rent' ? '#2563EB' : '#10B981'}; }
                .recommendation { color: ${recommendation === 'rent' ? '#2563EB' : '#10B981'}; font-weight: bold; font-size: 20px; }
                .button { background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; }
                .footer { font-size: 12px; text-align: center; color: #6b7280; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏠 RentalOrSale.com</h1>
                    <p>Your Property Analysis Report</p>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    <p>Thank you for using RentalOrSale.com! Here's your comprehensive rent vs sell analysis.</p>
                    
                    <div class="result">
                        <h3>📊 Property Details</h3>
                        <p><strong>Address:</strong> ${propertyAddress || 'Not provided'}</p>
                        <p><strong>Our Recommendation:</strong> 
                            <span class="recommendation">${recommendation === 'rent' ? 'RENT IT OUT' : 'SELL NOW'}</span>
                        </p>
                        <p><strong>🏠 Rent Strategy:</strong> $${Math.round(rentWealth || 0).toLocaleString()}</p>
                        <p><strong>💰 Sell Strategy:</strong> $${Math.round(sellWealth || 0).toLocaleString()}</p>
                        <p><strong>📈 Additional Wealth:</strong> $${Math.round(wealthDifference || 0).toLocaleString()}</p>
                    </div>
                    
                    <center>
                        <a href="https://rentalorsale.com" class="button">View Full Analysis →</a>
                    </center>
                    
                    <p>Need personalized advice? Reply to this email and we'll connect you with a local expert.</p>
                </div>
                <div class="footer">
                    <p>© 2026 RentalOrSale.com | Making informed real estate decisions</p>
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
        return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
}