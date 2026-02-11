<?php
// Router for PHP built-in server to serve the static POS app.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $path;

if ($path !== '/' && is_file($file)) {
    return false; // Let PHP serve existing static files.
}

readfile(__DIR__ . '/index.html');
