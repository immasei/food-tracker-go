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

After congiguration, you can start by:

```bash
npm start
```


## Demo Account for Tester

Email: `kitkat@gmail.com`

Password: `123456`

You can also register your own accounts. Our app is open to register.



## Developer Guide

### Source Code Structure

... (Introduce the Code Structure and mention some file of Key Components here)



### Functionality of Key Components

... (May overlap with the previos part, can be changed or merged.)



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

... (Regarding the Expo libraries, we actually used many of them. Here, I just mentioned three packages related to mobile technologies.)



### Google Firebase Service

We used Google Firebase Service for ...

... (configuration of Firebase Service)

... (I'm not sure if the tester is allowed to use our Firebase service. We need to decide whether inclu)

After configured Firebase Service, please see the next part to configure Firestore database structure.



### Firestore Database Structure

... (configure Firestore database structure.)


... (Instructions to configure firebase keys, firebase database, Gemini/Openai api keys.)






## Stage 2 Contents

### What is functioning
- Food List main page is fully functioning. This is our Minimum Viable Product (MVP).
- Login/Signup functions are fully functioning. User data will synchronize to our Google Firebase backend and database.
- User and Settings pages have basic interfaces. User details can be displayed, but some backend functions are to be implement.
- Camera page based on our mini project. Camera function is working.
- Recipe page is passing ingredients with prompts and able to receive the recipe.

### TODO items
- Add backend functions to many pages.
- Fix the tab bar display problem.
- Add AI receipt recognition function.
- Add food sharing function.

### Current challenges
- Recipe page needs to pass dynamic ingredient since it is passing preset ingredient. Enable user to adjust prompt in high level.
- Integrating a map SDK for food sharing function is challenging.
- We are encountering a lot of bugs while creating new functions.
