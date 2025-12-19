# Firebase Setup for Android and iOS

This guide walks you through setting up Firebase Authentication for a React Native app targeting Android and iOS platforms.

---

</br> </br>

# Setting up Firebase

This section is to setup your Firebase setup in the Google cloud services.

## 1. Create a Firebase Project

- Go to [Firebase Console](https://console.firebase.google.com/u/0/)
- Click on either **Get started...** or **Add Project**
- Follow the steps to create a new project
- Name your project `Project-01`
- You will have to select a Google account.

Next step is to create independent apps for each platform.

---

## 2. Add Android App to Firebase

- From the project overview page, click **Add App** and choose **Android**
- Alternatively you can aldo do this from **Project Settings > General**
- Enter your Android package name: `com.example.smt`
- Download the `google-services.json` file and place it in your code directory

---

## 3. Add iOS App to Firebase

- From the project overview page, click **Add App** and choose **iOS**
- Make sure to use the Apple Bundle Identifier to be same as Android package name. i.e., `com.example.smt`
- Download the `GoogleService-Info.plist` file and place it in your code directory

---

## 4. Enable Authentication Methods

- In Firebase Console, go to **Build > Authentication > (May have to click Getting started) > Email/Password**
- Enable **Email/Password** (Not the link)
- You can add other providers in future.

## 5. Create Database

- Go to **Build** > **Firestore Database** > **Create database**
- Choose Start in test mode (for development) and select your region

# Setting Up Firebase in React Native

We will be using the [Firebase JS SDK](https://docs.expo.dev/guides/using-firebase/#using-firebase-js-sdk). This means some features like analytics will not use in this setup. We use the Firebase JS SDK so that we can use it with Expo Go app. For advance features, you will have to use [React Native Firebase](https://docs.expo.dev/guides/using-firebase/#using-react-native-firebase).

## 1. Installing and setting up

- We can follow the Expo guidelines [here](https://docs.expo.dev/guides/using-firebase/#install-and-initialize-firebase-js-sdk)

    ```js
    const firebaseConfig = {
        apiKey: 'api-key',
        authDomain: 'project-id.firebaseapp.com',
        databaseURL: 'https://project-id.firebaseio.com',
        projectId: 'project-id',
        storageBucket: 'project-id.appspot.com',
        messagingSenderId: 'sender-id',
        appId: 'app-id',
    };
    ```

- Fill in and replace the above in `config/firebaseConfig.ts`

- All informations can be found in the plist/json files downloaded earlier.

## 2. Create indexes

- Instead of defining a composite index manually, run the app code (qry) to get a link for generating the required index

- When you run the app, you might receive a Console Error that contain the link to generate the required index.

<p align="center">
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/index.jpg" width="27%" />
</p>

- Just follow the link and **wait** until it finishes creating the index.
- Reload the app.