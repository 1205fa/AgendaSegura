import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library'; 
import * as ImagePicker from 'expo-image-picker'; 
import * as FileSystem from 'expo-file-system/legacy'; // IMPORTAÇÃO CORRIGIDA PARA VERSÃO LEGACY
import * as Sharing from 'expo-sharing'; // Adicionado para Backup/Exportação
import { useNavigation } from '@react-navigation/native';

// --- DIRETÓRIO SECRETO DO COFRE ---
const COFRE_DIR = `${FileSystem.documentDirectory}CofreSeguro/`;

export default function CofreScreen() {
  const navigation = useNavigation();

  // --- Lógica de Permissão e Abertura ---

  const requestAllPermissions = async () => {
    // Pede permissão de câmera e mídia (galeria)
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPerm = await MediaLibrary.requestPermissionsAsync();
    
    // Alerta se a permissão não foi concedida
    if (cameraPerm.status !== 'granted' || mediaPerm.status !== 'granted') {
      Alert.alert("Permissão Necessária", "O aplicativo precisa de acesso à Câmera e à Galeria para funcionar.");
      return false;
    }
    return true;
  };

  // Função genérica para exibir o alerta de confirmação (Usada em Excluir, Esconder Contatos)
  const handleActionWithConfirmation = (actionType, onConfirm) => {
    Alert.alert(
      "Confirmação Necessária",
      `Você tem certeza que deseja ${actionType}? Esta ação é irreversível.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Tenho Certeza",
          onPress: onConfirm
        }
      ]
    );
  };

  // --- FUNÇÃO PRINCIPAL: SALVAR ARQUIVO NO COFRE ---
  const saveMediaToCofre = async (localUri, mediaType) => {
    try {
      // 1. GARANTE QUE O DIRETÓRIO COFRE_DIR EXISTA
      await FileSystem.makeDirectoryAsync(COFRE_DIR, { intermediates: true });

      // 2. CRIA O NOVO CAMINHO DO ARQUIVO DENTRO DO COFRE
      const fileName = localUri.split('/').pop();
      const newPath = COFRE_DIR + fileName;

      // 3. MOVE O ARQUIVO PARA O COFRE (Esconde da Galeria)
      await FileSystem.moveAsync({
        from: localUri,
        to: newPath,
      });

      Alert.alert("Sucesso!", `${mediaType} salvo e escondido no cofre!`);

    } catch (error) {
      Alert.alert("Erro de Salvamento", `Não foi possível mover o ${mediaType.toLowerCase()} para o cofre.`);
      console.error("Erro ao salvar no cofre:", error);
    }
  };


  // 1. FUNÇÃO PARA TIRAR FOTO E SALVAR NO COFRE
  const takePhotoAndSave = async () => {
    if (!(await requestAllPermissions())) return;

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const localUri = result.assets[0].uri;
      await saveMediaToCofre(localUri, "Foto");
    }
  };

  // 2. FUNÇÃO PARA FILMAR E SALVAR NO COFRE
  const recordVideoAndSave = async () => {
    if (!(await requestAllPermissions())) return;

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos, // MODO VÍDEO ATIVADO
      quality: 1,
      videoMaxDuration: 3600, // Permite 1 hora de filmagem
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const localUri = result.assets[0].uri;
      await saveMediaToCofre(localUri, "Vídeo");
    }
  };
  
  // 3. FUNÇÃO PARA SELECIONAR MÍDIA DA GALERIA E ESCONDER NO COFRE
  const selectMediaAndHide = async () => {
    if (!(await requestAllPermissions())) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, 
      allowsMultipleSelection: false,
    });

    // Se o cliente selecionou uma mídia, a função saveMediaToCofre a move da Galeria Pública para a pasta secreta.
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const localUri = result.assets[0].uri;
      await saveMediaToCofre(localUri, "Mídia (Galeria)");
    }
  };

  // 4. FUNÇÃO PARA EXCLUIR CONTEÚDO (APAGAR O DIRETÓRIO DO COFRE) - Funcao mantida, mas nao usada no botao
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

  // 5. FUNÇÃO PARA ESCONDER E CRIPTOGRAFAR CONTATOS
  const hideAndEncryptContacts = async () => {
      try {
          Alert.alert("Sucesso", "A lógica de criptografia foi simulada! O próximo passo real seria mover ou criptografar os dados.");
      } catch (error) {
          Alert.alert("Erro", "Falha ao tentar criptografar.");
      }
  };

  // --- FUNÇÕES DE BACKUP / RESTAURAÇÃO ---

  const exportCofreContent = async () => {
    try {
      const backupFileName = 'AgendaSegura_Backup_Seguro.txt';
      const backupPath = FileSystem.cacheDirectory + backupFileName;
      
      // Simula a compactação de todos os arquivos de COFRE_DIR
      await FileSystem.writeAsStringAsync(backupPath, 'Este arquivo simula o backup criptografado do seu cofre.', { encoding: FileSystem.EncodingType.UTF8 });
      
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Erro", "O compartilhamento de arquivos não está disponível neste dispositivo.");
        return;
      }

      Alert.alert(
        "Backup Pronto!",
        "Agora, selecione onde deseja salvar o seu arquivo de backup seguro. Salve-o no seu Google Drive ou em um local seguro!",
        [
          { text: "OK, Compartilhar Agora", onPress: async () => {
            await Sharing.shareAsync(backupPath, {
              mimeType: 'text/plain', 
              dialogTitle: 'Salvar Arquivo de Backup do AgendaSegura',
            });
          }}
        ]
      );
    } catch (error) {
      Alert.alert("Erro", "Falha ao exportar o conteúdo do cofre.");
      console.error("Erro ao exportar cofre:", error);
    }
  };

  const importCofreContent = async () => {
    Alert.alert("Funcionalidade Pendente", "A importação/restauração de arquivos de backup será implementada aqui.");
  };

  // --- Botões e Componentes ---

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BEM-VINDO AO SEU COFRE!</Text>
      <Text style={styles.subtitle}>Sua agenda e mídias seguras estão aqui.</Text>
      
      {/* 1. GRUPO: Fotos e Filmagens */}
      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button 
            title="TIRAR FOTO & ACOMPANHAR" 
            onPress={takePhotoAndSave} 
            color="#00bcd4" // Azul Ciano
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button 
            title="FILMAR & ACOMPANHAR" 
            onPress={recordVideoAndSave}
            color="#00bcd4" // Azul Ciano
          />
        </View>
      </View>

      <View style={styles.spacer} />
      
      {/* 2. GRUPO: Galeria e Exclusão */}
      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button 
            title="VER ARQUIVOS NO COFRE" // VISUALIZAÇÃO
            onPress={() => navigation.navigate('CofreGallery')} 
            color="#00bcd4" 
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button 
            title="MOVER DA GALERIA PARA O COFRE" // IMPORTAÇÃO/ESCONDER
            onPress={selectMediaAndHide} 
            color="#00bcd4" 
          />
        </View>
      </View>
      
      <View style={styles.spacer} />
      
      <View style={styles.buttonGroup}>
        {/* BOTÃO EXCLUIR CONTEÚDO (Agora redireciona) */}
        <View style={styles.buttonWrapper}>
          <Button 
            title="EXCLUIR CONTEÚDO" 
            color="gray" 
            onPress={() => Alert.alert("Aviso", "A exclusão de itens agora é feita individualmente na tela 'Ver Arquivos no Cofre'.")} 
          />
        </View>
      </View>

      <View style={styles.spacer} />
      
      {/* 4. GRUPO: Contatos e Criptografia */}
      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button 
            title="ADICIONAR CONTATOS SEGUROS" 
            onPress={() => navigation.navigate('Contatos')} 
            color="#00bcd4" 
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button 
            title="ESCONDER CONTATOS (CRIPTOGRAFAR)" 
            onPress={() => handleActionWithConfirmation("Criptografar e Ocultar todos os contatos listados", hideAndEncryptContacts)} 
            color="#00bcd4" 
          />
        </View>
      </View>

      <View style={styles.spacer} />

      {/* 5. GRUPO: Backup e Restauração */}
      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button 
            title="FAZER BACKUP (EXPORTAR COFRE)" 
            onPress={exportCofreContent} 
            color="#2e7d32" // Cor Verde
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button 
            title="RESTAURAR COFRE (IMPORTAR)" 
            onPress={importCofreContent} 
            color="#c6ff00" // Cor Amarelo-Verde
          />
        </View>
      </View>

    </View>
  );
}

/* --- SEÇÃO DE ESTILOS --- */
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#e0f7fa',
    padding: 20
  },
  title: { 
    fontSize: 24, 
    marginBottom: 10, 
    fontWeight: 'bold',
    color: '#004d40'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    color: '#00796b'
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    justifyContent: 'space-around',
    width: '100%', 
    marginVertical: 5,
  },
  buttonWrapper: { 
    margin: 5,
    flexGrow: 1, 
    minWidth: 160, 
  },
  spacer: { 
    width: 10, 
    height: 15 
  }, 
});
