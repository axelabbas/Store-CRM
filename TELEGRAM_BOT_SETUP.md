# Telegram Bot Setup Guide for Birthday Notifications

## Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Choose a name for your bot (e.g., "Birthday Reminder Bot")
4. Choose a username for your bot (must end with 'bot', e.g., `birthday_reminder_bot`)
5. Copy the bot token provided by BotFather

## Step 2: Get Your Chat ID

1. Send a message to your new bot (search for your bot's username)
2. Visit this URL in your browser: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for the `chat.id` value in the response - this is your chat ID

## Step 3: Configure Firebase Functions

1. Set the environment variables in Firebase:

```bash
# Set the bot token
firebase functions:config:set telegram.token="YOUR_BOT_TOKEN_HERE"

# Set the chat ID
firebase functions:config:set telegram.chat_id="YOUR_CHAT_ID_HERE"

# Deploy the functions
firebase deploy --only functions
```

## Step 4: Test Your Bot

1. Add a customer with a birthday 2 days from now
2. Wait for the daily function to run at 9:00 AM Iraq time, or
3. Manually test by running the function from Firebase Console

## Important Notes

- The bot will send notifications at 9:00 AM Iraq time (Asia/Baghdad timezone)
- Notifications are sent for birthdays 2 days before and on the actual birthday
- Make sure your bot has permission to send messages to the chat
- You can add the bot to a group if you want notifications in a group chat

## Troubleshooting

- If messages aren't being sent, check the Firebase Functions logs
- Ensure your bot token and chat ID are correctly configured
- Verify that your bot is not blocked by the recipient
- Check that the Telegram API is accessible from your Firebase region