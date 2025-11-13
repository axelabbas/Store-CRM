# Instagram Contributor CRM & Birthday Notifier

A high-performance web application for managing Instagram page customer relationships with automated birthday notifications via Telegram.

## Features

- **Admin Authentication**: Secure login system using Firebase Authentication
- **Customer Management**: Add and view customers with detailed information
- **Real-time Search**: Search customers by name or Instagram handle
- **Automated Birthday Notifications**: Daily Telegram alerts for upcoming birthdays (2 days in advance)
- **Mobile-First Design**: Fully responsive interface built with Tailwind CSS
- **Serverless Architecture**: Built on Firebase Spark plan for zero cost

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase Cloud Functions
- **Database**: Cloud Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Notifications**: Telegram Bot API

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth)
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── config/             # Firebase configuration

functions/              # Cloud Functions (TypeScript)
└── src/
    └── index.ts        # Birthday notification function
```

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (name it `instagram-crm-moe` or similar)
3. Enable Firebase Authentication (Email/Password)
4. Enable Cloud Firestore (start in production mode)
5. Create an admin user in Firebase Authentication

### 2. Environment Configuration

Copy the example environment file and configure your Firebase credentials:

```bash
cp .env.example .env
```

Fill in your Firebase configuration:
- `VITE_FIREBASE_API_KEY`: Your Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID
- Other Firebase configuration values

### 3. Telegram Bot Setup

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot and get the token
3. Create a private Telegram group for notifications
4. Add your bot to the group
5. Get the chat ID (use `@getidsbot` or similar)

Configure the Telegram settings in your Firebase project:

```bash
firebase functions:config:set telegram.token="YOUR_BOT_TOKEN" telegram.chat_id="YOUR_CHAT_ID"
```

### 4. Install Dependencies

```bash
npm install
cd functions && npm install && cd ..
```

### 5. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 6. Build and Deploy

```bash
npm run build
firebase deploy
```

## Usage

1. **Login**: Access your deployed URL and login with your admin credentials
2. **Add Customers**: Navigate to "Add Customer" and fill in the required information
3. **View Customers**: See all customers on the main dashboard with real-time updates
4. **Search**: Use the search bar to find customers by name or Instagram handle
5. **Birthday Notifications**: Automated Telegram messages will be sent daily at 9:00 AM Iraq time for birthdays 2 days ahead

## Cloud Function Details

The `birthdayNotifier` function runs daily at 9:00 AM Iraq time (Asia/Baghdad timezone) and:
- Checks for customers with birthdays in 2 days
- Sends Telegram notifications to the configured chat
- Uses Firebase environment configuration for Telegram credentials

## Security Rules

Firestore security rules ensure that only authenticated admin users can read/write customer data.

## Development

### Local Development

```bash
npm run dev
```

### Local Functions Testing

```bash
cd functions
npm run serve
```

### Build for Production

```bash
npm run build
```

## Future Enhancements

- Customer editing and deletion functionality
- Statistics dashboard with charts
- CSV export functionality
- Customer interaction history
- Multiple admin user management

## Support

For issues or questions, please check the Firebase documentation and ensure all environment variables are correctly configured.