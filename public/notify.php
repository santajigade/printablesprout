<?php
// Parent Premium "Notify Me" list. Stores only a parent email and the date.
// The list file sits OUTSIDE public_html, so it can never be downloaded from the site.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function done($ok, $msg, $code = 200) {
  http_response_code($code);
  echo json_encode(['ok' => $ok, 'message' => $msg]);
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') done(false, 'Method not allowed.', 405);

// Honeypot: real people never fill this hidden field
if (!empty($_POST['website'])) done(true, 'Thanks! We will email you when Parent Premium opens.');

$email = trim((string)($_POST['email'] ?? ''));
$adult = ($_POST['adult'] ?? '') === 'yes';
if (!$adult) done(false, 'Please confirm you are a parent, guardian or teacher aged 18 or over.', 400);
if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) done(false, 'Please enter a valid email address.', 400);

$dir = dirname(__DIR__) . '/printablesprout-data';
if (!is_dir($dir)) @mkdir($dir, 0700, true);
$file = $dir . '/premium-notify.csv';

$known = is_file($file) ? file($file, FILE_IGNORE_NEW_LINES) : [];
$lower = strtolower($email);
foreach ($known as $line) {
  if (strtolower(explode(',', $line)[0]) === $lower) done(true, 'You are already on the list. Thank you!');
}

$saved = @file_put_contents($file, $lower . ',' . gmdate('c') . "\n", FILE_APPEND | LOCK_EX);
@mail('contact@printablesprout.com', 'Parent Premium: new notify sign-up', "New sign-up: $lower\n", 'From: PrintableSprout <contact@printablesprout.com>');

if ($saved === false) done(false, 'Sorry, something went wrong. Please try again later.', 500);
done(true, 'Thanks! We will email you once when Parent Premium opens.');
