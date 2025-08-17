import { Animated, View, Text, StyleSheet } from "react-native";
import { useState, useEffect, useRef } from "react";

type Props = {
  screen: number;
  setScreen: React.Dispatch<React.SetStateAction<number>>;
  authKey: string | null
  setKey: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function Loading({ screen, setScreen, authKey, setKey }: Props) {
  const levels = ["", ".", "..", "..."];
  const [dot, setDot] = useState<number>(0);
  const rotacao = useRef(new Animated.Value(0)).current; // valor animado

  // função para girar até certo valor
  const girar = (angulo: number) => {
    Animated.timing(rotacao, {
      toValue: angulo,
      duration: 300, // 0.3s
      useNativeDriver: true,
    }).start();
  };

  // valor animado convertido em string com "deg"
  const rotacaoInterpolada = rotacao.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    let angulo = 0;
    const interval = setInterval(() => {
      setDot((prevDot) => (prevDot + 1) % levels.length);
      angulo += 45; // gira de 45 em 45
      girar(angulo);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Carregando{levels[dot]}</Text>
      <Animated.Image
        style={{
          width: 80,
          height: 80,
          transform: [{ rotate: rotacaoInterpolada }],
        }}
        source={require("../../public/images/logo.png")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  text: {
    fontSize: 18,
    marginBottom: 16,
  },
});
