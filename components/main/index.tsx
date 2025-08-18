import { Text, View, Button, Image, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import React, { useState, useEffect } from 'react';

type Props = {
    screen: number;
    setScreen: React.Dispatch<React.SetStateAction<number>>;
    authKey: string | null
    setKey: React.Dispatch<React.SetStateAction<string | null>>;
    userData: string | null;
    setUserData: React.Dispatch<React.SetStateAction<string | null>>;
};

import Chat from "../chat";

export default function Main({ screen, setScreen, authKey, setKey, userData, setUserData }: Props) {
    const [amigos, setAmigos] = useState<Chat[]>([]);
    const [amigosOriginal, setAmigosOriginal] = useState<Chat[]>([]);
    const [vazio, setVazio] = useState<boolean>(false);
    const [busca, setBusca] = useState('');
    const [dados, setDados] = useState<string>(userData ?? "{}");
    const [onChat, setOnChat] = useState<boolean>(false);
    const [chatData, setChatData] = useState<chatData>({
        id: 0,
        chatNome: "",
        foto: 0,
        membros: ""
    })

    const icons = [
        require("../../public/images/eclipse1.png"),
        require("../../public/images/eclipse2.png"),
        require("../../public/images/eclipse3.png"),
        require("../../public/images/eclipse4.png"),
        require("../../public/images/eclipse5.png"),
        require("../../public/images/eclipse6.png"),
        require("../../public/images/eclipse7.png"),
        require("../../public/images/eclipse8.png"),
    ];
    const human = require("../../public/images/human.png");

    interface chatData {
        id: number;
        chatNome: string;
        foto: number;
        membros: string;
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
        if (authKey != null && userData != null) {
            adicionar(authKey)
        }
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

    if (!onChat) return (
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
                        const membros: string[] = JSON.parse(contato.chatNome);
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

                if (userData !== null) {
                    const fotoIndex = contato.foto - 1;
                    const fotoSource =
                        contato.foto === 0 || fotoIndex < 0 || fotoIndex >= icons.length
                            ? human
                            : icons[fotoIndex];
                    return (
                        <View key={contato.id} style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}>
                            <Image
                                source={fotoSource}
                                style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
                            />
                            <TouchableOpacity onPress={() => {
                                setChatData(
                                    {
                                        id: contato.id,
                                        chatNome: contato.chatNome,
                                        foto: contato.foto,
                                        membros: contato.membros
                                    }
                                );
                                setOnChat(true)
                            }} >
                                <Text>{displayName}</Text>
                            </TouchableOpacity>
                        </View>
                    );
                } else {
                    return (
                        <View>
                            <Text>userData está vazio</Text>
                        </View>
                    )
                }
            })}
        </View>
    )
    //id: nome.id, nome: nome.chatNome, foto: nome.foto, membros: nome.membros
    return (
        <View>
            <Chat data={chatData} setOnChat={setOnChat} authKey={authKey} ></Chat>
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