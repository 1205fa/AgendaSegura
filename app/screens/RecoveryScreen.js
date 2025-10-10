import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

// --- CHAVES DE SEGURANÇA ---
const SECURITY_ANSWER = "minhaprimeiraprograma"; // A resposta MESTRA para o reset (guardada de forma secreta)
const SECURITY_QUESTION = "Qual foi o seu primeiro projeto de programação?"; 
const PASSWORD_KEY = "userPassword"; // Chave onde a senha é salva em SecureStore

export default function RecoveryScreen() {
  const navigation = useNavigation();
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState(1); // 1: Pergunta, 2: Redefinir Senha

  // Função que verifica a resposta de segurança
  const handleVerify = () => {
    if (answer.toLowerCase().trim() === SECURITY_ANSWER) {
      setStage(2); // Avança para a redefinição
      Alert.alert("Sucesso!", "Resposta correta. Agora defina sua nova senha.");
    } else {
      Alert.alert("Erro", "Resposta incorreta. Tente novamente.");
    }
  };

  // Função que salva a nova senha
  const handleResetPassword = async () => {
    if (newPassword.length < 4) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 4 caracteres.");
      return;
    }
    
    try {
      // Salva a nova senha criptografada
      await SecureStore.setItemAsync(PASSWORD_KEY, newPassword);
      
      Alert.alert("Sucesso!", "Sua senha foi redefinida com sucesso!");
      navigation.navigate('Login'); // Volta para a tela de login
      
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar a nova senha.");
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperação de Senha</Text>

      {stage === 1 ? ( // STAGE 1: Pergunta de Segurança
        <View style={styles.content}>
          <Text style={styles.question}>{SECURITY_QUESTION}</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua resposta secreta"
            value={answer}
            onChangeText={setAnswer}
          />
          <Button title="Verificar" onPress={handleVerify} />
        </View>
      ) : ( // STAGE 2: Redefinir Senha
        <View style={styles.content}>
          <Text style={styles.question}>Nova Senha:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a nova senha"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Button title="Redefinir Senha" onPress={handleResetPassword} />
        </View>
      )}
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
        <Text style={styles.backButtonText}>Voltar para Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  content: {
    width: '80%',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  backButton: {
    marginTop: 30,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 14,
  }
});
