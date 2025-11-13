# Firebase Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it: `instagram-crm-moe` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create Project"

## 2. Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Under "Your apps", click "Web" icon (</>)
3. Register app with nickname: `instagram-crm-app`
4. Copy the configuration object

## 3. Set Environment Variables

Create a `.env` file in the root directory and add your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 4. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

## 5. Create Admin User

1. In Firebase Console, go to "Authentication"
2. Click "Add user"
3. Enter email and password for your admin account
4. Click "Add user"

## 6. Set Up Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Production mode"
4. Select your region (choose one close to Iraq for better performance)
5. Click "Enable"

## 7. Deploy Firestore Rules

Run this command to deploy the security rules:

```bash
firebase deploy --only firestore:rules
```

## 8. Set Up Telegram Bot (Optional)

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot: `/newbot`
3. Follow the instructions to get your bot token
4. Create a private Telegram group for notifications
5. Add your bot to the group
6. Get the chat ID using [@getidsbot](https://t.me/getidsbot)

Configure Telegram in Firebase:

```bash
firebase functions:config:set telegram.token="YOUR_BOT_TOKEN" telegram.chat_id="YOUR_CHAT_ID"
```

## 9. Deploy the Application

```bash
npm run build
firebase deploy
```

## 10. Test Your Application

1. Visit your deployed URL
2. Login with your admin credentials
3. Add a test customer with a birthday 2 days from now
4. Check your Telegram group for the notification (if configured)

## Troubleshooting

- **Invalid API Key**: Make sure all environment variables are correctly set
- **Permission Denied**: Ensure Firestore rules are deployed and you're authenticated
- **Function Errors**: Check Firebase Functions logs in the console
- **Telegram Issues**: Verify bot token and chat ID are correctly configured

## Important Notes

- The birthday notification function runs daily at 9:00 AM Iraq time (Asia/Baghdad timezone)
- Notifications are sent 2 days before the actual birthday
- All customer data is protected and only accessible to authenticated admin users
- The application is built on Firebase Spark plan for zero cost