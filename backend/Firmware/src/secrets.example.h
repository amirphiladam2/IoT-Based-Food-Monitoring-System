#pragma once

#include <pgmspace.h>

// Wi-Fi credentials are provisioned at runtime via WiFiManager.
// Copy this file to `secrets.h` and replace the placeholder values below.

#define AWS_IOT_ENDPOINT "your-aws-iot-endpoint.amazonaws.com"

// 1. Amazon Root CA 1
static const char AWS_CERT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
YOUR_AMAZON_ROOT_CA
-----END CERTIFICATE-----
)EOF";

// 2. Device Certificate
static const char AWS_CERT_CRT[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
YOUR_DEVICE_CERTIFICATE
-----END CERTIFICATE-----
)EOF";

// 3. Device Private Key
static const char AWS_CERT_PRIVATE[] PROGMEM = R"EOF(
-----BEGIN RSA PRIVATE KEY-----
YOUR_DEVICE_PRIVATE_KEY
-----END RSA PRIVATE KEY-----
)EOF";
