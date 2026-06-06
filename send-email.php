<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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

$htmlContent = "
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563EB, #7C3AED); color: white; padding: 20px; text-align: center; }
        .button { background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🏠 RentalOrSale.com</h1>
        </div>
        <h2>Hello " . htmlspecialchars($name) . ",</h2>
        <p>Thank you for using RentalOrSale.com!</p>
        <p><strong>Property:</strong> " . htmlspecialchars($propertyAddress) . "</p>
        <p><strong>Recommendation:</strong> " . ($recommendation === 'rent' ? 'RENT IT OUT' : 'SELL NOW') . "</p>
        <p><strong>Additional Wealth:</strong> $" . number_format($wealthDifference) . "</p>
        <a href='https://project.rentalorsale.com' class='button'>View Full Analysis →</a>
        <hr>
        <p style='font-size: 12px;'>© 2026 RentalOrSale.com</p>
    </div>
</body>
</html>
";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: RentalOrSale.com <noreply@rentalorsale.com>\r\n";

if (mail($to, $subject, $htmlContent, $headers)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => 'Mail function failed']);
}
?>