# Food Tracker Go

*Have you ever thrown a food product away because it was out of date and concerned about the food and money you wasted?*

*(Press the video to view the demo)*

<p align="center">
  <a href="https://www.youtube.com/watch?v=t4Nej3CNayQ">
    <img src="https://img.youtube.com/vi/t4Nej3CNayQ/0.jpg" width="750" />
  </a>
</p>

**Food Tracker Go** is a mobile app designed to reduce food waste by helping users easily track food items and their expiry dates. With timely reminders and simple organisation, the app empowers users to make better use of what they already have.

**Impacts on SDG 12**: Responsible Consumption and Production
- Minimise food waste by preventing forgotten or expired items
- Encourages sharing surplus food within the community, and promotes responsible consumption habits.

## Table of Contents
  - [How to Run](#how-to-run)
    - [Install dependencies](#install-dependencies)
    - [Firebase setup](#firebase-setup)
    - [Google Cloud API key setup](#google-cloud-api-key-setup)
    - [Run the app](#run-the-app)
    - [Demo Account](#demo-account)
  - [Core features](#core-features)
    - [1. Food Tracker](#1-food-tracker)
    - [2. Food OCR Scanner](#2-food-ocr-scanner-add-by-scanning)
    - [3. AI-Powered Recipe Generator](#3-ai-powered-recipe-generator)
    - [4. Nearby Food Discovery](#4-nearby-food-discovery-share-food)
    - [5. User Profile](#5-user-profile)
  - [Privacy & Permissions](#privacy--permissions)
  - [Troubleshooting FAQ](#troubleshooting-faq)
  - [Acknowledgment](#acknowledgement)


## How to Run

### Install dependencies
```bash
npm install
```

### Firebase setup

This project uses Google Firebase. You can either use our Firebase configuration (no setup needed) or configure your own. Follow the guide under [FIREBASE.md](https://github.com/immasei/food-tracker-go/blob/main/FIREBASE.md).

### Google Cloud API key setup

You'll also need to add your own API key
1. Go to [Google Cloud Console](https://cloud.google.com/cloud-console?hl=en)
2. Create a project
3. Open the menu (☰) > **APIs & Services** > **+ Enabled APIs & services**
   - Geocoding Api
   - Places API
   - Cloud Vision API
   - Gemini API
4. Go to **APIs & Services** > **Credentials** > **+ Create credentials** > **API key**
   - Under API restrictions, select Restrict key, then choose the 4 APIs above
   - Note that there's no Gemini API, tick Generative Language API instead
5. Copy your api key and put it under `config/apiKey.ts`

### Run the app

Start the development server:

```bash
npm start
```

Then scan the QR code and run the app using Expo Go.

### Demo Account

- Email: `kitkat@gmail.com`

- Password: `123456`

You can also register your own accounts. Our app is open to register.

## Core features

1. [**Food Tracker**](#1-food-tracker) – Add and manage items with expiry tracking.  
2. [**Food OCR Scanner**](#2-food-ocr-scanner-add-by-scanning) – Add items by scanning labels using your camera.
3. [**AI-Powered Recipe Generator**](#3-ai-powered-recipe-generator) - Turn food into creative meals.
4. [**Nearby Food Discovery**](#4-nearby-food-discovery-share-food) – Find and share food with people nearby.
5. [**Profile Manager**](#5-user-profile) - Manage your profile and view your consuming statistics.

### 1. Food Tracker

The **Food Tracker** screen is where you manage all your items.

- **Add** item manually (form with `name`, `category`, `expiry date`)
  - Recent history show suggested options for quick fill 
- **Search** or filter by `name`/ `category`
- **View** list sorted by expiry (soonest first)
- Tap to **edit** item details
- Swipe left to **delete** item

**Note** 
- When fill in `name`, `category`, and `expiry date`
   -  All fields can be leaved blank
   -  But if an `expiry date` were given, it must follows `YYYY-MM-DD` format

- You can toggle “Shared” to make it visible to others in *Nearby*. (but please set your user location in **Profile** first)

<p align="center">
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/tracker1.png" width="27%" />
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/tracker2.png" width="27%" />
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/tracker3.png" width="27%" />
</p>

### 2. Food OCR Scanner (Add by Scanning)

The **Food Scanner** screen allows users to capture food labels to auto-fill item details via OCR.

- Tap **Capture** to take a photo of the label.  
- The image is sent to Google Vision API for OCR text extraction.  
- The system parses text to detect:
   - Item name  
   - (and/or) Expiry date  
- Progress is shown live via “Scan Progress” checkboxes.

**Note** 
- You can capture **multiple photos** per scan session:
  - e.g. one for *item name*, one for *expiry date*.  
- New captures can overwrite previously scanned fields.
- Can only **Add** food to **Food Tracker** until at least one field (Item or Expiry) is detected.
- Tap **Reset** to clear and start over.

<p align="center">
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/scanner1.png" width="27%" />
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/scanner2.png" width="27%" />
</p>

### 3. AI-Powered Recipe Generator

The **Recipe** page generate recipe based on user selected ingredients using LLM API.

- Tap **Recipe** button
- Select desired ingredients to be included in the recipe.  
- Tap **Generate Recipe (? items)** on top to generate recipe from chosen ingredients.
- Tap **Back to Selection** on top to go back to the ingredient selection page.

**Note** 
- By default, it selects all items to be part of ingredient
  - **Tick All** to select all ingredients
  - **Untick All** to manually select
  - **Exclude Expired** to exclude expired items from the ingredient list.

<p align="center">
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/recipe1.PNG" width="27%" />
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/recipe2.PNG" width="27%" />
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/recipe3.PNG" width="27%" />
</p>

### 4. Nearby Food Discovery (Share Food)

The **Nearby Food Discovery** let you discover and share food with people around you.

- 🟡 **Map Center Pin** – reference point (5 km circle). By default, it shows your current location.
- 🔵 **You** – your saved location.  
- 🔴 **Other Users** – others who have shared, non-expired items.  

- **Set map center**:
  - Enter address (Google Places autocomplete) (AU address only)
  - Long-press on map
  - Or use current GPS location (bottom right)
- **Tap a pin**:
  - See user’s name, phone, and address.
  - View their shared items (name, category, days left).
- **Reload** to refresh map and listings.

**Note** 
- Only users **with a saved location within 5 km** and has >=1 **shared, non-expired** food will appear.
- Users without a saved location are hidden.

<p align="center">
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/map1.png" width="27%" />
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/map2.png" width="27%" />
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/map3.png" width="27%" />
</p>

### 5. User Profile

The **User Profile** screen shows your basic user information and some statistics about your food.

- **Basic information about User**
   - Username, Email, Mobile, Location
- **Set User Location** (full address)
   - Set by current location (Google Geocoding Api)
   - Set manually via autocomplete address picker (Google Places Api) (AU address only)
- **Food Tracking Statistics**
   - The total number of your food items.
   - How many food items you are sharing.
   - How many food items are expiring soon.
   - How many food items are already expired.
- **Push notifications for near expiring items** (only works on ios) 
- **Pull to refresh**
- **Logout**

<p align="center">
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/profile1.PNG" width="27%" />
  <img src="https://github.com/immasei/food-tracker-go/blob/main/assets/readme/profile2.PNG" width="27%" />
</p>


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

## Acknowledgement
This project was joinly built by (USYD) COMP5216 S2 2025 (T02 Group 3), with contributions from the following members: 

| Name | Contributions |
|-------------|------------|
| **Lan Linh Nguyen** | **Food Tracker** (PR #2) (full implementation)<br><br>**Food OCR Scanner** (PR #19) (full implementation)<br><br>**Set authenticated context & redirections after login/signup** (PR #20)<br><br>**User Profile** (PR #24)<br>- Set user location (Current location via Google Geocoding API/ Manual address via Google Places Autocomplete)<br>- Push notifications for near-expiring items (iOS only)<br>- Pull to refresh<br>- Logout<br><br>**Nearby food discovery** (PR #38) (full implementation)<br><br>**Video editor**|
| **Anna Nguyen** | **Setup Firebase** (PR #1) <br><br>**Sign-up / login** (PR #4/ PR #5/ PR #6/ PR #8) (without authenticated context)<br><br>**User Profile** (PR #25)<br>- Display map and anchor user’s saved/current location|
| **Youheng Wang** | **User Profile** (PR #22/ PR #44)<br>- Food stats<br>- User information|
| **Sanghyeon Lee** | **AI-Powered Recipe Generator** (PR #46/ PR #48/ PR #49) (full implementation)|
