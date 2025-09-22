import React, { useState, useEffect, useRef } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import PhoneInput from 'react-native-phone-number-input';

import firebaseApp from "../../config/firebaseConfig";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// get a reference to the database to use it in this file
const db = getFirestore(firebaseApp);

type Props = {};

const SignUp = (props: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPwdFocused, setIsPwdFocused] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const phoneInput = useRef(null);

  const router = useRouter();

  const signUp = () => {
    
  };

  const signIn = () => {
    router.push("/login");
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
            placeholder="username"
            value={username}
            onChangeText={setUsername}
            onFocus={() => setIsUsernameFocused(true)}
            onBlur={() => setIsUsernameFocused(false)}
          />
        </View>

        <View>
          <Text style={styles.categoryTitle}>Phone number</Text>
          <PhoneInput
            ref={phoneInput}
            defaultValue={phone}
            value={phone}
            defaultCode="AU"
            layout="first"
            onChangeFormattedText={setPhone}
            containerStyle={styles.phoneContainer}
            textContainerStyle={styles.phoneTextContainer}
            textInputStyle={styles.phoneText}
            codeTextStyle={styles.phoneCode}
          />
        </View>

        {/* <View>
          <Text style={styles.categoryTitle}>Phone number</Text>
          <TextInput 
            style={[styles.textBox, { 
              borderColor: isPhoneFocused ? "black" : "#cfcfcf",
              borderWidth: isPhoneFocused ? 2 : 1,
            }]}
            placeholder="phone number"
            value={phone}
            onChangeText={setPhone}
            onFocus={() => setIsPhoneFocused(true)}
            onBlur={() => setIsPhoneFocused(false)}
          />
        </View> */}
        <View>
          <Text style={styles.categoryTitle}>Email</Text>
          <TextInput 
            style={[styles.textBox, { 
              borderColor: isEmailFocused ? "black" : "#cfcfcf",
              borderWidth: isEmailFocused ? 2 : 1,
            }]}
            placeholder="email"
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
            placeholder="password"
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
      <View style={styles.signinContainer}>
        <Text>Already have an account?</Text>
        <Pressable onPress={signIn}>
          <Text style={styles.signinLink}> Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SignUp;

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
  phoneContainer: {
    width: 280,
    height: 50,
    borderColor: "#cfcfcf",
    marginBottom: 10,
    marginTop: 5,
  },
  phoneTextContainer: {
    paddingVertical: 0,
  },
  phoneText: {
    fontSize: 16,
  },
  phoneCode: {
    fontSize: 16,
  },
  textBox: {
    borderRadius: 10,
    width: 280,
    height: 50,
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
  signinLink: {
    color: "blue",
  },
  signinContainer: {
    flexDirection: "row",
    marginTop: 40,
  },
});