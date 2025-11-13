import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fetch from 'node-fetch';

// Initialize Firebase Admin
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

/**
 * Test function to verify Firebase connection and Telegram setup
 */
async function testBirthdayNotifications() {
  console.log('🧪 Testing birthday notification system...');
  
  try {
    // Test 1: Firebase connection
    console.log('1. Testing Firebase connection...');
    const testSnapshot = await db.collection('customers').limit(1).get();
    console.log(`   ✅ Firebase connected. Found ${testSnapshot.size} customers in test query.`);
    
    // Test 2: Telegram bot token
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.log('   ⚠️  Telegram configuration missing:');
      console.log(`      TELEGRAM_BOT_TOKEN: ${botToken ? '✅ Set' : '❌ Missing'}`);
      console.log(`      TELEGRAM_CHAT_ID: ${chatId ? '✅ Set' : '❌ Missing'}`);
      return;
    }
    
    console.log('2. Testing Telegram bot token...');
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/getMe`;
    
    const response = await fetch(telegramApiUrl);
    if (response.ok) {
      const botInfo = await response.json();
      console.log(`   ✅ Telegram bot connected: @${botInfo.result.username}`);
    } else {
      console.log('   ❌ Telegram bot token invalid');
      return;
    }
    
    console.log('3. Testing Telegram chat ID...');
    const testMessageUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const testResponse = await fetch(testMessageUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🧪 Test message from Instagram CRM Birthday Bot!\n\nIf you receive this message, your Telegram configuration is working correctly. 🎉',
        parse_mode: 'HTML',
      }),
    });
    
    if (testResponse.ok) {
      console.log('   ✅ Test message sent successfully!');
    } else {
      console.log('   ❌ Failed to send test message. Check chat ID.');
      const errorText = await testResponse.text();
      console.log(`      Error: ${errorText}`);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBirthdayNotifications()
  .then(() => {
    console.log('Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test script failed:', error);
    process.exit(1);
  });