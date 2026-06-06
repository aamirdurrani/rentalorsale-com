<?php
// Add at the top after CORS headers
error_log("Email attempt to: " . ($_POST['email'] ?? $data['email'] ?? 'unknown'));

// Allow CORS from subdomain
header('Access-Control-Allow-Origin: https://project.rentalorsale.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Only POST requests allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$to = $data['email'] ?? '';
$name = $data['name'] ?? '';
$propertyAddress = $data['property_address'] ?? '';
$recommendation = $data['recommendation'] ?? '';
$wealthDifference = $data['wealth_difference'] ?? 0;
$rentWealth = $data['rent_wealth'] ?? 0;
$sellWealth = $data['sell_wealth'] ?? 0;

if (empty($to) || empty($name)) {
    echo json_encode(['error' => 'Email and name are required']);
    exit;
}

$subject = "Your Rent vs Sell Analysis Report - RentalOrSale.com";

$recColor = $recommendation === 'rent' ? '#2563EB' : '#10B981';
$recText = $recommendation === 'rent' ? 'RENT IT OUT' : 'SELL NOW';

$htmlContent = "
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563EB, #7C3AED); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }
        .result { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid $recColor; }
        .recommendation { color: $recColor; font-weight: bold; font-size: 20px; }
        .button { background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; }
        .footer { font-size: 12px; text-align: center; color: #6b7280; margin-top: 20px; }
        .comparison { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: white; border-radius: 8px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🏠 RentalOrSale.com</h1>
            <p>Your Property Analysis Report</p>
        </div>
        <div class='content'>
            <h2>Hello " . htmlspecialchars($name) . ",</h2>
            <p>Thank you for using RentalOrSale.com! Here's your comprehensive rent vs sell analysis.</p>
            
            <div class='result'>
                <h3>📊 Property Details</h3>
                <p><strong>Address:</strong> " . htmlspecialchars($propertyAddress) . "</p>
                <p><strong>Our Recommendation:</strong> 
                    <span class='recommendation'>$recText</span>
                </p>
                <div class='comparison'>
                    <span>🏠 Rent Strategy:</span>
                    <strong>$" . number_format($rentWealth) . "</strong>
                </div>
                <div class='comparison'>
                    <span>💰 Sell Strategy:</span>
                    <strong>$" . number_format($sellWealth) . "</strong>
                </div>
                <div class='comparison'>
                    <span>📈 Additional Wealth:</span>
                    <strong>$" . number_format($wealthDifference) . "</strong>
                </div>
            </div>
            
            <center>
                <a href='https://rentalorsale.com/calculator' class='button'>View Full Analysis →</a>
            </center>
            
            <p>Need personalized advice? Reply to this email and we'll connect you with a local expert.</p>
        </div>
        <div class='footer'>
            <p>© 2026 RentalOrSale.com | Making informed real estate decisions</p>
        </div>
    </div>
</body>
</html>
";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: RentalOrSale.com <noreply@rentalorsale.com>\r\n";
$headers .= "Reply-To: support@rentalorsale.com\r\n";

if (mail($to, $subject, $htmlContent, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} else {
    echo json_encode(['error' => 'Failed to send email']);
}
?>