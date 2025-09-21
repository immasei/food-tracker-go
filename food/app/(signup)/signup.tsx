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

const SignUp = (props: Props) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text>Email</Text>
      <TextInput 
        style={styles.textBox}
        placeholder="a@gmail.com"
        value={email}
        onChangeText={setEmail}
      />
      <Text>Username</Text>
      <TextInput 
        style={styles.textBox}
        placeholder="a"
        value={username}
        onChangeText={setUsername}
      />
      <Text>Phone number</Text>
      <TextInput 
        style={styles.textBox}
        placeholder="9999999999"
        value={phone}
        onChangeText={setPhone}
      />
    </View>
  );
};

export default SignUp;

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
  textBox: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: 200,
    height: 30,
    paddingLeft: 10,
    marginBottom: 20,
    marginTop: 5,
  },
});