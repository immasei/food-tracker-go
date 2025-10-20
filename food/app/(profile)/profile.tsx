import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Pressable} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import firebaseApp from "../../config/firebaseConfig";
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContext";

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
};

// Data type definition for food list statistics
type FoodStats = {
  totalItems: number;
  sharingItems: number;
  expiringItems: number;
  expiredItems: number;
  categories: number;
};

// Empty statistics constant to initialize food stats
const EMPTY_STATS: FoodStats = {
  totalItems: 0,
  sharingItems: 0,
  expiringItems: 0,
  expiredItems: 0,
  categories: 0,
};

// Number of days to define expiring soon food. Can be added to settings later.
const EXPIRING_WINDOW_DAYS = 3;



// Profile React Component
export default function Profile() {
  const router = useRouter();  // Expo router for url jumping
  const { user, logout, authChecked } = useContext(AuthContext);     // Use AuthContext to get user info and logout method
  const [userData, setUserData] = useState<UserData | null>(null);   // Variable to store user data
  const [stats, setStats] = useState<FoodStats>({ ...EMPTY_STATS }); // Variable to store food statistics
  const [statsLoading, setStatsLoading] = useState(true);  // Variable to indicate if stats are loading

  // Conditional auto-start 1:
  useEffect(() => {
    // Check if user is logged in
    if (!authChecked) return; // If auth state is not checked, skip the code.
    if (!user?.uid) {     // If no user is logged in
      setUserData(null);  // Reset user data variable
      return;
    }

    // Fetch user data from Firebase
    (async () => {
      try {
        const snapshot1 = await getDoc(doc(db, "users", user.uid));
        if (snapshot1.exists()) {
          const data = snapshot1.data() as Partial<UserData>;
          const tastePref = typeof data.taste_pref === "string" ? data.taste_pref : "";
          const allergyInfo = typeof data.allergy_info === "string" ? data.allergy_info : "";
          setUserData({
            id: snapshot1.id,
            username: data.username ?? "",
            email: data.email ?? "",
            phone_no: data.phone_no ?? "",
            taste_pref: tastePref,
            allergy_info: allergyInfo,
          });
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    })();
  }, [authChecked, user?.uid]); // Re-run when authCheck state or user ID changes

  // Conditional auto-start 2:
  useEffect(() => {
    // Check to ensure user is logged in before querying database
    if (!authChecked) return;
    if (!user?.uid) {
      setStats({ ...EMPTY_STATS });
      setStatsLoading(false);
      return;
    }

    let cancelled = false; // Cancellation flag for async operation

    // Fetch food statistics from Firebase
    (async () => {
      setStatsLoading(true); // Set loading state to prevent flicker
      try {
        const foodQuery = query(collection(db, "food"), where("userId", "==", user.uid));
        const snapshot2 = await getDocs(foodQuery);
        const totals: FoodStats = { ...EMPTY_STATS };
        const categories = new Set<string>();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const soon = new Date(today);
        soon.setDate(today.getDate() + EXPIRING_WINDOW_DAYS);

        // Function to parse expiry date from various formats
        const parseExpiryDate = (value: unknown): Date | null => {
          if (typeof value === "string" && value.trim().length > 0) {
            const dt = new Date(value);
            return Number.isNaN(dt.getTime()) ? null : dt;
          }
          if (value && typeof value === "object" && typeof (value as any).toDate === "function") {
            const dt = (value as any).toDate();
            return dt instanceof Date && !Number.isNaN(dt.getTime()) ? dt : null;
          }
          return null;
        };

        // Loop through each food item to calculate statistics
        snapshot2.forEach((docSnap) => {
          const data = docSnap.data() ?? {};

          // Count total items
          totals.totalItems += 1;

          // Count sharing items
          if (data.shared === true) {
            totals.sharingItems += 1;
          }

          // Collect unique categories
          if (typeof data.category === "string") {
            const normalizedCategory = data.category.trim().toLowerCase();
            if (normalizedCategory.length > 0) {
              categories.add(normalizedCategory);
            }
          }

          // Check expiry status and count expiring & expired items
          const expiry = parseExpiryDate((data as any).expiryDate);
          if (expiry) {
            if (expiry < today) {
              totals.expiredItems += 1;
            } else if (expiry <= soon) {
              totals.expiringItems += 1;
            }
          }
        });

        totals.categories = categories.size;

        // Save data
        if (!cancelled) {
          setStats(totals);
        }
      } catch (error) {
        console.error("Error fetching food stats:", error);
        if (!cancelled) {
          setStats({ ...EMPTY_STATS });
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false); // Set back loading state
        }
      }
    })();

    return () => {
      cancelled = true; // Set cancellation flag on cleanup
    };
  }, [authChecked, user?.uid]);

  // Method to return one card in user statistics area
  const StatCard = ({ title, value, icon }: { title: string; value: number | string; icon: string }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={24} color="#39f" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  // Method to handle user logout
  const handleLogout = async () => {
    await logout();  // Call logout method from AuthContext
    router.replace("/login");
  };

  const tastePrefDisplay = userData?.taste_pref?.trim();
  const allergyInfoDisplay = userData?.allergy_info?.trim();



  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* User information area */}
        <View style={styles.profileCard}>

          {/* User avatar*/}
          <View style={[styles.avatarContainer, { alignItems: 'center', paddingTop: 10, }]}>
            <Ionicons name="person-outline" size={66} color="#39f" />
          </View>

          {/* User details */}
          <View style={styles.detailContainer}>
            <Text style={styles.username}>{userData?.username || "Loading..."}</Text>
            <Text style={styles.userDetail}>Email: {userData?.email || ""}</Text>
            <Text style={styles.userDetail}>Mobile: {userData?.phone_no || ""}</Text>
          </View>

          {/* Top settings button */}
          <TouchableOpacity
            style={styles.settingsTopButton}
            onPress={() => router.push("/(settings)/settings")}
          >
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Statistics information area */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Food Tracking Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Total Food"    value={statsLoading ? "--" : stats.totalItems}    icon="fast-food-outline" />
            <StatCard title="Sharing Food"  value={statsLoading ? "--" : stats.sharingItems}  icon="people-outline" />
            <StatCard title="Expiring Soon" value={statsLoading ? "--" : stats.expiringItems} icon="timer-outline" />
            <StatCard title="Expired Food"  value={statsLoading ? "--" : stats.expiredItems}  icon="warning-outline" />
            {/* <StatCard title="Food Categories" value={statsLoading ? "--" : stats.categories} icon="apps-outline" /> */}
            {/* Food Categories card removed because we need even number of cards */}
          </View>
        </View>

        {/* Personal preference section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Preferences</Text>
          <View style={styles.infoCard}>
            <View style={[styles.infoItem, styles.infoItemFirst]}>
              <Text style={styles.infoLabel}>Taste Preference</Text>
              <Text style={styles.infoValue}>
                {tastePrefDisplay && tastePrefDisplay.length > 0 ? tastePrefDisplay : "Not Specified"}
                </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Allergy Information</Text>
              <Text style={styles.infoValue}>
                {allergyInfoDisplay && allergyInfoDisplay.length > 0 ? allergyInfoDisplay : "Not Specified"}
              </Text>
            </View>
          </View>
        </View>

        {/* Option list area (Currently only Settings) */}
        <View style={styles.sectionContainer}>
          {/** Settings Button **/}
          <View style={styles.settingsButton}>
            <TouchableOpacity style={styles.settingsItem}
              onPress={() => router.push("/(settings)/settings")}
              accessibilityRole="button"
            >
              <Ionicons name="settings-outline" size={24} color="#333" />
              <Text style={styles.settingsText}>Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Log out button */}
          <View style={styles.logoutButton}>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </ScrollView>
    </View>
  );
};



// Style sheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f2f3",
  },
  scrollView: {
    flex: 1,
  },
  settingsTopButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 8,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
    shadowColor: "#bbb",
    shadowRadius: 5,
    elevation: 5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#39f',
  },
  detailContainer: {
    alignItems: 'flex-start',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  userDetail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    paddingLeft: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: "#bbb",
    shadowRadius: 5,
    elevation: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#07f',
    marginVertical: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    shadowColor: "#bbb",
    shadowRadius: 5,
    elevation: 5,
  },
  infoItem: {
    paddingVertical: 12,
    borderTopColor: '#eee',
    borderTopWidth: 1,
  },
  infoItemFirst: {
    borderTopWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  settingsButton: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: "#bbb",
    shadowRadius: 5,
    elevation: 5,
  },
  settingsItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  settingsText: {
    fontSize: 18,
    color: '#333',
  },
  logoutButton: {
    marginVertical: 40,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 5,
    color: '#666',
    fontSize: 14,
  },
});
