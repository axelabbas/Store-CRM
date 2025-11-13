# 🔑 How to Create Admin Login Credentials

## Method 1: Firebase Console (Recommended)

### Step 1: Enable Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **instagram-crm-moe**
3. Click **"Authentication"** in the left sidebar
4. Click **"Get Started"** if you haven't enabled it yet
5. Click **"Sign-in method"** tab
6. Enable **"Email/Password"** provider
7. Click **"Save"**

### Step 2: Create Admin User
1. In the Authentication section, click **"Users"** tab
2. Click **"Add user"** button
3. Fill in the admin credentials:
   - **Email**: `admin@instagramcrm.com`
   - **Password**: `Admin@123456`
   - **Email verified**: ✅ Check this box
4. Click **"Add user"**

### Step 3: Test Login
1. Visit your deployed app: https://instagram-crm-moe.web.app
2. Use the credentials you just created to login

## Method 2: Alternative Admin Credentials

If you prefer different credentials, you can use any email/password combination:

**Suggested Admin Credentials:**
- Email: `your-email@example.com`
- Password: Choose a strong password (minimum 6 characters)

## Method 3: Multiple Admin Users

You can create multiple admin users by repeating Step 2 with different email addresses.

## 🔒 Security Notes

- Use a strong, unique password for your admin account
- Consider enabling email verification for additional security
- Store your credentials securely
- You can disable or delete users from the Firebase Console if needed

## 🎯 Ready to Use!

Once you've created your admin user, you can:
- Login to your CRM at https://instagram-crm-moe.web.app
- Start adding customers to your database
- Use the search functionality to find customers
- Manage your Instagram page's customer relationships

## 📞 Need Help?

If you encounter any issues:
1. Check that Authentication is enabled in Firebase Console
2. Verify the email and password are correct
3. Check the browser console for any error messages
4. Ensure your Firebase configuration is correct in the .env file