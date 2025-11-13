import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCjam30Z7ZSoz2oRW22xWpO5FT-uoCmoWE",
  authDomain: "instagram-crm-moe.firebaseapp.com",
  projectId: "instagram-crm-moe",
  storageBucket: "instagram-crm-moe.firebasestorage.app",
  messagingSenderId: "843736959468",
  appId: "1:843736959468:web:ffb8d3e22c9d58648018c9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Test credentials - you can modify these
const testEmail = "admin@instagramcrm.com";
const testPassword = "Admin@123456";

async function testAuthentication() {
  try {
    console.log("Testing authentication with email:", testEmail);
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log("✅ Authentication successful!");
    console.log("User ID:", userCredential.user.uid);
    console.log("Email:", userCredential.user.email);
  } catch (error) {
    console.error("❌ Authentication failed:", error.message);
    if (error.code === 'auth/user-not-found') {
      console.log("💡 User not found. Please create the admin user first.");
    } else if (error.code === 'auth/wrong-password') {
      console.log("💡 Wrong password. Please check your credentials.");
    }
  }
}

testAuthentication();