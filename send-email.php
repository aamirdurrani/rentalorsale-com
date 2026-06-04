<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$data = json_decode(file_get_contents('php://input'), true);
$to = $data['email'] ?? '';

if (empty($to)) {
    echo json_encode(['error' => 'No email provided']);
    exit;
}

$subject = "Test Email from RentalOrSale.com";
$message = "This is a test email to verify PHP mail is working.";
$headers = "From: noreply@rentalorsale.com\r\n";

if (mail($to, $subject, $message, $headers)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => 'Mail function failed']);
}
?>