#!/usr/bin/env node

/**
 * Email Service Test Script
 * Run this to verify your email configuration is working
 * 
 * Usage: node test-email-service.js
 */

import dotenv from 'dotenv'
import { sendVerificationEmail, sendPasswordResetEmail } from './src/services/emailService.js'

dotenv.config()

const TEST_EMAIL = process.env.TEST_EMAIL || process.env.EMAIL_USER

console.log('🧪 Testing Email Service Configuration...\n')

// Check environment variables
console.log('📋 Configuration Check:')
console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || '❌ NOT SET'}`)
console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT || '❌ NOT SET'}`)
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ SET' : '❌ NOT SET'}`)
console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET'}`)
console.log(`   Test Email: ${TEST_EMAIL}\n`)

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ ERROR: EMAIL_USER and EMAIL_PASSWORD must be set in .env file')
  console.log('\n💡 See EMAIL_SETUP.md for configuration instructions')
  process.exit(1)
}

async function runTests() {
  try {
    // Test 1: Verification Email
    console.log('📧 Test 1: Sending Verification Email...')
    const otp1 = '123456'
    await sendVerificationEmail(TEST_EMAIL, 'Test User', otp1)
    console.log('✅ Verification email sent successfully!')
    console.log(`   OTP Code: ${otp1}`)
    console.log(`   Check inbox: ${TEST_EMAIL}\n`)

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Test 2: Password Reset Email
    console.log('📧 Test 2: Sending Password Reset Email...')
    const otp2 = '654321'
    await sendPasswordResetEmail(TEST_EMAIL, 'Test User', otp2)
    console.log('✅ Password reset email sent successfully!')
    console.log(`   OTP Code: ${otp2}`)
    console.log(`   Check inbox: ${TEST_EMAIL}\n`)

    console.log('🎉 All tests passed!')
    console.log('\n📬 Check your email inbox (and spam folder) for:')
    console.log('   1. Email verification code: 123456')
    console.log('   2. Password reset code: 654321')
    console.log('\n✨ Your email service is configured correctly!')
    
  } catch (error) {
    console.error('\n❌ Email Test Failed:')
    console.error(`   Error: ${error.message}`)
    console.log('\n🔧 Troubleshooting:')
    console.log('   1. Check EMAIL_USER and EMAIL_PASSWORD in .env')
    console.log('   2. For Gmail, ensure you\'re using an App Password')
    console.log('   3. Verify 2FA is enabled on your Google account')
    console.log('   4. Check EMAIL_SETUP.md for detailed instructions')
    console.log('\n💡 Common issues:')
    console.log('   - "Invalid login" → Wrong password or not using App Password')
    console.log('   - "self signed certificate" → Add NODE_TLS_REJECT_UNAUTHORIZED=0 to .env (dev only)')
    console.log('   - "Connection timeout" → Check EMAIL_HOST and EMAIL_PORT')
    process.exit(1)
  }
}

console.log('🚀 Starting email tests...\n')
runTests()
