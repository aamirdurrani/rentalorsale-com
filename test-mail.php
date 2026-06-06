<?php
$to = "aamir@aamirsaba.com";
$subject = "Test Email";
$message = "This is a test";
$headers = "From: noreply@rentalorsale.com";

if(mail($to, $subject, $message, $headers)) {
    echo "Mail sent!";
} else {
    echo "Mail failed!";
}
?>