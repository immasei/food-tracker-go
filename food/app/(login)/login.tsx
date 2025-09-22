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
import { getFirestore, collection, getDocs } from "firebase/firestore";

// get a reference to the database to use it in this file
const db = getFirestore(firebaseApp);

type Props = {};

const Login = (props: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPwdFocused, setIsPwdFocused] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const signUp = () => {
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <View>
        <View>
          <Text style={styles.categoryTitle}>Username</Text>
          <TextInput 
            style={[styles.textBox, { 
              borderColor: isUsernameFocused ? "black" : "#cfcfcf",
              borderWidth: isUsernameFocused ? 2 : 1,
            }]}
            placeholder="alpaca"
            value={username}
            onChangeText={setUsername}
            onFocus={() => setIsUsernameFocused(true)}
            onBlur={() => setIsUsernameFocused(false)}
          />
        </View>
        <View>
          <Text style={styles.categoryTitle}>Phone number</Text>
          <TextInput 
            style={[styles.textBox, { 
              borderColor: isPhoneFocused ? "black" : "#cfcfcf",
              borderWidth: isPhoneFocused ? 2 : 1,
            }]}
            placeholder="0499999999"
            value={phone}
            onChangeText={setPhone}
            onFocus={() => setIsPhoneFocused(true)}
            onBlur={() => setIsPhoneFocused(false)}
          />
        </View>
        <View>
          <Text style={styles.categoryTitle}>Email</Text>
          <TextInput 
            style={[styles.textBox, { 
              borderColor: isEmailFocused ? "black" : "#cfcfcf",
              borderWidth: isEmailFocused ? 2 : 1,
            }]}
            placeholder="alpaca@gmail.com"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
          />
        </View>
        <View>
          <Text style={styles.categoryTitle}>Password</Text>
          <TextInput 
            style={[styles.textBox, { 
              borderColor: isPwdFocused ? "black" : "#cfcfcf",
              borderWidth: isPwdFocused ? 2 : 1,
            }]}
            placeholder="hjpakla10k"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setIsPwdFocused(true)}
            onBlur={() => setIsPwdFocused(false)}
            secureTextEntry={true}
          />
        </View>
      </View>
      <Pressable 
        style={({ pressed }) => [
          styles.signUpButton,
          { 
            backgroundColor: pressed ? "gray" : "black",
            borderColor: pressed ? "gray" : "black",
          },
        ]} 
        onPress={signUp}
        >
        <Text style={[styles.signUpBtnText, {
          color: isButtonPressed ? "gray" : "white",
        }]}>Sign Up</Text>
      </Pressable>
      <Text style={styles.signin}>Already have an account?
        <Text style={styles.signinLink}> Sign In</Text>
      </Text>
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
    fontSize: 31,
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
    width: 250,
    height: 40,
    paddingLeft: 10,
    marginBottom: 10,
    marginTop: 5,
    fontSize: 17,
  },
  signUpButton: {
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 1,
    width: 250,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25
  },
  signUpBtnText: {
    fontSize: 17
  },
  signin: {
    marginTop: 40,
  },  
  signinLink: {
    color: "blue",
  },
});