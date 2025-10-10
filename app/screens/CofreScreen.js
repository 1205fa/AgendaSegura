import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import { View, Text, StyleSheet, Button, Alert, TextInput } from 'react-native'; // Adicionado TextInput
import * as MediaLibrary from 'expo-media-library'; 
import * as ImagePicker from 'expo-image-picker'; 
import * as FileSystem from 'expo-file-system/legacy'; 
import * as Sharing from 'expo-sharing'; 
import * as SecureStore from 'expo-secure-store'; // Para gerenciar a Senha Mestra
import { useNavigation } from '@react-navigation/native';

// --- CHAVES DE SEGURANÇA E DIRETÓRIOS ---
const COFRE_DIR = `${FileSystem.documentDirectory}CofreSeguro/`;
const PASSWORD_KEY = "userPassword"; // Chave da Senha Mestra

export default function CofreScreen() {
  const navigation = useNavigation();
  const [passwordNeeded, setPasswordNeeded] = useState(false); // Estado para forçar criação de senha
  const [newMasterPassword, setNewMasterPassword] = useState(''); // Senha temporária

  // --- LÓGICA DE VERIFICAÇÃO E CRIAÇÃO DA SENHA MESTRA ---
  useEffect(() => {
    const checkPassword = async () => {
      const savedPassword = await SecureStore.getItemAsync(PASSWORD_KEY);
      if (!savedPassword) {
        setPasswordNeeded(true); // Se não houver senha, forçamos a criação
      }
    };
    checkPassword();
  }, []);

  const handleSetMasterPassword = async () => {
    if (newMasterPassword.length < 4) {
      Alert.alert("Erro", "A senha mestra deve ter pelo menos 4 caracteres.");
      return;
    }
    
    try {
      // Salva a senha mestra de forma criptografada
      await SecureStore.setItemAsync(PASSWORD_KEY, newMasterPassword);
      setPasswordNeeded(false); // Libera o cofre
      Alert.alert("Sucesso!", "Senha mestra criada e salva com segurança!");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar a senha mestra.");
      console.error(e);
    }
  };

  // --- SEÇÃO DE RENDERIZAÇÃO CONDICIONAL (PRIORIDADE) ---
  // Se a senha precisar ser criada, mostramos um modal obrigatório.
  if (passwordNeeded) {
    return (
      <View style={styles.passwordContainer}>
        <Text style={styles.passwordTitle}>CRIAÇÃO DA SENHA MESTRA</Text>
        <Text style={styles.passwordSubtitle}>
            Você precisa definir uma senha para proteger seu cofre.
            Esta será a sua senha única de acesso.
        </Text>
        <TextInput
          style={styles.passwordInput}
          placeholder="Digite a nova senha mestra (mín. 4 dígitos)"
          secureTextEntry
          value={newMasterPassword}
          onChangeText={setNewMasterPassword}
        />
        <Button title="Criar Senha e Abrir Cofre" onPress={handleSetMasterPassword} color="#e53935" />
      </View>
    );
  }

  // --- O RESTO DO CÓDIGO (Quando a senha já existe) ---

  const requestAllPermissions = async () => { 
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPerm = await MediaLibrary.requestPermissionsAsync();
    if (cameraPerm.status !== 'granted' || mediaPerm.status !== 'granted') {
      Alert.alert("Permissão Necessária", "O aplicativo precisa de acesso à Câmera e à Galeria para funcionar.");
      return false;
    }
    return true;
  };

  const handleActionWithConfirmation = (actionType, onConfirm) => { 
    Alert.alert(
      "Confirmação Necessária",
      `Você tem certeza que deseja ${actionType}? Esta ação é irreversível.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim, Tenho Certeza", onPress: onConfirm }
      ]
    );
  };

  const saveMediaToCofre = async (localUri, mediaType) => { 
    try {
      await FileSystem.makeDirectoryAsync(COFRE_DIR, { intermediates: true });
      const fileName = localUri.split('/').pop();
      const newPath = COFRE_DIR + fileName;
      await FileSystem.moveAsync({ from: localUri, to: newPath });
      Alert.alert("Sucesso!", `${mediaType} salvo e escondido no cofre!`);
    } catch (error) {
      Alert.alert("Erro de Salvamento", `Não foi possível mover o ${mediaType.toLowerCase()} para o cofre.`);
      console.error("Erro ao salvar no cofre:", error);
    }
  };


  const takePhotoAndSave = async () => { 
    if (!(await requestAllPermissions())) return;
    let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      await saveMediaToCofre(result.assets[0].uri, "Foto");
    }
  };

  const recordVideoAndSave = async () => { 
    if (!(await requestAllPermissions())) return;
    let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 1, videoMaxDuration: 3600 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      await saveMediaToCofre(result.assets[0].uri, "Vídeo");
    }
  };
  
  const selectMediaAndHide = async () => { 
    if (!(await requestAllPermissions())) return;
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, allowsMultipleSelection: false });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      await saveMediaToCofre(result.assets[0].uri, "Mídia (Galeria)");
    }
  };

  const deleteCofreContent = async () => { 
    try {
      const dirInfo = await FileSystem.getInfoAsync(COFRE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(COFRE_DIR, { idempotent: true });
        Alert.alert("Sucesso!", "Todo o conteúdo do Cofre foi permanentemente excluído.");
      } else {
        Alert.alert("Aviso", "O Cofre já está vazio.");
      }
    } catch (error) {
      Alert.alert("Erro de Exclusão", "Não foi possível excluir o conteúdo do cofre.");
      console.error("Erro ao deletar cofre:", error);
    }
  };

  const hideAndEncryptContacts = async () => { 
    try {
      Alert.alert("Sucesso", "A lógica de criptografia foi simulada! O próximo passo real seria mover ou criptografar os dados.");
    } catch (error) {
      Alert.alert("Erro", "Falha ao tentar criptografar.");
    }
  };

  const exportCofreContent = async () => { 
    try {
      const backupFileName = 'AgendaSegura_Backup_Seguro.txt';
      const backupPath = FileSystem.cacheDirectory + backupFileName;
      await FileSystem.writeAsStringAsync(backupPath, 'Este arquivo simula o backup criptografado do seu cofre.', { encoding: FileSystem.EncodingType.UTF8 });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Erro", "O compartilhamento de arquivos não está disponível neste dispositivo.");
        return;
      }
      Alert.alert(
        "Backup Pronto!",
        "Agora, selecione onde deseja salvar o seu arquivo de backup seguro. Salve-o no seu Google Drive ou em um local seguro!",
        [{ text: "OK, Compartilhar Agora", onPress: async () => {
          await Sharing.shareAsync(backupPath, { mimeType: 'text/plain', dialogTitle: 'Salvar Arquivo de Backup do AgendaSegura' });
        }}]
      );
    } catch (error) {
      Alert.alert("Erro", "Falha ao exportar o conteúdo do cofre.");
      console.error("Erro ao exportar cofre:", error);
    }
  };

  const importCofreContent = async () => { 
    Alert.alert("Funcionalidade Pendente", "A importação/restauração de arquivos de backup será implementada aqui.");
  };

  // --- Botões e Componentes (Visível apenas após criar a senha) ---

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BEM-VINDO AO SEU COFRE!</Text>
      <Text style={styles.subtitle}>Sua agenda e mídias seguras estão aqui.</Text>
      
      {/* 1. GRUPO: Fotos e Filmagens */}
      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button title="TIRAR FOTO & ACOMPANHAR" onPress={takePhotoAndSave} color="#00bcd4" />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="FILMAR & ACOMPANHAR" onPress={recordVideoAndSave} color="#00bcd4" />
        </View>
      </View>
      
      {/* ... (O RESTO DOS BOTÕES CONTINUA AQUI) ... */}
      <View style={styles.spacer} />
      
      {/* 2. GRUPO: Galeria e Exclusão */}
      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button title="VER ARQUIVOS NO COFRE" onPress={() => navigation.navigate('CofreGallery')} color="#00bcd4" />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="MOVER DA GALERIA PARA O COFRE" onPress={selectMediaAndHide} color="#00bcd4" />
        </View>
      </View>
      
      <View style={styles.spacer} />
      
      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button title="EXCLUIR CONTEÚDO" color="gray" onPress={() => Alert.alert("Aviso", "A exclusão de itens agora é feita individualmente na tela 'Ver Arquivos no Cofre'.")} />
        </View>
      </View>

      <View style={styles.spacer} />
      
      {/* 4. GRUPO: Contatos e Criptografia */}
      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button title="ADICIONAR CONTATOS SEGUROS" onPress={() => navigation.navigate('Contatos')} color="#00bcd4" />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="ESCONDER CONTATOS (CRIPTOGRAFAR)" onPress={() => handleActionWithConfirmation("Criptografar e Ocultar todos os contatos listados", hideAndEncryptContacts)} color="#00bcd4" />
        </View>
      </View>

      <View style={styles.spacer} />

      {/* 5. GRUPO: Backup e Restauração */}
      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button title="FAZER BACKUP (EXPORTAR COFRE)" onPress={exportCofreContent} color="#2e7d32" />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="RESTAURAR COFRE (IMPORTAR)" onPress={importCofreContent} color="#c6ff00" />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0f7fa', padding: 20 },
  title: { fontSize: 24, marginBottom: 10, fontWeight: 'bold', color: '#004d40' },
  subtitle: { fontSize: 16, marginBottom: 40, textAlign: 'center', color: '#00796b' },
  buttonGroup: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', width: '100%', marginVertical: 5 },
  buttonWrapper: { margin: 5, flexGrow: 1, minWidth: 160 },
  spacer: { width: 10, height: 15 },
  // --- ESTILOS ADICIONAIS PARA A CRIAÇÃO DE SENHA ---
  passwordContainer: { 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f5f5f5',
      padding: 20
  },
  passwordTitle: { 
      fontSize: 22, 
      fontWeight: 'bold', 
      marginBottom: 10,
      color: '#e53935'
  },
  passwordSubtitle: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center'
  },
  passwordInput: {
      width: '90%',
      padding: 12,
      marginVertical: 15,
      borderWidth: 1,
      borderColor: '#e53935',
      borderRadius: 8,
  }
});
