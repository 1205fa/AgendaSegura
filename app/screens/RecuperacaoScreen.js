import React from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // Biblioteca de segurança

export default function RecuperacaoScreen() {
  const [resposta, setResposta] = React.useState('');

  const verificarResposta = async () => {
    // Lógica de verificação será codificada aqui depois
    let respostaSalva = await SecureStore.getItemAsync('chave_secreta_recuperacao');

    if (respostaSalva === resposta) {
      alert("Sucesso! Você pode redefinir a senha.");
      // Navegação para a tela de redefinição
    } else {
      alert("Resposta incorreta.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperação de Senha</Text>
      <Text style={styles.pergunta}>Qual o nome do seu primeiro animal de estimação?</Text>

      <TextInput
        style={styles.input}
        placeholder="Sua Resposta Secreta"
        secureTextEntry
        value={resposta}
        onChangeText={setResposta}
      />

      <Button title="Verificar Resposta" onPress={verificarResposta} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, marginBottom: 20 },
  pergunta: { fontSize: 16, marginBottom: 10 },
  input: { width: '80%', padding: 10, borderWidth: 1, borderColor: '#ccc', marginBottom: 20 },
});
