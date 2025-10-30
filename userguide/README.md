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
  - [3. AI-Powered Recipe Generator](#3-ai-powered-recipe-generator)
  - [4. Nearby Food Discovery (Share Food)](#-4-nearby-food-discovery-share-food)
  - [5. Profile Manager](#5-profile-manager)


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
| Before Detection | After Detection |
|------------------|-----------------|
| ![Scanner before](./assets/scanner-before.png) | ![Scanner detected](./assets/scanner-detected.png) |

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

### Screenshot
![Nearby Food Map](./assets/nearby-map.png)

### Notes
- Only users **within 5 km** and with **shared, non-expired** food appear.
- Users without a saved location are hidden.

---

## 5. 
