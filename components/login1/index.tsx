import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
    screen: number;
    setScreen: React.Dispatch<React.SetStateAction<number>>;
    authKey: string | null
    setKey: React.Dispatch<React.SetStateAction<string | null>>;
    userData: string | null;
    setUserData: React.Dispatch<React.SetStateAction<string | null>>;
};

interface loginResponse {
    newAccount: boolean;
    key: string;
}

interface dataRequest {
    descricao: string;
    filtros: string | number;
    foto: number;
    id: number;
    nome: string;
}

//{"descricao": "Novo no Concord!", "filtros": "1", "foto": 2, "id": 19, "nome": "Andrew"}

const API_URL = "https://apiconcord.dev.vilhena.ifro.edu.br";
//const API_URL = "http://192.168.1.106:9000";
const ASYNC_STORAGE_AUTH_KEY = "@key";

export default function Login1({ screen, setScreen, authKey, setKey, userData, setUserData }: Props) {
    const [email, setEmail] = useState<string>('');
    const [senha, setSenha] = useState<string>('');

    function splitKEY(key: string) {
        const [id, ...rest] = key.split("-");
        const after = rest.join("-");
        const [email, ...rest2] = after.split("-");
        const senha = rest2.join('-');

        return [id, email, senha];
    }

    async function getData(chave: string) {
        const requestOptions = {
            method: 'GET',
            headers: { "Content-Type": "application/json" },
        }
        try {
            const resposta = await fetch(`https://apiconcord.dev.vilhena.ifro.edu.br/user/${splitKEY(chave)[0]}`, requestOptions);
            if (resposta.ok) {
                // mano?
                const data: dataRequest = await resposta.json();
                const dataString : string = JSON.stringify(data)
                await AsyncStorage.setItem("@userData", dataString);
                setUserData(dataString)
                return true
            }
            return false

        } catch (error) {
            console.error(error);
            return false
        }
    }

    async function login(email: string, senha: string): Promise<void> {
        const requestOptions: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "email": email, "senha": senha }),
        };

        try {
            const resposta = await fetch(`${API_URL}/login/`, requestOptions);
            if (resposta.ok) {
                const data: loginResponse = await resposta.json();
                const response2: boolean = await getData(data.key);

                if (!response2) {
                    Alert.alert("Erro ao puxar dados do perfil")
                    return
                }

                await AsyncStorage.setItem(ASYNC_STORAGE_AUTH_KEY, data.key);
                setKey(data.key)
                if (data.newAccount) {
                    setScreen(0) //ALTERAR ISSO AQUI PRA PÀGINA LOGIN2 PELO AMOR DE DEUS NÃO ESQUECER
                } else {
                    setScreen(5)
                }

            } else {
                console.warn("Erro na resposta:", resposta.status, resposta.statusText);
                Alert.alert("Erro na resposta:", resposta.statusText)
            }
        } catch (error) {
            console.warn("Erro na requisição:", error);
        }
    }

    const handleSubmit = async () => {
        if (!email || !senha) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }
        //Alert.alert('Sucesso', `\nEmail: ${email}`);

        await login(email, senha);
    };
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu email"
                keyboardType="email-address"
            />

            <Text style={styles.label}>Senha:</Text>
            <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                placeholder="Digite sua senha"
                secureTextEntry
            />

            <Button title="Enviar" onPress={handleSubmit} />

            <View style={styles.botao2} >
                <Button title="Criar Conta" onPress={() => setScreen(4)} ></Button>
            </View>

            <View style={styles.botao2} >
                <Button title="Login com Google" onPress={() => setScreen(1)} ></Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    label: { marginTop: 10 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginTop: 5,
    },
    botao2: {
        marginTop: 20
    }
});