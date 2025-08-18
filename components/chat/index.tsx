import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, TextInput, StyleSheet, Platform } from 'react-native';
import socket from "./socket";
import { fetchFriends, addInChat, chatDados } from "./otherThings";

type Props = {
    data: {
        id: number, chatNome: string, foto: number, membros: string
    }
    setOnChat: React.Dispatch<React.SetStateAction<boolean>>;
    authKey: string | null;
};

interface ChatDados {
    id: number;
    chatNome: string;
    foto: number;
    membros: string;
    tipo?: number;
    adms?: string;
    dataCriacao?: string;
    descricao?: string;
}

type historicoResponse = {
    response: {
        dataEnvio: string;
        foto: number;
        mensageId: number;
        mensagem: string;
        nome: string;
        remetente: number;
    }[];
}

type Mensagem = {
    dataEnvio: string;
    foto: number;
    mensageId: number;
    mensagem: string;
    nome: string;
    remetente: number;
}

type NewMessage = {
    response: {
        dataEnvio: string;
        foto: number;
        mensageId: number;
        mensagem: string;
        nome: string;
        remetente: number;
    }
}

type isMediaChatOpen = {
    isOpen: boolean;
}

//{ mensagem: menssageID, dataDeletado: Date.now() }

type DeleteMessage = {
    mensagem: number;
    dataDeletado: string;
}

//{ mensagem: menssageID, dataEdicao: Date.now(), mensagemNova: mensagem }
type EditMessage = {
    mensagem: number;
    dataEdicao: string;
    mensagemNova: string;
}

//mensageId,membros, arquivoNome, tipo, conteudo, criadoEm, remetente, foto, nome
type mediaHistory = {
    response: {
        mensageId: number;
        membros: string;
        arquivoNome: string;
        tipo: string;
        conteudo: number[];
        criadoEm: string;
        remetente: number;
        foto: number;
        nome: string;
    }[];
}

type Media = {
    nome: string;
    mensageId: number;
    url: string;
    tipo: string;
    foto: number;
    arquivoNome: string;
    remetente: number;
    criadoEm: string;
    membros: string;
};

//mensageId, membros, arquivoNome, tipo, conteudo, criadoEm, remetente, foto, nome
type newMedia = {
    response: {
        mensageId: number;
        membros: string;
        arquivoNome: string;
        tipo: string;
        conteudo: number[];
        criadoEm: string;
        remetente: number;
        foto: number;
        nome: string;
    };
}

type PreMessage = {
    key: string;
    mensagem: string;
    chatID: number
}


export default function Chat({ data, setOnChat, authKey }: Props) {
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

    const [chatData, setChatData] = useState<ChatDados>(data);
    const [friends, setFriends] = useState([]);
    const [tipos, setTipos] = useState<boolean>(false)
    const [adm, setAdm] = useState<boolean>(false)
    const [data2, setData2] = useState<PreMessage>()
    const [nomes, setNomes] = useState<Mensagem[]>([]);
    const [medias, setMedias] = useState<Media[]>([]);
    const [inMediaChat, setInMediaChat] = useState(false);
    const [conectado, setConectado] = useState(true);
    const [mediaChatOpened, setMediaChatOpened] = useState(false);
    const [texto, setTexto] = useState<string>('');
    const [altura, setAltura] = useState<number>(40); // altura inicial

    function enviarMensagem() {
        if (data2 == undefined) {
            return
        }
        data2.mensagem = texto;
        if (data2.mensagem.trim() !== '') {
            socket.emit("addMessage", data2);
            setTexto("");
            setData2({
                ...data2,
                mensagem: ""
            });
        }
    }


    useEffect(() => {
        const fetchFriendsData = async () => {
            try {
                if (!authKey) {
                    console.error("authKey is null");
                    return;
                }
                const friendsData = await fetchFriends(authKey);
                setFriends(friendsData);
            } catch (error) {
                console.error("Erro ao buscar amigos:", error);
            }
        };

        fetchFriendsData();

        const func = async () => {
            if (!authKey) {
                console.error("authKey is null");
                return;
            }
            const response = await chatDados(data.id, authKey);
            if (response) {
                setChatData(response);
                setTipos(response.tipo === 1);
                if (response.tipo == 2) { // Se o chat for privado, não contém admins
                    return
                }
                const valor = data.id;
                const array = response.adms.split(",").map(Number);

                if (array.includes(valor)) {
                    setAdm(true)
                }
            }
        }
        func();
    }, []);

    useEffect(() => {
        if (!data || data == undefined) {
            console.error("Chat ID não encontrado. Redirecionando para contatos.");
            window.location.href = "/contatos"; // Redireciona para a página de contatos
            return;
        }
        setData2({
            "key": `${authKey}`,
            "mensagem": "",
            "chatID": data.id
        })

        // Conecta ao socket

        socket.connect();
        socket.emit("todas", { key: authKey, chatID: data.id });
        socket.emit("isMediaChatOpen", { key: authKey, chatID: data.id });
        const desconectar = () => {
            socket.disconnect();
        };

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const handleHistorico = (response: historicoResponse) => {
            setNomes(response.response)
        };
        const handleMediaChatOpened = () => {
            socket.emit("isMediaChatOpen", { key: authKey, chatID: data.id });
        };
        const handleNewMessage = (response: NewMessage) => {
            if (response.response?.mensagem) {
                setNomes((prev) => [...prev, response.response]);
            }
        };
        const handleMediaChatStatus = (response: isMediaChatOpen) => {
            setMediaChatOpened(response.isOpen);
        };
        const handleDelete = (data: DeleteMessage) => {
            const { mensagem } = data;
            setNomes(prev => prev.filter(nome => nome.mensageId !== mensagem));
        };
        const handleEdit = (data: EditMessage) => {
            const { mensagem, mensagemNova } = data;
            setNomes((prev) =>
                prev.map((msg) =>
                    msg.mensageId === mensagem ? { ...msg, mensagem: mensagemNova } : msg
                )
            );
        };
        const handleDisconnect = () => setConectado(false);
        const handleReconnect = () => {
            socket.emit("reconnect", { key: authKey, chatID: data.id });
        };
        const handleMediaHistory = (data: mediaHistory) => {
            setMedias([]);

            for (const media of data.response) {
                // Reconstruir buffer → Blob
                const byteArray = new Uint8Array(media.conteudo);
                const blob = new Blob([byteArray], { type: media.tipo });

                // Gerar URL temporária para exibir
                const url = URL.createObjectURL(blob);

                setMedias((prev) => [...prev, { nome: media.nome, mensageId: media.mensageId, url, tipo: media.tipo, foto: media.foto, arquivoNome: media.arquivoNome, remetente: media.remetente, criadoEm: media.criadoEm, membros: media.membros }]);
            }

            //setMedias(data.response);
            const primeira = data.response[0]
            const membros = primeira.membros.split(",");
            // se o seu id estiver na lista de membros, então você está no chat de mídia
            if (authKey == null) return;

            if (membros.includes(authKey.split("-")[0])) {
                setInMediaChat(true);
            } else {
                setInMediaChat(false);
            }
        }

        const handleNewMedia = (data: newMedia) => {
            const media = data.response;
            // Reconstruir buffer → Blob
            const byteArray = new Uint8Array(media.conteudo);
            const blob = new Blob([byteArray], { type: media.tipo });

            // Gerar URL temporária para exibir
            const url = URL.createObjectURL(blob);

            setMedias((prev) => [...prev, { nome: media.nome, mensageId: media.mensageId, url, tipo: media.tipo, foto: media.foto, arquivoNome: media.arquivoNome, remetente: media.remetente, criadoEm: media.criadoEm, membros: media.membros }]);
        }

        // Registrar listeners
        socket.on("historico", handleHistorico); // Feito
        socket.on("mediaChatOpened", handleMediaChatOpened); // Feito
        socket.on("newMessage", handleNewMessage);//Feito
        socket.on("mediaChatStatus", handleMediaChatStatus);//Feito
        socket.on("deletar", handleDelete);//Feito
        socket.on("editar", handleEdit); //Feito
        socket.on("disconnect", handleDisconnect);//Feito
        socket.on("newMedia", handleNewMedia) //Sem Medias no mobile ainda

        socket.on("disconnect", (reason) => {
            console.warn("Socket desconectado:", reason);
        });

        socket.on("connect_error", (err) => {
            console.error("Erro de conexão:", err.message);
        });

        socket.on("reconnect", handleReconnect);
        socket.on("mediaHistory", handleMediaHistory);

        // Limpar ao desmontar
        return () => {
            socket.off("historico", handleHistorico);
            socket.off("mediaChatOpened", handleMediaChatOpened);
            socket.off("newMessage", handleNewMessage);
            socket.off("mediaChatStatus", handleMediaChatStatus);
            socket.off("deletar", handleDelete);
            socket.off("editar", handleEdit);
            socket.off("disconnect", handleDisconnect);
            socket.off("reconnect", handleReconnect);
            socket.off("mediaHistory", handleMediaHistory);
            socket.off("newMedia", handleNewMedia)
        };
    }, [chatData]);

    return (
        <View>
            {nomes.map((nome) => (
                <View key={nome.mensageId}>
                    <Text>{nome.mensagem}</Text>
                </View>
            ))}
            <View>
                <TextInput
                    placeholder="Escreva algo..."
                    value={texto}
                    onChangeText={setTexto}
                    multiline={true}
                    textAlignVertical="top"
                    onContentSizeChange={(event) => {
                        const novaAltura = event.nativeEvent.contentSize.height;
                        setAltura(Math.min(novaAltura, 200)); // altura máxima 200
                    }}
                />
                <Button title='>Enviar<' onPress={() => {
                    enviarMensagem()
                }} ></Button>
            </View>
        </View>
    )
}