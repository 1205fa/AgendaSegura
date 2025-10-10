import React, { useState } from 'react'; // Adicionado useState
import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store'; 

// Caminho CORRIGIDO para a imagem do logo (usando o arquivo que está em assets/)
import CofreImage from '../../assets/meu_logo_final.png'; 

// --- CHAVE DE SEGURANÇA MESTRA ---
const PASSWORD_KEY = "userPassword"; 

export default function LoginScreen() {
  const navigation = useNavigation(); 
  const [password, setPassword] = useState(''); 

  // 1. Função que será executada ao clicar no botão 'Entrar'
  const handleLogin = async () => {
    // Lógica de verificação de senha REAL
    const savedPassword = await SecureStore.getItemAsync(PASSWORD_KEY);
    
    // Se não houver senha salva, o cliente é levado para a tela de Cofre 
    // (que o forçará a criar uma senha mestra, corrigindo o bug de segurança)
    if (!savedPassword) {
        navigation.navigate('Cofre');
        return;
    }

    if (password === savedPassword) {
        navigation.navigate('Cofre');
    } else {
        Alert.alert("Erro de Login", "Senha incorreta.");
    }
  };

  // 2. Função para o link de recuperação de senha 
  const handleForgotPassword = () => {
    navigation.navigate('Recovery'); 
  };

  return (
    <View style={styles.container}>
      {/* 1. Imagem do Cofre */}
      <Image
        source={CofreImage}
        style={styles.image}
        resizeMode="contain"
      />
      
      {/* 2. Título da Tela */}
      <Text style={styles.title}>AgendaSegura</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Digite sua Senha"
        secureTextEntry
        onChangeText={setPassword} 
      />
      
      {/* 3. Botão de Login Principal */}
      <Button title="Entrar" onPress={handleLogin} />
      
      {/* 4. Link de Recuperação */}
      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
        <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
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
  image: {
    width: 150, 
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  forgotPasswordButton: {
    marginTop: 15,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  }
});
