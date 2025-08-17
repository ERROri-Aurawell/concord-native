declare global {
  interface Array<T> {
    excludes(value: T): boolean;
  }
}

// 2. Implementar o método
Array.prototype.excludes = function <T>(this: T[], value: T): boolean {
  return !this.includes(value);
};

import { Text, View, Button, Image, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// salvar
//await AsyncStorage.setItem('@token', '12345');
// ler
//const token = await AsyncStorage.getItem('@token');
// remover
//await AsyncStorage.removeItem('@token');

AsyncStorage.clear()

import Login1 from "./components/login1"
import Login1G from "./components/login1G"
import Main from "./components/main"
import Loading from "./components/loading";
import Cadastrar from "./components/cadastrar"
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export default function Index() {
  const icons = [
    { image: require('./public/images/human.png'), name: "contatos", pageID: 4 },
    { image: require('./public/images/config.png'), name: "Config", pageID: 5 },
    { image: require('./public/images/novoContato.png'), name: "Procurar", pageID: 6 },
    { image: require('./public/images/copo vazio.jpg'), name: "teste", pageID: 7 },
    { image: require('./public/images/copo vazio.jpg'), name: "teste", pageID: 8 },

  ]

  const lista: number[] = [0, 1, 2, 3, 4];

  const screens = [
    { name: "loading", page: Loading },
    { name: "login1G", page: Login1G },
    { name: "loggin1", page: Login1 },
    { name: "loggin2", page: Login1 },
    { name: "cadastrar", page: Cadastrar },
    { name: "main", page: Main },
    { name: "config", page: Login1 },
    { name: "inChat", page: Login1 },
    { name: "search", page: Login1 },
    { name: "chats", page: Login1 },
    { name: "block", page: Login1 },
    { name: "blocked", page: Login1 },
    { name: "createChat", page: Login1 }
  ]

  const [sideMenu, setSideMenu] = useState(false)
  const [screen, setScreen] = useState<number>(0);
  const [authKey, setKey] = useState<string | null>(null);
  const CurrentScreen = screens[screen].page;

  useEffect(() => {
    AsyncStorage.getItem('@key')
      .then((key: string | null) => {
        if (key === null) {
          console.log("Sem chave");
          setScreen(2);
        } else {
          console.log("Com chave:", key);
          setKey(key);   // <- atualiza o estado
          setScreen(5);
        }
      })
      .catch((error) => {
        console.error("Erro ao ler a chave:", error);
      });
  }, []); // só executa uma vez ao monta

  //native

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {lista.excludes(screen) && <View >
        {sideMenu && <View style={styles.openClose} >
          {icons.map((icon, index) => (
            <TouchableOpacity key={`${icon.name}-${index}`} style={styles.button} onPress={() => setScreen(icon.pageID)}>
              <Image
                source={icon.image}
                style={styles.icon}
              />
              <Text style={styles.text}>{icon.name}</Text>
            </TouchableOpacity>
          ))}
        </View>}

        <Button title=">" onPress={() => setSideMenu(prev => !prev)} />
      </View>}
      <View style={styles.fundo}>
        <CurrentScreen screen={screen} setScreen={setScreen} authKey={authKey} setKey={setKey} />
      </View>

    </View>
  );
}


const styles = StyleSheet.create({
  openClose: {
    position: 'absolute', // fixa na tela
    top: 0,
    left: 0,
    bottom: 0,
    width: 120, // largura da barra lateral
    backgroundColor: 'gray',
    flexDirection: 'column',
    paddingTop: 20, // se quiser espaçamento no topo
  },
  button: {
    flexDirection: 'row', // imagem e texto lado a lado
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  fundo: {
    position: "absolute",
  }
}); 