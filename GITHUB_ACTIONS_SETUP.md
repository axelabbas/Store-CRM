# GitHub Actions Birthday Notifications Setup Guide

This guide will help you set up completely free birthday notifications using GitHub Actions instead of Firebase Cloud Functions.

## 🎯 Overview

- **Cost**: Completely free (GitHub Actions provides 2,000 minutes/month for public repos)
- **Schedule**: Runs daily at 6:00 AM UTC (9:00 AM Iraq time)
- **Notifications**: Sends Telegram messages 2 days before and on the actual birthday
- **Format**: Uses dd/mm/yyyy date format as requested

## 📋 Prerequisites

1. Your project must be pushed to a GitHub repository
2. You need a Telegram bot (free to create)
3. Firebase service account credentials

## 🔧 Step-by-Step Setup

### Step 1: Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (instagram-crm-moe)
3. Click the gear icon ⚙️ → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save the downloaded JSON file securely

### Step 2: Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Choose a name for your bot (e.g., "Birthday Reminder Bot")
4. Choose a username for your bot (must end with 'bot')
5. Copy the bot token provided by BotFather

### Step 3: Get Your Telegram Chat ID

1. Send a message to your new bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Find your chat ID in the response

### Step 4: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these secrets:

```
FIREBASE_PROJECT_ID=instagram-crm-moe
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@instagram-crm-moe.iam.gserviceaccount.com
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

**Important**: The private key should be on one line with `\n` replacing actual newlines.

### Step 5: Push the Workflow

The workflow file is already created at `.github/workflows/birthday-notifications.yml`. Simply push it to your repository:

```bash
git add .github/workflows/birthday-notifications.yml scripts/
git commit -m "Add GitHub Actions birthday notifications"
git push origin main
```

## 🧪 Testing

### Manual Test
1. Go to your GitHub repository
2. Click **Actions** tab
3. Select "Birthday Notifications" workflow
4. Click **Run workflow** → **Run workflow**

### Add Test Customer
Add a customer with a birthday 2 days from now to test the notifications.

## 📊 Monitoring

- Check the **Actions** tab in your GitHub repository to see workflow runs
- Click on individual runs to see logs and any error messages
- The workflow will show success/failure status for each step

## 🔒 Security Notes

- All sensitive data is stored as GitHub encrypted secrets
- The workflow only runs with the permissions it needs
- Firebase credentials are never exposed in logs
- Telegram bot token is kept secure

## 💰 Cost Analysis

- **GitHub Actions**: Free for public repositories (2,000 minutes/month)
- **Firebase**: Free tier (Spark plan) sufficient for this use case
- **Telegram API**: Completely free
- **Total Cost**: $0/month

## 🛠️ Troubleshooting

### Common Issues:

1. **Workflow not running**: Check if the cron schedule is correct
2. **Firebase connection errors**: Verify service account credentials
3. **Telegram messages not sending**: Check bot token and chat ID
4. **Time zone issues**: The script automatically handles Iraq timezone (UTC+3)

### View Logs:
1. Go to GitHub repository → Actions tab
2. Click on the workflow run
3. Expand any failed step to see detailed error messages

## 🎉 Success!

Once configured, you'll receive Telegram notifications:
- **2 days before**: "🎉 Upcoming Birthday Alert! 🎉"
- **On birthday**: "🎂🎉 HAPPY BIRTHDAY! 🎉🎂"

Both notifications will include the customer's name, Instagram handle, and birthday in dd/mm/yyyy format!