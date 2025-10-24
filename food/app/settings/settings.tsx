import React, { useContext, } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";
import { Ionicons } from '@expo/vector-icons';



// Settings React Component
export default function Settings() {
  const router = useRouter();  // Expo router for url jumping
  const { logout } = useContext(AuthContext); // Use AuthContext to get user info and logout method
  
  // Method to handle user logout
  const handleLogout = async () => {
    await logout();  // Call logout method from AuthContext
    router.replace("/login");
  };



  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
    >
        {/* Settings Category */}
        {/* <Text style={styles.outerTitle}>All Settings</Text> */}

        {/* User Information Settings */}
        <View style={[styles.section, styles.sectionNoTitle]}>
          <Pressable 
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]} 
            onPress={ () => router.push("/settings/userinfo") }
          >
            <View style={[styles.settingIconBackground, {backgroundColor:"#07f"}]}>
              <Ionicons name="person" size={30} color="#fff" style={styles.settingIcon} />
            </View>
            <View style={[styles.settingItemLined, styles.settingItemLinedFirst ]} >
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>User Information Settings</Text>
                <Text style={styles.settingItemSubtitle}>Edit your information</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.rightArrow} />
            </View>
          </Pressable>
        </View>

        {/* Location Settings */}
        <View style={[styles.section, styles.sectionNoTitle]}>
          <Pressable 
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]} 
            onPress={ () => router.push("/settings/location") }
          >
            <View style={[styles.settingIconBackground, {backgroundColor:"#090"}]}>
              <Ionicons name="location" size={30} color="#fff" style={styles.settingIcon} />
            </View>
            <View style={[styles.settingItemLined, styles.settingItemLinedFirst ]} >
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>Location Settings</Text>
                <Text style={styles.settingItemSubtitle}>Use GPS or address picker</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.rightArrow} />
            </View>
          </Pressable>
        </View>

        {/* Push Notification Settings */}
        <View style={[styles.section, styles.sectionNoTitle]}>
          <Pressable 
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]} 
            onPress={ () => router.push("/settings/notification") }
          >
            <View style={[styles.settingIconBackground, {backgroundColor:"#e03"}]}>
              <Ionicons name="notifications" size={30} color="#fff" style={styles.settingIcon} />
            </View>
            <View style={[styles.settingItemLined, styles.settingItemLinedFirst ]} >
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>Push Notification Settings</Text>
                <Text style={styles.settingItemSubtitle}>Set expiration reminder</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.rightArrow} />
            </View>
          </Pressable>
        </View>

        {/* Log out button */}
        <View style={styles.logoutButton}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}



// Style sheets
const styles = StyleSheet.create({
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
    paddingTop: 12,
    borderWidth: 0,
    borderColor: '#eee',
    borderRadius: 20,
    shadowColor: "#bbb",
    shadowRadius: 5,
    elevation: 5,
  },
  sectionNoTitle: {
    paddingTop: 0,
  },
  settingItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
  },
  settingItemLined: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  settingItemLinedFirst: {
    borderTopWidth: 0,
  },
  settingItemPressed: {
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  settingIconBackground:{
    width: 40,
    height: 40,
    borderRadius: 12.5,
    marginRight: 10,
    alignItems: 'center',
    justifyContent:  'center',
  },
  settingIcon: {
  },
  settingItemText: {
    flex: 1,
    marginRight: 12,
  },
  settingItemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  settingItemSubtitle: {
    marginTop: 2,
    fontSize: 16,
    color: "#777",
  },
  rightArrow: {
    marginLeft: 5,
    marginRight: -10,
  },

  // Styles for logout button
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
