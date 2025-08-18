import { io } from 'socket.io-client';

const URL = "https://apiconcord.dev.vilhena.ifro.edu.br";

export const socket = io(URL, {
  transports: ["websocket"],
  autoConnect: false,
  reconnection: false
});


socket.on('connect_error', (err) => {
  console.error('Erro de conexão com o servidor Socket.IO:', err.message);
});

socket.on('connect_timeout', () => {
  console.error('Tempo de conexão esgotado ao tentar conectar ao servidor Socket.IO.');
});

socket.on('disconnect', (reason) => {
  console.warn('Desconectado do servidor Socket.IO:', reason);
});

export default socket;