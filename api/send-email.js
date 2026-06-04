// api/send-email.js
// This runs on Hostinger's Node.js environment

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
    
    // SMTP Configuration from Hostinger environment variables
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE === 'true' || true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    
    const recommendationText = recommendation === 'rent' ? 'RENT IT OUT' : 'SELL NOW';
    const recommendationColor = recommendation === 'rent' ? '#2563EB' : '#10B981';
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2563EB, #7C3AED); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }
                .result { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${recommendationColor}; }
                .recommendation { color: ${recommendationColor}; font-weight: bold; font-size: 20px; }
                .button { background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 15px 0; }
                .footer { font-size: 12px; text-align: center; color: #6b7280; margin-top: 20px; }
                .comparison { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: white; border-radius: 8px; }
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
                            <span class="recommendation">${recommendationText}</span>
                        </p>
                        <div class="comparison">
                            <span>🏠 Rent Strategy:</span>
                            <strong>$${Math.round(rentWealth || 0).toLocaleString()}</strong>
                        </div>
                        <div class="comparison">
                            <span>💰 Sell Strategy:</span>
                            <strong>$${Math.round(sellWealth || 0).toLocaleString()}</strong>
                        </div>
                        <div class="comparison">
                            <span>📈 Difference:</span>
                            <strong>$${Math.round(wealthDifference || 0).toLocaleString()}</strong>
                        </div>
                    </div>
                    
                    <center>
                        <a href="https://rentalorsale.com" class="button">View Full Analysis →</a>
                    </center>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Review your full analysis on our website</li>
                        <li>Consult with a local real estate agent</li>
                        <li>Consider your personal financial goals</li>
                    </ul>
                    
                    <p>Need personalized advice? Reply to this email and we'll connect you with a local expert.</p>
                </div>
                <div class="footer">
                    <p>© 2026 RentalOrSale.com | Making informed real estate decisions</p>
                    <p>You received this email because you requested a property analysis on our website.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    try {
        await transporter.sendMail({
            from: `"RentalOrSale.com" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your Rent vs Sell Analysis Report',
            html: html
        });
        
        return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
}