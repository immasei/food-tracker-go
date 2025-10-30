# Food Tracker Go — User Guide

```
Please run the app on Expo Go. (IOS preferred)
```

# Table of Contents

- [Introduction](#introduction)
- [How to Run](#how-to-run)
- [Test Account](#test-account)
- Tabs
  - [1. Food Tracker](#-1-food-tracker)
  - [2. Food OCR Scanner (Add by Scanning)](#-2-food-ocr-scanner-add-by-scanning)
  - [3. AI-Powered Recipe Generator](#-3-ai-powered-recipe-generator)
  - [4. Nearby Food Discovery (Share Food)](#-4-nearby-food-discovery-share-food)
  - [5. Profile Manager](#-5-profile-manager)
- [Privacy & Permissions](#privacy--permissions)
- [Troubleshooting FAQ](#troubleshooting-faq)

## Introduction

**Food Tracker Go** helps users manage their groceries, reduce waste, and share surplus food with the community.  
Its core features are:

1. **Food Tracker** – Add and manage items with expiry tracking.  
2. **Food OCR Scanner** – Add items by scanning labels using your camera.
3. **AI-Powered Recipe Generator** -  
4. **Nearby Food Discovery** – Find and share food with people nearby.
5. **Profile Manager** - 

This guide will walk you through how to achieve the app’s **minimum value proposition**:  
> “Track and share food efficiently with expiry awareness.”

## How to Run
```
npm install
```
```
npm start
```

## Test account
```
kitkat@gmail.com
```
```
123456
```

---

## 🍎 1. Food Tracker

The **Food Tracker** screen is where you manage all your items.

### Key Features
- Add item manually (form with `name`, `category`, `expiry date`)
  - Recent history show suggested options for quick fill 
- Search or filter by `name`/`category`
- View list **sorted by expiry** (soonest first)
- Tap to **edit** item details
- Swipe left to **delete** item

## How to Use
1. Tap the **Add** button.  
2. Fill in `name`, `category`, and `expiry date`
  -  All fields can be leaved blank
  -  But if an `expiry date` were given, it must follows `YYYY-MM-DD` format
4. **Save** your item appears in the list, with color-coded expiry status.  
5. Optional: toggle “Shared” to make it visible to others in *Nearby*. (but please set your user location in **Profile** first)

## Screenshots

<p align="center">
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13002/6936184c-7cd5-42f1-ab26-a06eccab37e9" width="27%" />
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13002/18ba8662-8b77-48c0-a5c2-6033b75ffb8b" width="27%" />
  <img src="https://github.sydney.edu.au/COMP5216-2025-S2/COMP5216-2025-GA-T02-G03/assets/13002/47768e4d-54f6-4e18-8208-a3dca9746d1a" width="27%" />
</p>

--- 
## 📷 2. Food OCR Scanner (Add by Scanning)

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
## 3.


---

## 📍 4. Nearby Food Discovery (Share Food)

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

## 5. 

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
