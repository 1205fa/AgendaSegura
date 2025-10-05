import React from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Caminho para a imagem do cofre. Se a imagem não aparecer, ajuste aqui.
import CofreImage from '../../imgem/cofre.png'; 

export default function LoginScreen() {
  // Inicializa o objeto de navegação para usar em 'onPress'
  const navigation = useNavigation(); 

  // 1. Função que será executada ao clicar no botão 'Entrar'
  const handleLogin = () => {
    // ATENÇÃO: A lógica de verificação de senha REAL virá aqui.
    // Para teste, a navegação é executada imediatamente:
    navigation.navigate('Cofre'); 
  };

  // 2. Função para o link de recuperação de senha
  const handleForgotPassword = () => {
    // Aqui virá a navegação para a tela de recuperação.
    Alert.alert("Recuperação", "Você será redirecionado para a tela de perguntas de segurança.");
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
        placeholder="Crie sua Senha"
        secureTextEntry
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
