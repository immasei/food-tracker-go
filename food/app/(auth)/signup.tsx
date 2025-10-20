import React, { useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  FlatList,
  GestureResponderEvent
} from "react-native";
import { useRouter } from "expo-router";
import { useToast } from "../../components/Toast";
import { AuthContext } from "../../contexts/AuthContext";

// import { Ionicons } from "@expo/vector-icons";
import firebaseApp from "../../config/firebaseConfig";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, setDoc, doc } from "firebase/firestore";

// get a reference to the database to use it in this file
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

type Props = {};

const SignUp = (props: Props) => {
  const { show, Toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPwdFocused, setIsPwdFocused] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const router = useRouter();
  const context = useContext(AuthContext);

  async function signUp() {
    // check if all fields are filled
    if (email === "" || password === "" || username === "" || phone === "") {
      show("Please fill all the fields.", "warning");
      return "Please fill all the fields";
    }

    try {
      // create a new user
      // createUserWithEmailAndPassword automatically checks for errors like email not existing so we don't need to check for them manually
      const newAcc = await context.signup(email, password);
      const newUser = newAcc.user;

      const newDoc = await setDoc(doc(db, "users", newUser.uid), {
        userid: newUser.uid,
        username: username,
        email: email,
        phone_no: phone,
        createdAt: new Date()
      });

      // redirect to home page after successfully signing up
      router.push("/tracker");
    } catch (e: any) {
      if (e.code === "auth/invalid-email") {
        show("Invalid email", "danger");
      } else if (e.code === "auth/weak-password") {
        show("Weak password: should be at least 6 characters", "danger");
      } else {
        show("Sign up error: " + e, "danger");
      }
    }
    
  }

  const signIn = () => {
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <View>
        <View>
          {/* <Text style={styles.categoryTitle}>Username</Text> */}
          <TextInput 
            style={[styles.textBox, { 
              borderColor: isUsernameFocused ? "black" : "#cfcfcf",
              borderWidth: isUsernameFocused ? 2 : 1,
            }]}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            onFocus={() => setIsUsernameFocused(true)}
            onBlur={() => setIsUsernameFocused(false)}
          />
        </View>
        <View>
          {/* <Text style={styles.categoryTitle}>Phone number</Text> */}
          <TextInput 
            style={[styles.textBox, { 
              borderColor: isPhoneFocused ? "black" : "#cfcfcf",
              borderWidth: isPhoneFocused ? 2 : 1,
            }]}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            onFocus={() => setIsPhoneFocused(true)}
            onBlur={() => setIsPhoneFocused(false)}
          />
        </View>
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
      <Toast/>
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
  signUpButton: {
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 1,
    width: 280,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25
  },
  signUpBtnText: {
    fontSize: 22
  },
  signinLink: {
    color: "blue",
  },
  signinContainer: {
    flexDirection: "row",
    marginTop: 40,
  },
});