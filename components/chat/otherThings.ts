const rota = "https://apiconcord.dev.vilhena.ifro.edu.br";
// const rota = "http://localhost:9000";
export async function fetchFriends(authKey: string) {
  const requestOptions = {
    method: 'GET',
    headers: { "Content-Type": "application/json" },
  };
  try {
    const response = await fetch(`${rota}/friends/${authKey}`, requestOptions);
    if (response.ok) {
      const data = await response.json();
      //console.log("Amigos:", data);

      if (data.length === 0) {
        return []; // Return an empty array if no friends found
      } else {
        return data; // Return the list of friends
      }
    } else {
      console.error("Failed to fetch friends:", response);
    }
  }
  catch (error) {
    console.error("Error fetching friends:", error);
  }
}

export async function addInChat(pessoaId : number, chatId : number, authKey: string) {
  console.log(`Adicionar o ${pessoaId} no chat_${chatId}`);

  const requestOptions = {
    method: 'PATCH',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "userID": pessoaId, "chatID": chatId })
  };
  try {
    const response = await fetch(`${rota}/addInChat/${authKey}`, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log("Amigos:", data);

      return true

    } else {
      const data = await response.json();
      //alert(data.response +" : err "+ response.status)
    }
  }
  catch (error) {
    console.error("Error :", error);
  }
}

interface ChatDados {
    id: number;
    chatNome: string;
    foto: number;
    membros: string;
    tipo: number;
    adms: string;
    dataCriacao: string;
    descricao: string;
}

//{"adms": "1", "chatNome": "[\"Grupo\", \"undefined\"]", "dataCriacao": "2025-07-10T23:10:26.000Z", "id": 8, "membros": "1,4,10,14", "tipo": 1}

export async function chatDados(chatId : number, authKey: string) {
  const response = await fetch(`${rota}/chatInfo/${authKey}/${chatId}`)
  if (response.ok) {
    const data : ChatDados[] = await response.json();

    //console.log("-------------\ndados do grupo : ")
    //console.log(data[0])

    return data[0]
  }
}