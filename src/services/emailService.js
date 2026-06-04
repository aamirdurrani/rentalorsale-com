// src/services/emailService.js
import nodemailer from 'nodemailer';

// Email senders configuration
const SENDERS = {
    noreply: '"RentalOrSale.com" <noreply@rentalorsale.com>',
    support: '"RentalOrSale Support" <support@rentalorsale.com>',
    admin: '"RentalOrSale Admin" <admin@rentalorsale.com>'
};

let transporter = null;

function initEmailTransporter() {
    if (typeof window !== 'undefined') {
        console.log('⚠️ Email service running in browser - will log only');
        transporter = null;
        return;
    }
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 465,
            secure: process.env.SMTP_SECURE === 'true' || true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('✅ Email transporter initialized');
    } else {
        console.log('⚠️ Email not configured. Emails will be logged to console.');
        transporter = null;
    }
}

function safe(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

async function sendEmail(to, subject, htmlContent, fromType = 'noreply', textContent = null) {
    const text = textContent || htmlContent.replace(/<[^>]*>/g, '');
    
    if (typeof window !== 'undefined') {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 TO: ${to}`);
        console.log(`📧 SUBJECT: ${subject}`);
        console.log(`📧 CONTENT: ${text.substring(0, 200)}...`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return { success: true, logged: true };
    }
    
    if (!transporter) {
        initEmailTransporter();
    }
    
    if (!transporter) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 TO: ${to}`);
        console.log(`📧 SUBJECT: ${subject}`);
        console.log(`📧 CONTENT: ${text.substring(0, 200)}...`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return { success: true, logged: true };
    }
    
    try {
        const info = await transporter.sendMail({
            from: SENDERS[fromType] || SENDERS.noreply,
            to: to,
            subject: subject,
            text: text,
            html: htmlContent
        });
        
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email failed to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
}

function getRentVsSellEmail(userName, propertyAddress, recommendation, wealthDifference, rentWealth, sellWealth) {
    const recColor = recommendation === 'rent' ? '#2563EB' : '#10B981';
    const recText = recommendation === 'rent' ? 'RENT IT OUT' : 'SELL NOW';
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2563EB, #7C3AED); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }
                .result { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${recColor}; }
                .recommendation { color: ${recColor}; font-weight: bold; font-size: 20px; }
                .button { background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; }
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
                    <h2>Hello ${safe(userName)},</h2>
                    <p>Thank you for using RentalOrSale.com! Here's your comprehensive rent vs sell analysis.</p>
                    
                    <div class="result">
                        <h3>📊 Property Details</h3>
                        <p><strong>Address:</strong> ${safe(propertyAddress)}</p>
                        <p><strong>Our Recommendation:</strong> 
                            <span class="recommendation">${recText}</span>
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
                            <span>📈 Additional Wealth:</span>
                            <strong>$${Math.round(wealthDifference || 0).toLocaleString()}</strong>
                        </div>
                    </div>
                    
                    <center>
                        <a href="https://rentalorsale.com" class="button">View Full Analysis →</a>
                    </center>
                    
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
}

initEmailTransporter();

export {
    sendEmail,
    getRentVsSellEmail
};