#!/usr/bin/env node

/**
 * Quick Validation Script for Israel Growth Venture
 * Tests critical functionality before deployment
 */

const https = require('https');
const http = require('http');

const SITE_URL = process.env.SITE_URL || 'https://israelgrowthventure.com';
const BACKEND_URL = process.env.BACKEND_URL || 'https://igv-cms-backend.onrender.com';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testUrl(url, name) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      if (res.statusCode === 200) {
        log(`✓ ${name}: ${url}`, 'green');
        resolve(true);
      } else {
        log(`✗ ${name}: ${url} (Status: ${res.statusCode})`, 'red');
        resolve(false);
      }
    }).on('error', (err) => {
      log(`✗ ${name}: ${url} (Error: ${err.message})`, 'red');
      resolve(false);
    });
  });
}

async function runTests() {
  log('\n=== Israel Growth Venture - Quick Validation ===\n', 'blue');
  
  const tests = [
    // Frontend Pages
    { url: `${SITE_URL}/`, name: 'Homepage' },
    { url: `${SITE_URL}/about`, name: 'About Page' },
    { url: `${SITE_URL}/mini-analyse`, name: 'Mini-Analysis Page' },
    { url: `${SITE_URL}/contact`, name: 'Contact Page' },
    { url: `${SITE_URL}/appointment`, name: 'Appointment Page' },
    
    // SEO Files
    { url: `${SITE_URL}/robots.txt`, name: 'robots.txt' },
    { url: `${SITE_URL}/sitemap.xml`, name: 'sitemap.xml' },
    { url: `${SITE_URL}/llms.txt`, name: 'llms.txt' },
    
    // Backend Endpoints
    { url: `${BACKEND_URL}/health`, name: 'Backend Health' },
    { url: `${BACKEND_URL}/`, name: 'Backend Root' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testUrl(test.url, test.name);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  log(`\n=== Test Results ===`, 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (failed === 0) {
    log('\n✓ All tests passed! Site is ready for production.', 'green');
  } else {
    log('\n✗ Some tests failed. Please review before deploying.', 'yellow');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  log(`\nFatal error: ${err.message}`, 'red');
  process.exit(1);
});
