# COMP4216/COMP5216 Project

## Food Tracker Go

To address the food waste problem caused by food expiration, we propose to develop a mobile app to track the expiration dates of food items. Our main purpose is to help users consume food before it expires to avoid food waste by mobile phone notifications. The app has basic features including adding and management of food items. Then it will track the expiration dates and send reminder notifications. To minimize food waste as much as possible, we also plan to add an AI recipe recommendation function and a self-pick-up food sharing feature with users nearby.

We chose mobile over other platforms due to its small, convenient and easily accessible nature, ensuring users can check and manage their food anywhere. Our mobile computing solution helps raise awareness about food waste and support consumers in managing their food consumption. 

We initialized from food directory which contains mini project of week 5 content. Since camera feature is already being used, we started from there.

### Installation guide
To install the necessary packages for the AI Recipe feature, run the following commands in your project directory:

```bash
cd food
npm install
npm install react-native-markdown-display
npm install @google/genai
```

All npm should be installed in project's food directory. You can start by
```bash
npm start
```

### Key features
- Food List main page to effectively manage food stock both inside and outside the fridge.
- Notification on mobile phones for approaching expiration dates.
- Effectively adding items through barcode scanning and AI receipt recognition.
- Cloud synchronization and data sharing among family members.
- AI recipe recommendation based on food stock to consume items before expiry.
- Sharing unwanted food with nearby app users.

### What is functioning
- Food List main page is fully functioning. This out Minimum Viable Product (MVP).
- Login/Signup functions are fully functioning. User data will synchonize to our Google Firebase backend and database.
- User and Settings page have basic interfaces. User details can be displayed, but some backend functions are to be implement.
- Camera page based on our mini project. Camera funtion is working.
- Recipe page is passing ingredients with prompts and able to receive the recipe.

### TODO items
- Add backend function to many pages.
- Fix the tab bar display problem.
- (Optional) Add food sharing funciton.

### Current challenges
- Recipe page need to pass dynamic ingredient since it is passing preset ingredient. Enable user to adjust prompt in high level.

