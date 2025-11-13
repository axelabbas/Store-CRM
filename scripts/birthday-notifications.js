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
 * Main function to check for birthdays and send notifications
 */
async function checkBirthdaysAndNotify() {
  console.log('🎂 Birthday notification script started');
  
  try {
    // Get current date in Iraq timezone (UTC+3)
    const now = new Date();
    const iraqTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // Add 3 hours for Iraq timezone
    
    // Calculate dates for checking
    const today = new Date(iraqTime);
    const twoDaysFromNow = new Date(iraqTime);
    twoDaysFromNow.setDate(iraqTime.getDate() + 2);
    
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    const twoDaysMonth = twoDaysFromNow.getMonth() + 1;
    const twoDaysDay = twoDaysFromNow.getDate();
    
    console.log(`Checking birthdays for today (${todayMonth}-${todayDay}) and 2 days from now (${twoDaysMonth}-${twoDaysDay})`);
    
    // Get all customers
    const customersSnapshot = await db.collection('customers').get();
    const customers = [];
    
    customersSnapshot.forEach((doc) => {
      const data = doc.data();
      customers.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log(`Found ${customers.length} total customers`);
    
    // Debug: Log customer birthday data
    customers.forEach(customer => {
      if (customer.birthday) {
        const birthday = new Date(customer.birthday);
        console.log(`Customer: ${customer.fullName}, Birthday: ${customer.birthday}, Parsed: ${birthday.getMonth() + 1}-${birthday.getDate()}`);
      }
    });
    
    // Check for birthdays today
    const birthdaysToday = customers.filter(customer => {
      const birthday = new Date(customer.birthday);
      const birthMonth = birthday.getMonth() + 1;
      const birthDay = birthday.getDate();
      console.log(`Checking ${customer.fullName}: ${birthMonth}-${birthDay} vs today ${todayMonth}-${todayDay}`);
      return birthMonth === todayMonth && birthDay === todayDay;
    });
    
    // Check for birthdays in 2 days
    const birthdaysInTwoDays = customers.filter(customer => {
      const birthday = new Date(customer.birthday);
      const birthMonth = birthday.getMonth() + 1;
      const birthDay = birthday.getDate();
      return birthMonth === twoDaysMonth && birthDay === twoDaysDay;
    });
    
    console.log(`Found ${birthdaysToday.length} birthdays today`);
    console.log(`Found ${birthdaysInTwoDays.length} birthdays in 2 days`);
    
    // Send notifications
    if (birthdaysInTwoDays.length > 0) {
      console.log('Sending 2-day advance notifications...');
      await sendTelegramNotifications(birthdaysInTwoDays, '2 days');
    }
    
    if (birthdaysToday.length > 0) {
      console.log('Sending today birthday notifications...');
      await sendTelegramNotifications(birthdaysToday, 'today');
    }
    
    if (birthdaysToday.length === 0 && birthdaysInTwoDays.length === 0) {
      console.log('No birthdays to notify about today.');
    }
    
    console.log('✅ Birthday notification script completed successfully');
    
  } catch (error) {
    console.error('❌ Error in birthday notification script:', error);
    throw error;
  }
}

/**
 * Send Telegram notifications for customers with upcoming birthdays
 */
async function sendTelegramNotifications(customers, timeFrame) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!botToken || !chatId) {
    console.error('Telegram configuration missing');
    throw new Error('Telegram bot token or chat ID not configured');
  }
  
  const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  for (const customer of customers) {
    let message = '';
    
    if (timeFrame === '2 days') {
      message = `🎉 Upcoming Birthday Alert! 🎉\n\nIt's ${customer.fullName} (@${customer.instagramHandle})'s birthday in 2 days!\n\n📅 Date: ${formatDate(customer.birthday)}\n🎂 Get ready to celebrate!`;
    } else if (timeFrame === 'today') {
      message = `🎂🎉 HAPPY BIRTHDAY! 🎉🎂\n\nToday is ${customer.fullName} (@${customer.instagramHandle})'s birthday!\n\n📅 Date: ${formatDate(customer.birthday)}\n🎈 Don't forget to send your wishes!`;
    }
    
    try {
      const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send Telegram message', {
          customer: customer.fullName,
          status: response.status,
          error: errorText,
        });
      } else {
        console.log(`✅ Telegram notification sent successfully for ${customer.fullName} (${timeFrame})`);
      }
    } catch (error) {
      console.error('Error sending Telegram message', {
        customer: customer.fullName,
        error: error,
      });
    }
  }
}

/**
 * Format date in dd/mm/yyyy format for display
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return 'Invalid date';
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  checkBirthdaysAndNotify()
    .then(() => {
      console.log('Script execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script execution failed:', error);
      process.exit(1);
    });
}