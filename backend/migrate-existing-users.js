#!/usr/bin/env node

/**
 * Database Migration Script
 * Marks all existing users as email verified
 * 
 * Usage: node migrate-existing-users.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devordie'

console.log('🔄 Starting user migration...\n')

async function migrateUsers() {
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Get users collection
    const db = mongoose.connection.db
    const usersCollection = db.collection('users')

    // Count existing users
    const totalUsers = await usersCollection.countDocuments()
    console.log(`📊 Found ${totalUsers} users in database`)

    if (totalUsers === 0) {
      console.log('✨ No users to migrate. Database is ready for new signups!')
      await mongoose.disconnect()
      return
    }

    // Count unverified users
    const unverifiedCount = await usersCollection.countDocuments({ 
      isEmailVerified: { $ne: true } 
    })
    console.log(`📧 Users to verify: ${unverifiedCount}\n`)

    if (unverifiedCount === 0) {
      console.log('✅ All users are already verified!')
      await mongoose.disconnect()
      return
    }

    // Ask for confirmation
    console.log('⚠️  This will mark all existing users as email verified.')
    console.log('   This is a one-time migration for upgrading to OTP authentication.\n')

    // Update all users
    console.log('🔧 Updating users...')
    const result = await usersCollection.updateMany(
      {},
      {
        $set: {
          isEmailVerified: true,
          accountLocked: false,
          otpAttempts: 0
        },
        $unset: {
          emailVerificationToken: '',
          emailVerificationExpires: '',
          passwordResetToken: '',
          passwordResetExpires: '',
          lastOTPSent: '',
          lockUntil: ''
        }
      }
    )

    console.log(`✅ Migration complete!`)
    console.log(`   Modified: ${result.modifiedCount} users`)
    console.log(`   Matched: ${result.matchedCount} users\n`)

    // Verify migration
    const verifiedCount = await usersCollection.countDocuments({ 
      isEmailVerified: true 
    })
    console.log(`📊 Final status:`)
    console.log(`   Total users: ${totalUsers}`)
    console.log(`   Verified users: ${verifiedCount}`)
    console.log(`   Unverified users: ${totalUsers - verifiedCount}\n`)

    if (verifiedCount === totalUsers) {
      console.log('🎉 Migration successful! All users are now verified.')
      console.log('✨ New signups will require email verification via OTP.')
    } else {
      console.log('⚠️  Some users may need manual verification.')
    }

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')

  } catch (error) {
    console.error('\n❌ Migration failed:')
    console.error(`   Error: ${error.message}`)
    console.log('\n🔧 Troubleshooting:')
    console.log('   1. Check MONGODB_URI in .env file')
    console.log('   2. Ensure MongoDB is running')
    console.log('   3. Check database permissions')
    process.exit(1)
  }
}

// Run migration
migrateUsers()
