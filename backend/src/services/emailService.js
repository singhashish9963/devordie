import { createTransport } from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Create reusable transporter
let transporter = null

const createTransporter = () => {
  if (transporter) return transporter

  // Configure based on environment
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  }

  transporter = createTransport(config)

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email service error:', error.message)
      console.log('💡 Please configure EMAIL_USER and EMAIL_PASSWORD in .env file')
    } else {
      console.log('✅ Email service ready')
    }
  })

  return transporter
}

// Email templates
const getEmailTemplate = (type, data) => {
  const templates = {
    verification: {
      subject: '🎮 Verify Your DevOrDie Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚔️ DevOrDie</h1>
              <p>Welcome to the battlefield!</p>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Hi ${data.name},</p>
              <p>Thank you for joining DevOrDie! To complete your registration and start coding battle strategies, please verify your email address.</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
                <div class="otp-code">${data.otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
              </div>
              
              <p>Enter this code on the verification page to activate your account.</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't create an account with DevOrDie, please ignore this email or contact support if you have concerns.
              </div>
              
              <p>Happy coding!</p>
              <p><strong>The DevOrDie Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} DevOrDie. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        DevOrDie - Verify Your Email
        
        Hi ${data.name},
        
        Your verification code is: ${data.otp}
        
        This code will expire in 10 minutes.
        
        If you didn't create an account with DevOrDie, please ignore this email.
        
        - The DevOrDie Team
      `
    },
    
    passwordReset: {
      subject: '🔒 Reset Your DevOrDie Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #f5576c; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #f5576c; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
            .alert { background: #f8d7da; border-left: 4px solid #dc3545; padding: 12px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset</h1>
              <p>Secure your account</p>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>Hi ${data.name},</p>
              <p>We received a request to reset your password for your DevOrDie account.</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your password reset code is:</p>
                <div class="otp-code">${data.otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
              </div>
              
              <p>Enter this code on the password reset page to create a new password.</p>
              
              <div class="alert">
                <strong>🚨 Important:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure. Your password will remain unchanged.
              </div>
              
              <div class="warning">
                <strong>💡 Security Tip:</strong> Never share your reset code with anyone. DevOrDie staff will never ask for your password or verification codes.
              </div>
              
              <p>Stay secure!</p>
              <p><strong>The DevOrDie Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} DevOrDie. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        DevOrDie - Password Reset
        
        Hi ${data.name},
        
        Your password reset code is: ${data.otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request a password reset, please ignore this email.
        
        - The DevOrDie Team
      `
    }
  }

  return templates[type]
}

// Send email with retry logic
export const sendEmail = async (to, type, data, retries = 3) => {
  const transport = createTransporter()
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials not configured')
    throw new Error('Email service not configured')
  }

  const template = getEmailTemplate(type, data)
  
  const mailOptions = {
    from: `"DevOrDie" <${process.env.EMAIL_USER}>`,
    to,
    subject: template.subject,
    text: template.text,
    html: template.html
  }

  let lastError
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transport.sendMail(mailOptions)
      console.log(`✅ Email sent to ${to}: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      lastError = error
      console.error(`❌ Email attempt ${attempt}/${retries} failed:`, error.message)
      
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }
  
  throw new Error(`Failed to send email after ${retries} attempts: ${lastError.message}`)
}

// Specific email sending functions
export const sendVerificationEmail = async (email, name, otp) => {
  return sendEmail(email, 'verification', { name, otp })
}

export const sendPasswordResetEmail = async (email, name, otp) => {
  return sendEmail(email, 'passwordReset', { name, otp })
}

// Rate limiting check
export const canSendOTP = (user) => {
  const now = Date.now()
  const lastSent = user.lastOTPSent ? user.lastOTPSent.getTime() : 0
  const timeSinceLastOTP = now - lastSent
  const minInterval = 2 * 60 * 1000 // 2 minutes

  if (timeSinceLastOTP < minInterval) {
    const waitTime = Math.ceil((minInterval - timeSinceLastOTP) / 1000)
    return {
      canSend: false,
      waitTime,
      message: `Please wait ${waitTime} seconds before requesting a new code`
    }
  }

  return { canSend: true }
}
