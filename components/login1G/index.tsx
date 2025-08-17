import { View, Text, Button, StyleSheet, Image } from "react-native"
import { useState } from "react";
import { GoogleSignin, User, statusCodes } from "@react-native-google-signin/google-signin"
import AsyncStorage from '@react-native-async-storage/async-storage';

// salvar
//await AsyncStorage.setItem('@token', '12345');
// ler
//const token = await AsyncStorage.getItem('@token');
// remover
//await AsyncStorage.removeItem('@token');

const API_URL = "https://apiconcord.dev.vilhena.ifro.edu.br";
// const API_URL = "http://192.168.1.106:9000";
const ASYNC_STORAGE_AUTH_KEY = "@key";

type Props = {
  screen: number;
  setScreen: React.Dispatch<React.SetStateAction<number>>;
  authKey: string | null
  setKey: React.Dispatch<React.SetStateAction<string | null>>;
};

interface GoogleLoginResponse {
  newAccount: boolean;
  key: string;
}

GoogleSignin.configure({
  webClientId: "427290146113-nv1kvo2d9e9iqk0g62n6pkkjoq2rp387.apps.googleusercontent.com",
  iosClientId: "427290146113-a0jecoj08h9i03rbfc868m1t5t4osc7q.apps.googleusercontent.com"
})

export default function Login1G({ screen, setScreen, authKey, setKey }: Props) {
  const [auth, setAuth] = useState<User | null>(null)

  async function handleGoogleSignIn() {
    try {
      await GoogleSignin.hasPlayServices()
      const signInResponse = await GoogleSignin.signIn() as any;
      const userInfo = signInResponse.data;
      setAuth(userInfo);
      console.log("------------------")
      console.log("Signed in successfully!", userInfo)
      await loginGoogle(userInfo.idToken);

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

  async function loginGoogle(credential: string): Promise<void> {
    const requestOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    };

    console.log("=-=-=-=-=-=")
    console.log(requestOptions)
    console.log("=-=-=-=-=-=")

    try {
      const resposta = await fetch(`${API_URL}/cadastrar/google`, requestOptions);

      if (resposta.ok) {
        const data: GoogleLoginResponse = await resposta.json();

        await AsyncStorage.setItem(ASYNC_STORAGE_AUTH_KEY, data.key);
        setKey(data.key)
        
        if (data.newAccount) {
          setScreen(0) //ALTERAR ISSO AQUI PRA PÀGINA LOGIN2 PELO AMOR DE DEUS NÃO ESQUECER
        } else {
          setScreen(5)
        }

      } else {
        console.warn("Erro na resposta:", resposta.status, resposta.statusText);
      }
    } catch (error) {
      console.warn("Erro na requisição:", error);
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
      <View style={styles.botao2} >
        <Button title="Login com formulário" onPress={() => setScreen(2)} ></Button>
      </View>
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
  },
  botao2: {
    marginTop: 20
  }
});