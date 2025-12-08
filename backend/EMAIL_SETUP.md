# 📧 Email Configuration Guide for DevOrDie

## Quick Setup: Gmail (Recommended for Testing)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **App**: Choose "Mail"
3. Select **Device**: Choose "Other" and name it "DevOrDie"
4. Click **Generate**
5. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

### Step 3: Add to .env File
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Your app password
```

---

## Alternative Email Providers

### SendGrid (Free tier: 100 emails/day)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your.email@outlook.com
EMAIL_PASSWORD=your_password
```

### AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_ses_smtp_username
EMAIL_PASSWORD=your_ses_smtp_password
```

---

## Testing Email Configuration

### Method 1: Check Backend Logs
Start your backend server:
```bash
cd backend
npm run dev
```

Look for:
```
✅ Email service ready
```

If you see errors:
```
❌ Email service error: Invalid login
💡 Please configure EMAIL_USER and EMAIL_PASSWORD in .env file
```

### Method 2: Test Signup
1. Go to frontend (http://localhost:5173)
2. Click "Sign Up"
3. Enter test details
4. Check if OTP email arrives

---

## Common Issues & Solutions

### Issue: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solution:** 
- Make sure you're using an App Password, not your regular Gmail password
- Regenerate the App Password if needed

### Issue: "self signed certificate in certificate chain"
**Solution:** Add to .env:
```env
NODE_TLS_REJECT_UNAUTHORIZED=0  # Only for development!
```

### Issue: Emails not arriving
**Checklist:**
- ✅ Check spam/junk folder
- ✅ Verify EMAIL_USER is correct
- ✅ Verify App Password has no spaces when copied
- ✅ Check Gmail "Less secure app access" is enabled (if using regular password)
- ✅ Wait up to 2 minutes for email delivery

### Issue: Rate limited
**Solution:** Gmail limits to ~500 emails/day for free accounts. Use SendGrid or AWS SES for production.

---

## Security Best Practices

### Development
- ✅ Use App Passwords (never use your main password)
- ✅ Keep .env file in .gitignore
- ✅ Test with a dedicated Gmail account

### Production
- ✅ Use dedicated email service (SendGrid, AWS SES, Mailgun)
- ✅ Set up SPF, DKIM, and DMARC records
- ✅ Use environment variables (not .env files)
- ✅ Enable EMAIL_SECURE=true with port 465
- ✅ Set up email monitoring and logging

---

## Environment Variables Reference

```env
# Required
EMAIL_HOST=smtp.gmail.com          # SMTP server hostname
EMAIL_PORT=587                     # Port (587 for TLS, 465 for SSL)
EMAIL_SECURE=false                 # true for 465, false for 587
EMAIL_USER=your@email.com          # Your email address
EMAIL_PASSWORD=your_app_password   # App-specific password

# Optional (has defaults)
OTP_EXPIRY_MINUTES=10             # OTP validity (default: 10)
OTP_MAX_ATTEMPTS=5                # Max failed attempts (default: 5)
OTP_RATE_LIMIT_MINUTES=2          # Min time between OTPs (default: 2)
```

---

## Testing Checklist

Before deploying:
- [ ] Signup sends verification email
- [ ] OTP verification works
- [ ] Resend OTP works
- [ ] Forgot password sends email
- [ ] Password reset works
- [ ] Emails arrive within 2 minutes
- [ ] Email templates look good (check on mobile too)
- [ ] Rate limiting works (can't spam requests)

---

## Need Help?

**Gmail App Password Not Working?**
- Ensure 2FA is enabled first
- Try generating a new App Password
- Check for typos in .env file

**Still Having Issues?**
- Check backend logs for detailed error messages
- Test email settings using Nodemailer test account:
  ```javascript
  // In emailService.js, temporarily add:
  nodemailer.createTestAccount((err, account) => {
    console.log('Test credentials:', account)
  })
  ```

---

**Pro Tip:** For development, you can use [Mailtrap](https://mailtrap.io/) to catch all outgoing emails without actually sending them!
