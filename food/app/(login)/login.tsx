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
import { useRouter } from "expo-router";

import firebaseApp from "../../config/firebaseConfig";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// get a reference to the database to use it in this file
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

type Props = {};

const Login = (props: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPwdFocused, setIsPwdFocused] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const router = useRouter();

  async function login() {
    // check if all fields are filled
    if (email === "" || password === "") {
      return "Please fill all the fields";
    }

    // log in if user exists, otherwise, display error
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      console.log("Signed in as:", user.user.uid);

      router.push("/FoodList");
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        console.log("User does not exist");
        return "User does not exist";
      } else if (e.code === "auth/wrong-password") {
        console.log("Either email or password is wrong");
        return "Either email or password is wrong";
      } else {
        console.log("Sign in error: ", e);
      }
    }
  }

  const signUp = () => {
    router.push("/signup");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View>
        {/* <Text style={styles.categoryTitle}>Email</Text> */}
        <TextInput 
          style={[styles.textBox, { 
            borderColor: isEmailFocused ? "black" : "#cfcfcf",
            borderWidth: isEmailFocused ? 2 : 1,
          }]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
        />
      </View>
      <View>
        {/* <Text style={styles.categoryTitle}>Password</Text> */}
        <TextInput 
          style={[styles.textBox, { 
            borderColor: isPwdFocused ? "black" : "#cfcfcf",
            borderWidth: isPwdFocused ? 2 : 1,
          }]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          onFocus={() => setIsPwdFocused(true)}
          onBlur={() => setIsPwdFocused(false)}
          secureTextEntry={true}
        />
      </View>
      <Pressable 
        style={({ pressed }) => [
          styles.loginButton,
          { 
            backgroundColor: pressed ? "gray" : "black",
            borderColor: pressed ? "gray" : "black",
          },
        ]} 
        onPress={login}
        >
        <Text style={[styles.loginBtnText, {
          color: isButtonPressed ? "gray" : "white",
        }]}>Login</Text>
      </Pressable>
      <View style={styles.signUpContainer}>
        <Text>Don't have an account?</Text>
        <Pressable onPress={signUp}>
          <Text style={styles.signUpLink}> Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    marginBottom: 70,
    textAlign: "center",
  },
  categoryTitle: {
    fontSize: 17,
    color: "#696969",
  },
  textBox: {
    borderRadius: 10,
    width: 280,
    height: 50,
    paddingLeft: 10,
    marginBottom: 10,
    marginTop: 5,
    fontSize: 20,
  },
  loginButton: {
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 1,
    width: 280,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25
  },
  loginBtnText: {
    fontSize: 22
  },
  signUpLink: {
    color: "blue",
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 40,
  },
});