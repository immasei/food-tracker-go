import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  FlatList,
  GestureResponderEvent,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import firebaseApp from "../../config/firebaseConfig";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// get a reference to the database to use it in this file
const db = getFirestore(firebaseApp);

type Props = {};

type UserData = {
  id: string;
  username: string;
  email: string;
  phone_no: string;
};

const User = (props: Props) => {
  const [users, setUserList] = useState<UserData[]>([]);

  // retrieve user data from the database
  async function fetchUsers() {
    // retrieve document objects from the "users" database
    const querySnapshot = await getDocs(collection(db, "users"));

    const userArray: UserData[] = querySnapshot.docs.map((doc) => {
      return { id: doc.id, 
               username: doc.data().username,
               email: doc.data().email,
               phone_no: doc.data().phone_no 
      };
    });

    setUserList(userArray);
    console.log("HERE: ", users);
  }

  // fetch user data when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // display user info
  const renderUsers = ({ item }: { item: UserData }) => (
    <View>
      <Text>User id: {item.id}</Text>
      <Text>Username: {item.username}</Text>
      <Text>Email: {item.email}</Text>
      <Text>Phone: {item.phone_no}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Your Info</Text>
        <FlatList<UserData> 
          data={users}
          renderItem={renderUsers}
          keyExtractor={(item) => item.id}
        />
    </View>
  );
};

export default User;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
});