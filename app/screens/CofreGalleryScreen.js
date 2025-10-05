import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, ActivityIndicator, Alert, TouchableOpacity, Modal } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy'; 
import { useFocusEffect } from '@react-navigation/native';
import { Video } from 'expo-av'; 
import { Ionicons } from '@expo/vector-icons'; 

const { width, height } = Dimensions.get('window');
const TILE_SIZE = width / 3;

// --- DIRETÓRIO SECRETO DO COFRE ---
const COFRE_DIR = `${FileSystem.documentDirectory}CofreSeguro/`;

export default function CofreGalleryScreen() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoUri, setCurrentVideoUri] = useState(null); 
  const [currentPhotoUri, setCurrentPhotoUri] = useState(null); 

  // Função principal para carregar o conteúdo do Cofre
  const loadCofreMedia = async () => {
    setLoading(true);
    try {
      const dirInfo = await FileSystem.getInfoAsync(COFRE_DIR);

      if (!dirInfo.exists || !dirInfo.isDirectory) {
        setMediaList([]);
        return;
      }

      const files = await FileSystem.readDirectoryAsync(COFRE_DIR);
      
      const mediaFiles = files.map(fileName => {
          const isVideo = fileName.toLowerCase().endsWith('.mov') || fileName.toLowerCase().endsWith('.mp4');
          return {
              id: fileName, 
              uri: COFRE_DIR + fileName,
              name: fileName,
              type: isVideo ? 'video' : 'photo', 
          };
      });

      setMediaList(mediaFiles);
    } catch (error) {
      Alert.alert("Erro de Leitura", "Não foi possível carregar o conteúdo do cofre.");
    } finally {
      setLoading(false);
    }
  };

  // --- NOVA FUNÇÃO: DELETAR MÍDIA SELETIVAMENTE ---
  const deleteMedia = (item) => {
    Alert.alert(
        "Confirmar Exclusão",
        `Tem certeza que deseja apagar ${item.name}?`,
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "APAGAR", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        await FileSystem.deleteAsync(item.uri);
                        Alert.alert("Sucesso", "Mídia excluída do cofre.");
                        loadCofreMedia(); // Recarrega a lista
                    } catch (error) {
                        Alert.alert("Erro", "Não foi possível apagar o arquivo.");
                        console.error(error);
                    }
                }
            }
        ]
    );
  };
  // ----------------------------------------------------


  useFocusEffect(
    useCallback(() => {
      loadCofreMedia();
    }, [])
  );

  // Função para abrir o vídeo ou foto em tela cheia
  const handleTilePress = (item) => {
      if (item.type === 'video') {
          setCurrentVideoUri(item.uri);
      } else {
          setCurrentPhotoUri(item.uri);
      }
  };


  const renderItem = ({ item }) => (
    <View style={styles.mediaTile}>
        <TouchableOpacity onPress={() => handleTilePress(item)} style={styles.touchableArea}>
            <Image 
              source={{ uri: item.uri }} 
              style={styles.image} 
              resizeMode="cover" 
            />
            {item.type === 'video' && (
                <View style={styles.playOverlay}>
                    <Ionicons name="play-circle" size={40} color="white" />
                </View>
            )}
        </TouchableOpacity>
        
        <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>

        {/* --- BOTÃO DE EXCLUIR NO CANTO --- */}
        <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => deleteMedia(item)}
        >
            <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
    </View>
  );

  // --- TELA DE REPRODUÇÃO DE VÍDEO (EM TELA CHEIA)
  if (currentVideoUri) {
    return (
        <View style={styles.videoPlayerContainer}>
            <Video
                source={{ uri: currentVideoUri }}
                style={styles.fullScreenVideo}
                useNativeControls
                resizeMode="contain"
                shouldPlay
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setCurrentVideoUri(null)}>
                <Ionicons name="close-circle" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
  }

  // --- VISUALIZADOR DE FOTOS (MODAL)
  const PhotoModal = () => (
    <Modal visible={!!currentPhotoUri} animationType="fade" onRequestClose={() => setCurrentPhotoUri(null)}>
        <View style={styles.photoModalContainer}>
            <Image
                source={{ uri: currentPhotoUri }}
                style={styles.fullScreenPhoto}
                resizeMode="contain"
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setCurrentPhotoUri(null)}>
                <Ionicons name="close-circle" size={30} color="white" />
            </TouchableOpacity>
        </View>
    </Modal>
  );

  // --- Renderização Principal ---
  if (loading) {
    // ... Código de Loading
  }

  if (mediaList.length === 0) {
    // ... Código de Vazio
  }


  return (
    <View style={styles.mainContainer}>
        <FlatList
          data={mediaList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={3} 
          contentContainerStyle={styles.galleryContainer}
        />
        <PhotoModal />
    </View>
  );
}

/* --- SEÇÃO DE ESTILOS ADICIONAIS --- */
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#e0f7fa',
    },
    // ... outros estilos ...
    mediaTile: {
        width: TILE_SIZE,
        height: TILE_SIZE + 20, 
        padding: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative', 
    },
    touchableArea: {
        width: '100%',
        height: TILE_SIZE - 4,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    deleteButton: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: 'rgba(255, 0, 0, 0.7)',
        borderRadius: 15,
        padding: 4,
        zIndex: 5, // Fica por cima do playOverlay
    },
    // ... resto dos estilos ...
    fileName: {
        fontSize: 10,
        marginTop: 2,
        color: '#004d40',
        textAlign: 'center',
        width: '100%',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 20, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    photoModalContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenPhoto: {
        width: width,
        height: height,
    },
    videoPlayerContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenVideo: {
        width: '100%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
    },
    containerCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0f7fa',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#004d40',
        marginBottom: 5,
    },
    emptySubText: {
        fontSize: 14,
        color: '#00796b',
    },
});
