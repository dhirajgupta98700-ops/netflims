# Netflims User Authentication Guide

## Features

### 1. **User Registration**
- Create a new account with email and password
- Full name required
- Password strength indicator
- Validation for:
  - Valid email format
  - Minimum 8 characters password
  - Password must contain uppercase, lowercase, and numbers
  - Matching password confirmation
  - Duplicate email prevention

### 2. **User Login**
- Sign in with registered email and password
- Remember me checkbox option
- Demo account for testing:
  - **Email:** demo@netflims.com
  - **Password:** Demo@123

### 3. **Session Management**
- Persistent login using localStorage
- User profile display with avatar
- Logout functionality with immediate UI refresh

## How to Use

### Signing Up
1. Click the **Sign In** button in the header
2. Click the **Sign Up** tab
3. Fill in your details:
   - Full Name
   - Email
   - Password (8+ characters with uppercase, lowercase, and numbers)
   - Confirm Password
4. Click **Sign Up**
5. You'll be automatically logged in after successful registration

### Logging In
1. Click the **Sign In** button in the header
2. Enter your email and password
3. (Optional) Check "Remember me" to save your session
4. Click **Sign In**
5. Your user avatar will appear in the header

### Logging Out
1. Click on your user avatar in the header
2. Click **Logout** from the dropdown menu
3. You'll be logged out and the page will refresh

## Technical Details

### Data Storage
- User credentials stored in browser's localStorage
- User list stored under `netflims_users`
- Current logged-in user stored under `netflims_user`
- Remember me preference stored under `netflims_remember`

### Password Strength Levels
- **Weak:** < 8 characters
- **Fair:** 8+ characters
- **Good:** 8+ characters + mixed case + numbers
- **Strong:** 12+ characters + mixed case + numbers
- **Very Strong:** 12+ characters + mixed case + numbers + special characters

### Security Features
- Email format validation
- Password strength indicator
- Error handling for invalid credentials
- Duplicate email prevention
- Keyboard shortcuts (Escape to close modal)
- Click outside modal to close

## Demo Credentials
```
Email: demo@netflims.com
Password: Demo@123
```

## Future Enhancements
- Backend API integration for secure authentication
- Password hashing and encryption
- Email verification
- Password reset functionality
- Two-factor authentication
- Social login (Google, GitHub, etc.)
- User profile management
- Watchlist and preferences
