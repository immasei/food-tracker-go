# Food Tracker Go

**COMP4216 / COMP5216 Group Project**

[**User Guide**](userguide/README.md)

## Introduction

To address the food waste problem caused by food expiration, we propose to develop a mobile app to track the expiration dates of food items. Our main purpose is to help users consume food before it expires to avoid food waste by mobile phone notifications. The app has basic features including adding and management of food items. Then it will track the expiration dates and send reminder notifications. To minimize food waste as much as possible, we also plan to add an AI recipe recommendation function and a self-pick-up food sharing feature with users nearby.

We chose mobile over other platforms due to its small, convenient and easily accessible nature, ensuring users can check and manage their food anywhere. Our mobile computing solution helps raise awareness about food waste and support consumers in managing their food consumption. 

We initialized from food directory which contains mini project of week 5 content. Since camera feature is already being used, we started from there.



## Key features

- Food List main page to effectively manage food stock both inside and outside the fridge.
- AI receipt recognition to add food items effectively.
- AI recipe recommendation based on food stock to consume items before expiry.
- Sharing food with nearby app users.
- Cloud storage of food list and user data.
- Notification on mobile phones for approaching expiration dates.



## Installation guide

To install the necessary packages for the AI Recipe feature, run the following commands in your project directory:

```bash
cd food
```
```bash
npm install
```

All npm modules should be installed in project's `food` directory. 

We use Google Firebase cloud service. You can use ours, or configure yours. We provide configure guide in the later part [here](#google-firebase-service).

After configuration, you can start by:

```bash
npm start
```


## Demo Account for Tester

Email: `kitkat@gmail.com`

Password: `123456`

You can also register your own accounts. Our app is open to register.



## Developer Guide

### Source Code Structure

Our project utilises React Native + Expo. The main project folder is `food`. As we use React Router, the main page files are located inside the `./food/app/` directory.

**In the `./food/app/` directory:**
- The `(main)` folder is built for Tab navigation. The pages in this folder only act as entrance points and import the pages in other folders to achieve the Tab navigation. The `_layout.tsx` file inside this `(main)` folder defines the Tab navigation.
- The `(auth)` folder contains the login and sign up features.
- The `(tracker)` folder is our app's main food tracker page, showing a food list.
- The `(scanner)` folder is the OCR scanner to add food efficiently.
- The `(recipe)` folder has a AI-powered recipe generator based on your food items.
- The `(nearby)` folder is the nearby food sharing feature, which is one of our app's main characteristic.
- The `(profile)` folder is the user profile page, showing user information and food statistics data.
- The `settings` folder contains the settings pages, including user information settings, location settings, and notification settings.
- The `index` file is the launch shim; it registers the foreground notification policy and immediately redirects into the tracker tab. If you need a splash workflow, this is where to hook it.
- The `layout.tsx` file in `app` folder defines Stack navigation for the whole app. It also wraps the entire Expo Router tree in AuthProvider plus the safe-area shell, and wires up system notification handler. It’s the place to plug global providers or tweak the high-level navigation chrome.

The surrounding directories are modules used commonly by all the pages: 
- `components/` houses reusable UIs like toasts and address pickers. 
- `config/` contains Firebase configuration files, Firebase setup and collection constants. 
- `utils/` covers shared helpers such as dates, distances, and recent-input storage.
- `types/` defines the shared data contracts. 
- `assets/` includes resources, such as images.



### Functionality of Key Components

`contexts/AuthContext.tsx` centralises Firebase Auth sign-in, sign-up, logout, and the user state flag. Any feature that needs user identity should consume this context rather than talking to Firebase directly.

`services/foodService.tsx` is the data access layer for pantry items—create/update/delete, recent name/category tracking, sorting helpers, and shared-item queries. Extend this when you add new Firestore fields or list filters.

`services/userService.tsx` encapsulates Firestore access for user profiles, stats aggregation, and location-aware nearby queries. Keep additional profile or analytics logic inside this layer for consistency.

Combined, the structure gives you a clean split between navigation shells, feature modules, and the `service/util` layers, so future features can follow the same pattern—add a service first, wire it into a feature screen, and expose shared bits through components or contexts.

`(recipe)/utils/gemini.tsx` combine user-generated content with pre-generated prompt specialized for recipe generation, and link it to Gemini api.

Notes for future developers: 

1. Run the Expo app (`npx expo start`) to confirm the flows you extend still mount cleanly. 

2. When you add new data fields, update both the relevant types/ entries and the Firestore service layer before touching the screens.



### Libraries Used

Our mobile application is built using React Native and Expo, along with several supporting libraries to enable camera access, user location, push notifications, and database services via Firebase. Below is a brief description of each library used in the project.

#### React Native
React Native is a popular open-source framework created by Meta for building mobile applications using JavaScript and React. It allows developers to write code once and deploy it on both iOS and Android platforms. It provides native UI components and APIs for building smooth, performant mobile experiences.

#### Expo
Expo is a framework and platform built around React Native that simplifies the development process. It includes a set of tools and managed APIs for building, testing, and deploying apps without dealing directly with native code or complex build configurations.

#### Metro
Metro is the JavaScript bundler used by React Native and Expo. It compiles and serves your JavaScript code to the mobile simulator or physical device during development.

#### expo-camera
expo-camera provides access to the device’s camera, allowing apps to capture photos and videos directly.

#### expo-location
expo-location provides access to the device’s GPS data. It can retrieve the user’s current location or monitor changes in position.

#### expo-notifications
expo-notifications enables scheduling and handling of local and push notifications within an Expo project.

#### Firebase
Firebase is a Backend-as-a-Service (BaaS) platform by Google. It provides cloud-based services like Firestore (real-time database), Authentication, and Cloud Storage.

#### GenAI by Google
Google’s Generative AI (GenAI) tools allow integration of AI-powered features, such as intelligent suggestions or content generation.



### Google Firebase Service

We use the **Google Firebase** service to handle user authentication and data storage. You can just use our Firebase service, but we still provide this guide if you want to configure your own.

Our setup includes two main Firebase services: **Authentication** and **Firestore Database**.

**1. Set up your Firebase project**

1. Go to [Firebase Console](https://console.firebase.google.com/).

2. Click Add project and create a new one (or use an existing project).

3. In Project settings → General, scroll down to *Your apps* and select Web app.

4. Register the app and copy the generated Firebase configuration object.
   It should look like this:

   ```js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "XXXXXXX",
     appId: "1:XXXX:web:XXXX"
   };
   ```

5. Replace the placeholder values in our `firebaseConfig` inside
   `/food/config/firebaseConfig.js` (or equivalent file).


**2. Enable Firebase Authentication**

1. In Firebase Console → Build → Authentication → Get started.
2. Under Sign-in method, enable Email/Password (and others if needed).
3. No extra setup is required — the app uses this for user login and registration.

After configured Firebase Service, please see the next part to configure Firestore database structure.



### Firestore Database Structure

1. Go to Build → Firestore Database → Create database.
2. Choose Start in test mode (for development) and select your region.
3. Two main collections are used in this app:
   * `users` — stores user profiles and preferences.
   * `food` — stores food items linked to each user.

**Example structure**

**`food` collection:**
| Field      | Type      | Description                  |
| ---------- | --------- | ---------------------------- |
| name       | string    | Food name                    |
| userId     | string    | ID of the owner user         |
| category   | string    | Food type (e.g., "Meat")     |
| shared     | boolean   | Whether item is shared       |
| expiryDate | string    | Expiration date (YYYY-MM-DD) |
| createdAt  | timestamp | Creation time                |
| updatedAt  | timestamp | Last update time             |

**`users` collection:**

| Field         | Type      | Description                                  |
| ------------- | --------- | -------------------------------------------- |
| userid        | string    | Unique user ID                               |
| username      | string    | Display name                                 |
| email         | string    | User email (login ID)                        |
| phone_no      | string    | User phone number                            |
| location      | map       | Contains address, lat/lng, and other details |
| pushEnabled   | boolean   | Whether notifications are enabled            |
| expiring_days | number    | Threshold for “expiring soon”                |
| allergy_info  | string    | User allergy info                            |
| taste_pref    | string    | Taste preference                             |
| createdAt     | timestamp | Account creation time                        |
| updatedAt     | timestamp | Last update time                             |
