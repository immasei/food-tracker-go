import React, { useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  FlatList,
  GestureResponderEvent,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../components/Toast";

// import firebaseApp from "../../config/firebaseConfig";
// import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
// import { getFirestore, collection, getDocs } from "firebase/firestore";

// get a reference to the database to use it in this file
// const db = getFirestore(firebaseApp);
// const auth = getAuth(firebaseApp);

type Props = {};

const Login = (props: Props) => {
  const { show, Toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPwdFocused, setIsPwdFocused] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const router = useRouter();
  const context = useContext(AuthContext);

  async function login() {
    // check if all fields are filled
    if (email === "" || password === "") {
      show("Please fill all the fields", "warning");
      return "Please fill all the fields";
    }

    // log in if user exists, otherwise, display error
    try {
      await context.login(email, password);
      router.push("/tracker");

    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        show("ERR: User does not exist", "danger");
      } else if (e.code === "auth/wrong-password") {
        show("ERR: Either email or password is wrong", "danger");
      } else if (e.code === "auth/invalid-email") {
        show("ERR: Invalid email", "danger");
      } else if (e.code === "auth/invalid-credential") {
        show("ERR: Invalid credentials", "danger");
      } else {
        show("ERR: Login error: " + e, "danger");
      }
    }
  }

  const signUp = () => {
    router.push("/signup");
  };

  return (
    // <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
      <Toast/>
    </View>
    // </TouchableWithoutFeedback>
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