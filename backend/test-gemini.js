// Test Google Gemini API connection
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API connection...\n');
  
  // Check API key
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', process.env.GEMINI_API_KEY.substring(0, 15) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    console.log('\n📡 Sending test request to Gemini API...');
    
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: "Say 'Hello World' in JavaScript code format" }] }
      ],
      generationConfig: {
        maxOutputTokens: 100,
      }
    });
    
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS! Gemini API is working!\n');
    console.log('📝 Response:', text);
    console.log('\n✨ AI Code Generator will work correctly!');
    
  } catch (error) {
    console.error('\n❌ FAILED! Error connecting to Gemini API:\n');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('fetch failed')) {
      console.error('\n💡 Network Error - Possible solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Check if firewall is blocking Node.js');
      console.error('   3. Try using a VPN');
      console.error('   4. Check if you need proxy settings');
    } else if (error.message.includes('API_KEY')) {
      console.error('\n💡 API Key Error - Solutions:');
      console.error('   1. Get new key: https://aistudio.google.com/app/apikey');
      console.error('   2. Make sure key is copied correctly in .env');
    }
    
    process.exit(1);
  }
}

testGeminiAPI();
