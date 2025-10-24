import React, { useState, useEffect, useContext, useCallback, } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";
import firebaseApp from "../../config/firebaseConfig";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, } from "firebase/firestore";
import { updateEmail } from "firebase/auth";
import EditCard from "./EditCard";
import { useToast } from "../../components/Toast";


// Initialize Firebase Database
const db = getFirestore(firebaseApp);

// Data type definition for user data
type UserData = {
  id: string;
  username: string;
  email: string;
  phone_no: string;
  taste_pref: string;
  allergy_info: string;
  location: Location;
  pushEnabled: boolean;
};

// Data type definition for location
type Location = {
  placeId?: string | null;
  formatted?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
  country?: string | null;
  lat?: number | null;
  lng?: number | null;
  updatedAt?: any;
};



// UserInfoSettings React Component
export default function UserInfoSettings() {
  const router = useRouter();  // Expo router for url jumping
  const { user, logout, authChecked } = useContext(AuthContext);   // Use AuthContext to get user info and logout method
  const [userData, setUserData] = useState<UserData | null>(null); // Variable to store user data
  const [loading, setLoading] = useState(false);
  const { show, Toast } = useToast(); // Toast for in-app


  
  // Method used to update user infomation by handdler
  const updateUserProfile = useCallback(async (changes: Partial<UserData>) => {
    if (!userData?.id) {
      throw new Error("User data not loaded");
    }
    const payload: Record<string, any> = {
      ...changes,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(db, "users", userData.id), payload);
    setUserData((prev) => (prev ? { ...prev, ...changes } : prev));
  }, [userData?.id]);

  // Method to update user name
  const handleUsernameUpdate = useCallback(async (next: string) => {
    if (next.length < 2) {
      throw new Error("Username must be at least 2 characters");
    }
    await updateUserProfile({ username: next });
    show("Username updated", "success");
  }, [updateUserProfile, show]);

  // Method to update email
  const handleEmailUpdate = useCallback(async (next: string) => {
    if (!user) {
      throw new Error("User not signed in");
    }
    try {
      await updateEmail(user, next);
    } catch (err: any) {
      let message = "Failed to update email";
      const code = err?.code;
      if (code === "auth/invalid-email") {
        message = "Invalid email format";
      } else if (code === "auth/email-already-in-use") {
        message = "Email already in use";
      } else if (code === "auth/requires-recent-login") {
        message = "Please reauthenticate to change your email";
      } else if (typeof err?.message === "string") {
        message = err.message;
      }
      throw new Error(message);
    }
    await updateUserProfile({ email: next });
    show("Email updated. Use the new email to sign in.", "success");
  }, [user, updateUserProfile, show]);

  // Method to update mobile phone number
  const handlePhoneUpdate = useCallback(async (next: string) => {
    const digits = next.replace(/[^\d]/g, "");
    if (digits.length < 6) {
      throw new Error("Enter a valid phone number");
    }
    await updateUserProfile({ phone_no: next });
    show("Mobile number updated", "success");
  }, [updateUserProfile, show]);

  // Method to update taste pref
  const handleTasteUpdate = useCallback(async (next: string) => {
    await updateUserProfile({ taste_pref: next });
    show("Taste preferences saved", "success");
  }, [updateUserProfile, show]);

  // Method to update allergy info
  const handleAllergyUpdate = useCallback(async (next: string) => {
    await updateUserProfile({ allergy_info: next });
    show("Allergy info updated", "success");
  }, [updateUserProfile, show]);

  // Conditional auto-start 2: Fetch user data
  useEffect(() => {
    // Check if user is logged in
    if (!authChecked) return; // If auth state is not checked, skip the code.
    if (!user?.uid) {     // If no user is logged in
      setUserData(null);  // Reset user data variable
      return;
    }
    fetchUserData(); // Fetch user data
  }, [authChecked, user?.uid]); // Re-run when authCheck state or user ID changes

  // Method to fetch user data from Firebase
  const fetchUserData = async () => {
    try {
      const snapshot1 = await getDoc(doc(db, "users", user.uid));
      if (snapshot1.exists()) {
        const data = snapshot1.data() as Partial<UserData>;
        const tastePref = typeof data.taste_pref === "string" ? data.taste_pref : "";
        const allergyInfo = typeof data.allergy_info === "string" ? data.allergy_info : "";
        const location = typeof data.location === "object" ? data.location : { formatted: "" };

        setUserData({
          id: snapshot1.id,
          username: data.username ?? "",
          email: data.email ?? "",
          phone_no: data.phone_no ?? "",
          taste_pref: tastePref,
          allergy_info: allergyInfo,
          location: location,
          pushEnabled: data.pushEnabled ?? false,
        });
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  // Method to handle user logout
  const handleLogout = async () => {
    await logout();  // Call logout method from AuthContext
    router.replace("/login");
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setLoading(true);
    try {
      // Re-fetch both user data and food stats
      await Promise.all([fetchUserData()]);
    } finally {
      setLoading(false);
    }
  }, [fetchUserData]);



  return (
    <View style={styles.container}>
      {/*<ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
        keyboardShouldPersistTaps="handled"  // Dismiss keyboard on tap outside
        keyboardDismissMode={Platform.OS === "ios" ? "on-drag" : "none"} // iOS: drag to dismiss keyboard
        nestedScrollEnabled
        scrollEnabled={!pickerOpen} // Disable scrolling when picker is open
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      >*/}
      <FlatList data={[]} renderItem={() => null} keyExtractor={() => "header"} 
      style={styles.scrollView} ListHeaderComponent={
        <>
          {/* User Information Settings */}
          {/*<Text style={styles.sectionTitle}>User Information Settings</Text>*/}
          <View style={styles.section}>
            <EditCard
              title="Edit Username"
              subtitle="Shown to others for food sharing."
              value={userData?.username ?? ""}
              placeholder="Set username"
              message="Username is shown to other users for food sharing."
              disabled={!userData}
              onSubmit={handleUsernameUpdate}
              showToast={show}
              inputProps={{ autoCapitalize: "words", maxLength: 32 }}
              firstItem
            />
            {/* It seems that editing email requires additional process, 
                so I'm considering disabling editing of email, 
                but remain the display here. */}
            <EditCard
              title="Edit Email"
              subtitle="Login using this email."
              value={userData?.email ?? user?.email ?? ""}
              placeholder="name@example.com"
              message="Remember to use your new email to log in."
              disabled={!userData}
              onSubmit={handleEmailUpdate}
              showToast={show}
              inputProps={{
                keyboardType: "email-address",
                autoCapitalize: "none",
                autoCorrect: false,
                textContentType: "emailAddress",
              }}
            />
            {/* If we implement a change password page, I'll add the URL here. 
                Otherwise, I'll comment this out in the finial submission. */}
            <EditCard
              title="Change Password"
              subtitle="Please remember your password."
              value="Change"
              placeholder="Change"
              editable={false}
              disabled={!userData}
              onPress={() => {}}
              showToast={show}
            />
            <EditCard
              title="Edit Mobile Phone"
              subtitle="Shown to others for food sharing."
              value={userData?.phone_no ?? ""}
              placeholder="Enter phone number"
              message="The mobile phone number is shown to other users for food sharing. They will contact you using this number if needed."
              disabled={!userData}
              onSubmit={handlePhoneUpdate}
              showToast={show}
              inputProps={{
                keyboardType: "phone-pad",
                textContentType: "telephoneNumber",
                autoCapitalize: "none",
              }}
            />
            <EditCard
              title="Taste Preference"
              twolines
              subtitle="Used for AI recipe suggestions."
              value={userData?.taste_pref ?? ""}
              placeholder="Describe flavours you like"
              message="Save your taste preferences for AI recipe suggestions."
              disabled={!userData}
              allowBlank
              onSubmit={handleTasteUpdate}
              showToast={show}
              inputProps={{
                autoCapitalize: "sentences",
                multiline: true,
                numberOfLines: 3,
              }}
            />
            <EditCard
              title="Allergy Information"
              twolines
              subtitle="Used for AI recipe suggestions."
              value={userData?.allergy_info ?? ""}
              placeholder="List any food allergies"
              message="Save your allergy information for AI recipe suggestions."
              disabled={!userData}
              allowBlank
              onSubmit={handleAllergyUpdate}
              showToast={show}
              inputProps={{
                autoCapitalize: "sentences",
                multiline: true,
                numberOfLines: 3,
              }}
            />
            <EditCard
              title="User Address"
              twolines
              subtitle="Used for food sharing."
              value={userData?.location?.formatted ?? ""}
              placeholder="Tap to manage"
              editable={false}
              disabled={!userData}
              onPress={() => router.push("/settings/location")}
              showToast={show}
            />
          </View>

          {/* Log out button */}
          <View style={styles.logoutButton}>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </> }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={onRefresh}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      {/*</ScrollView>*/}
      <Toast />
    </View>
  );
}



// Style sheets
const styles = StyleSheet.create({
  // Styles for Settings pages
  container: {
    flex: 1,
    backgroundColor: '#f1f2f3',
  },
  scrollView: {
    flex: 1,
    paddingTop: 30,
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 10,
    marginHorizontal: 16,
    borderWidth: 0,
    borderColor: '#eee',
    borderRadius: 20,
    shadowColor: "#bbb",
    shadowRadius: 5,
    elevation: 5,
  },

  // Log out button
  logoutButton: {
    marginVertical: 40,
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#fdd",
    shadowColor: "#fdd",
    shadowRadius: 5,
    elevation: 5,
  },
  logoutText: {
    color: "#f00",
    fontWeight: "600",
    fontSize: 16,
  },
});
