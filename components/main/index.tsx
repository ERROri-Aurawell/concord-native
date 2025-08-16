import { Text, View, Button, Image, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import React, { useState, useEffect } from 'react';


export default function Main() {
    const [amigos, setAmigos] = useState<Chat[]>([]);
    const [amigosOriginal, setAmigosOriginal] = useState<Chat[]>([]);
    const [vazio, setVazio] = useState<boolean>(false);
    const [busca, setBusca] = useState('');
    const key = "1-viniciusavila4080@gmail.com-7db940709d83364a8257d6f361b6e13d21622e40"
    const [dados, setDados] = useState("{ \"nome\": \"Aurawell\" }")

    interface Data {
        nome: string
    }

    interface Chat {
        chatNome: string; // Parece ser uma string JSON
        foto: number;
        id: number;
        membros: string;
        tipo: number;
    }


    async function adicionar(key: string): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: { "Content-Type": "application/json" },
        };

        try {
            const rota = "https://apiconcord.dev.vilhena.ifro.edu.br";
            //const rota = "http://localhost:9000";
            const resposta = await fetch(`${rota}/chats/${key}`, requestOptions);

            const data: Chat[] | { response: string } = await resposta.json();

            if (resposta.ok) {
                // Se nenhum chat for encontrado
                if ('response' in data && data.response === "Nenhum chat encontrado.") {
                    setAmigos([]);
                    setAmigosOriginal([]);
                    setVazio(true);
                    return;
                }

                // Se for um array de chats
                if (Array.isArray(data)) {
                    setAmigos(data);
                    setAmigosOriginal(data); // Guardar o original
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        adicionar(key)
    }, [])

    useEffect(() => {
        async function filterAmigos() {
            if (amigosOriginal.length > 0) {
                const nomesBusca = amigosOriginal.filter((nome) =>
                    nome.chatNome.toLowerCase().includes(busca.toLowerCase())
                );
                setAmigos(nomesBusca);
            } else {
                setAmigos([]); // Ensure amigos is empty when original is empty
            }
        }

        filterAmigos();
    }, [busca]);
    return (
        <View>
            <View style={styles.arruma2}>
                <TextInput
                    style={styles.pesquisa}
                    value={busca}
                    onChangeText={(text) => setBusca(text)}
                    placeholder="Pesquisar contato"
                />
            </View>
            {amigos.map((contato) => {
                let displayName = contato.chatNome;

                if (contato.tipo == 2) { // Se for um contato normal
                    // Separa "[\"1\"",\"2\""]" em [1,2] e pega o nome que é diferente do próprio
                    try {
                        const membros : string[] = JSON.parse(contato.chatNome);
                        const userNome = JSON.parse(dados).nome;
                        const filtrado = membros.filter(item => item !== userNome); // Filtra o nome do usuário atual
                        displayName = filtrado[0]; // Pega o primeiro nome filtrado

                    } catch (error) {
                        console.error("Erro ao processar o nome:", error);
                    }
                } else {

                    const userNome = JSON.parse(contato.chatNome);

                    displayName = userNome[0]
                }
                return (
                    <View key={contato.id}>
                        <Text>{displayName}</Text>
                    </View>
                );
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    arruma2: {
        // equivalente ao seu styles.arruma2
        margin: 10,
        padding: 5,
    },
    pesquisa: {
        // equivalente ao seu styles.pesquisa
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
});