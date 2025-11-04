# Food Tracker Go — User Guide

```
Please run the app on Expo Go. (IOS preferred)
```

## Table of Contents

- [Introduction](#introduction)
- [Core Features](#core-features)
- [How to Run](#how-to-run)
- [Test Account](#test-account)
- Tabs
  - [1. Food Tracker](#1-food-tracker)
  - [2. Food OCR Scanner (Add by Scanning)](#2-food-ocr-scanner-add-by-scanning)
  - [3. AI-Powered Recipe Generator](#3-ai-powered-recipe-generator)
  - [4. Nearby Food Discovery (Share Food)](#4-nearby-food-discovery-share-food)
  - [5. User Profile](#5-user-profile)
- Other Pages
  - [Registration and Login](#registration-and-login)
  - [Settings](#settings)
- [Privacy & Permissions](#privacy--permissions)
- [Troubleshooting FAQ](#troubleshooting-faq)



## Introduction

Do you often throw away expired food because of forgetting the expiry date? Responsible consumption and production is one of the United Nations sustainable goals. 

To address the food waste problem caused by food expiration and respond to the UN Sustainable Goal, we developed a mobile app named **Food Tracker Go**. The app helps you reduce food waste by tracking expiry dates and sending notifications before your food expires.

Our main purpose is to help you consume food before it expires to avoid food waste by mobile phone notifications. The app has basic features including adding and management of food items. Then it will track the expiration dates and send reminder notifications. To minimize food waste as much as possible, we also have AI recipe recommendation function and a self-pick-up food sharing feature with users nearby.



## Core Features

**Food Tracker Go** helps users manage their groceries, reduce waste, and share surplus food with the community.  
Its core features are:

1. **Food Tracker** – Add and manage items with expiry tracking.  
2. **Food OCR Scanner** – Add items by scanning labels using your camera.
3. **AI-Powered Recipe Generator** -  
4. **Nearby Food Discovery** – Find and share food with people nearby.
5. **Profile Manager** - Manage your profile and view your consuming statistics.

This guide will walk you through how to achieve the app’s **minimum value proposition**:  
> “Track and share food efficiently with expiry awareness.”

## How to Run
```bash
cd COMP5216-2025-GA-T02-G03/food
```
```bash
npm install
```
```bash
npm start
```

## Test Account


Email: `kitkat@gmail.com`

Password: `123456`

You can also register your own accounts. Our app is open to register.

---

## 1. Food Tracker

The **Food Tracker** screen is where you manage all your items.

### Key Features
- Add item manually (form with `name`, `category`, `expiry date`)
  - Recent history show suggested options for quick fill 
- Search or filter by `name`/`category`
- View list **sorted by expiry** (soonest first)
- Tap to **edit** item details
- Swipe left to **delete** item

### How to Use
1. Tap the **Add** button.  
2. Fill in `name`, `category`, and `expiry date`
  -  All fields can be leaved blank
  -  But if an `expiry date` were given, it must follows `YYYY-MM-DD` format
4. **Save** your item appears in the list, with color-coded expiry status.  
5. Optional: toggle “Shared” to make it visible to others in *Nearby*. (but please set your user location in **Profile** first)

### Screenshots

<p align="center">
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13002/6936184c-7cd5-42f1-ab26-a06eccab37e9" width="27%" />
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13002/18ba8662-8b77-48c0-a5c2-6033b75ffb8b" width="27%" />
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13002/47768e4d-54f6-4e18-8208-a3dca9746d1a" width="27%" />
</p>

--- 
## 2. Food OCR Scanner (Add by Scanning)

The **Food Scanner** screen allows users to capture food labels to auto-fill item details via OCR.

### Flow
1. Tap **Capture** to take a photo of the label.  
2. The image is sent to Google Vision API for OCR text extraction.  
3. The system parses text to detect:
   - Item name  
   - (and/or) Expiry date  
4. Progress shows live via “Scan Progress” checkboxes.

### Tips
- You can capture **multiple photos** per scan session:
  - e.g. one for *item name*, one for *expiry date*.  
- New captures can overwrite previously scanned fields.
- Can only **Add** food to **Food Tracker** once at least one field (Item or Expiry) is detected.
- Tap **Reset** to clear and start over.

### Screenshots

<p align="center">
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13002/3e72bd02-2c69-40ff-8b42-68650bd072ab" width="27%" />
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13002/34d5d15d-9c9a-4ed2-b000-bb5f233b7488" width="27%" />
</p>

---
## 3. AI-Powered Recipe Generator

The **Recipe** page generate recipe based on user selected ingredients.

### Flow
1. Tap **Recipe** button
2. Select desired ingredients to be included in the recipe.  
3. Tap **Generate Recipe (? items)** on top to generate recipe from chosen ingredients.
4. Tap **Back to Selection** on top to go back to the ingredient selection page.

### Tips
- On default, it selects all items to be part of ingredient
  - **Tick All** to select all ingredients
  - **Untick All** to manually select
  - **Exclude Expired** to exclude expired items from the ingredient list.

### Screenshots

<p align="center">
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13037/9737f696-6003-4746-8dc4-7eec5e74b3cb" width="27%" />
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13037/f2d0bc71-6259-45d1-87fd-8ff0e4021456" width="27%" />
</p>



---

## 4. Nearby Food Discovery (Share Food)

The **Nearby Food Discovery** let you discover and share food with people around you.

### Display Overview
- 🟡 **Map Center Pin** – reference point (5 km circle).  
- 🔵 **You** – your saved location.  
- 🔴 **Other Users** – others who have shared, non-expired items.  

### Map Functions
- **Set map center**:
  - Enter address (Google Places autocomplete),
  - Long-press on map,
  - Or use current GPS location.
- **Tap a pin**:
  - See user’s name, phone, and address.
  - View their shared items (name, category, days left).
- **Reload** to refresh map and listings.

### Notes
- Only users **within 5 km** and with **shared, non-expired** food appear.
- Users without a saved location are hidden.

### Screenshot

<p align="center">
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13002/f501b321-13a6-4817-85ff-104aae0b315a" width="27%" />
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13002/369ff371-ceb0-48ba-8eea-088e3ddb500e" width="27%" />
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13002/c2dab4db-f268-4231-bf32-1a71cf374ece" width="27%" />
</p>

---

## 5. User Profile

At the top of the Profile page, you’ll see a **User Card** showing your 
basic user information — including your username, email, and phone number.
Your email is the account for login, while your username and phone number 
are displayed to other users when you share food.

Below the card, there’s a **Food Tracking Statistics** section with four cards showing:
- The total number of your food items.
- How many food items you are sharing.
- How many food items are expiring soon.
- How many food items are already expired.

Scrolling further down, you’ll find a **Personal Preferences** section 
with more personal details like your address, taste preferences, 
and allergy information.

Your address is used in the Food Sharing feature and will be visible 
to other users.

Your taste preferences and allergy information will be provided to AI 
in our AI Recipe feature to create personalized recipe suggestions 
just for you.

At the bottom of the page, there’s a **Settings** button that takes 
you to the main settings list.

You can also tap any personal info item to quickly jump to its 
specific settings page.

Finally, at the very bottom, there’s a **Log Out** button to sign out 
of your account.

<p align="center">
  <img src="./images/profile.png" width="27%" alt="Screenshot showing the User Profile page." />
  &nbsp
  <img src="./images/profile-bottom.png" width="27%" alt="Screenshot showing the bottom part of User Profile page." />
</p>

---

## Registration and Login

Entering this app, the first page is the login page. Don't worry, we are open and free to register accounts. You can finish the registration process with only a few clicks in one minite. After registration, you will be automatically logged in, without typing your email and password again. Then you can freely enjoy our app!

### Registration

If you do not have an account, you can registrate one within one minute.

After registration, you will be automatically logged in, without typing your email and password again. You will see the food list page now.

### Log In

If you log out or use a new device, you need to login. Just input your email and password used in registration, and click the button, you will be automatically brought to the food list page.

Please use your email for logging in, do not use your nick name, real name or mobile number. Please keep remember your password and do not tell others.


---

## Settings

Entering the settings part, you will first see a **settings list** 
including three sections:

- **User Information Settings**
- **Location Settings**
- **Push Notification Settings**

<p align="center">
  <img src="./images/settings.png" width="27%" alt="Screenshot showing the Settings main page with a list of setting items." />
</p>

### User Information Settings

Here you can easily edit your personal details such as your username, phone number, taste preferences, and allergy information.

Some of these settings are used for the **Food Sharing** and **AI Recipe Recommendation** features of our app.

<p align="center">
  <img src="./images/userinfo.png" width="27%" alt="Screenshot showing the User Information Settings page with a list of setting items." />
</p>

### Location Settings

This page lets you set your account’s location, which is used for our 
nearby food sharing feature.

You can tap **Use Current** to locate you using mobile phone GPS, 
and your address will be filled in automatically.

If you are not at the location you want to set, you can use the **Address Picker** to search and select one — the map position will update automatically.

After saving your location, tap **“Open Map”** to view it and confirm 
that it’s correct.

<p align="center">
  <img src="./images/location.png" width="27%" alt="Screenshot showing the Location Settings page." />
  &nbsp
  <img src="./images/map.jpg" width="27%" alt="Screenshot showing a map with user's location in the middle." />
</p>

### Notification Settings

Our app sends **food expiration reminders** through mobile notifications.
On this page, you can manage everything related to notifications:

- The main notifications switch, **on or off**. Your settings will 
be saved and synchronized to the cloud.

- Set how many days in advance you want to be reminded — this number 
also defines which items count as **expiring soon**.

- Try the **Send test notification** button to instantly see what 
an expiration reminder looks like.

<p align="center">
  <img src="./images/notification.png" width="27%" alt="Screenshot showing the Notification Settings page." />
  &nbsp
  <img src="./images/notification-demo.png" width="27%" alt="Screenshot showing a demo notification pop up at the top of the screen." />
</p>



---



## Privacy & Permissions

- Camera is used only for on-device capture and OCR processing.

- Location is used to show approximate proximity (5 km).
You can opt to set a manual address if you prefer.

- Contact information you provide is shown to others when they tap your pin.


## Troubleshooting FAQ

| Issue | Possible Cause / Solution |
|-------|----------------------------|
| Add button disabled | At least one scanned field (Item or Expiry) must be detected. |
| Can’t see myself on map | Ensure location is saved and at least one non-expired shared item exists. |
| OCR misreads expiry | Retake photo closer to the printed date, under better lighting. |
