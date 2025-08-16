import { View, Text, Button, StyleSheet, Image } from "react-native"
import { useState } from "react"
import { GoogleSignin, User, statusCodes } from "@react-native-google-signin/google-signin"

GoogleSignin.configure({
  webClientId: "427290146113-nv1kvo2d9e9iqk0g62n6pkkjoq2rp387.apps.googleusercontent.com",
  iosClientId: "427290146113-a0jecoj08h9i03rbfc868m1t5t4osc7q.apps.googleusercontent.com"
})

export default function App() {
  const [auth, setAuth] = useState<User | null>(null)

  async function handleGoogleSignIn() {
    try {
      await GoogleSignin.hasPlayServices()
      const signInResponse = await GoogleSignin.signIn() as any;
      const userInfo = signInResponse.data;
      setAuth(userInfo);
      console.log("Signed in successfully!", userInfo)
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("user cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("operation (e.g. sign in) is in progress already");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("play services not available or outdated");
      } else {
        console.error(error);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Concord</Text>
      <Button title="Entrar" onPress={handleGoogleSignIn}></Button>
      {auth &&
        <View style={styles.userInfoContainer}>
          {auth.user.photo && <Image source={{ uri: auth.user.photo }} style={styles.avatar} />}
          <Text>{auth.user.id}</Text>
          <Text>{auth.user.email}</Text>
        </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  texto: {
    color: "red",
    fontSize: 24,
    marginBottom: 20,
  },
  userInfoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  }
});