import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Contacts from 'expo-contacts';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Caminho do cofre (deve ser o mesmo que em ContatosScreen.js)
const COFRE_DIR = `${FileSystem.documentDirectory}CofreSeguro/`;

export default function ContatosCofreScreen() {
    const [cofreContacts, setCofreContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // -----------------------------------------------------------
    // LÓGICA 1: Carregar Contatos do Cofre (Lê os arquivos JSON)
    // -----------------------------------------------------------
    const loadCofreContacts = async () => {
        setLoading(true);
        try {
            // Verifica se a pasta existe
            const dirInfo = await FileSystem.getInfoAsync(COFRE_DIR);
            if (!dirInfo.exists) {
                setCofreContacts([]);
                setLoading(false);
                return;
            }

            // Lista todos os arquivos JSON (nossos backups de contatos)
            const files = await FileSystem.readDirectoryAsync(COFRE_DIR);
            const contactFiles = files.filter(f => f.endsWith('.json'));

            const loadedContacts = [];

            for (const fileName of contactFiles) {
                const filePath = COFRE_DIR + fileName;
                
                try {
                    // Lê o conteúdo do arquivo JSON
                    const content = await FileSystem.readAsStringAsync(filePath);
                    const contactData = JSON.parse(content);
                    
                    // Adiciona o caminho do arquivo para podermos deletá-lo depois
                    contactData.cofrePath = filePath; 
                    loadedContacts.push(contactData);
                    
                } catch (e) {
                    console.error("Erro ao ler ou parsear arquivo de contato:", fileName, e);
                }
            }

            setCofreContacts(loadedContacts);

        } catch (error) {
            Alert.alert("Erro", "Não foi possível carregar o cofre de contatos.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    // -----------------------------------------------------------
    // LÓGICA 2: Restaurar Contato (Recria na agenda e apaga o backup)
    // -----------------------------------------------------------
    const handleRestoreContact = async (contact) => {
        Alert.alert(
            "Confirmar Restauração",
            `Tem certeza que deseja restaurar o contato "${contact.name || 'Sem Nome'}" para sua agenda pública?`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "SIM, RESTAURAR", onPress: async () => {
                    setLoading(true);
                    try {
                        // 1. Cria um novo contato na agenda nativa com os dados do backup
                        // Removendo o ID antigo para que a agenda crie um novo
                        delete contact.id; 
                        
                        await Contacts.addContactAsync(contact); 

                        // 2. Deleta o arquivo de backup do cofre
                        await FileSystem.deleteAsync(contact.cofrePath);

                        Alert.alert("Sucesso", "Contato restaurado com sucesso para sua agenda pública!");
                        loadCofreContacts(); // Recarrega a lista
                        
                    } catch (e) {
                        Alert.alert("Erro de Restauração", "Não foi possível restaurar o contato. Verifique as permissões.");
                        console.error("Erro na restauração:", e);
                    } finally {
                        setLoading(false);
                    }
                }}
            ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            loadCofreContacts();
        }, [])
    );

    const renderItem = ({ item }) => {
        return (
            <View style={styles.contactItem}>
                <Ionicons name="lock-closed" size={30} color="#e53935" style={{ marginRight: 10 }} />
                <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{item.name || "Sem Nome (ID Oculto)"}</Text>
                    {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                        <Text style={styles.contactNumber}>{item.phoneNumbers[0].number}</Text>
                    )}
                </View>
                <TouchableOpacity onPress={() => handleRestoreContact(item)} style={styles.restoreButton}>
                    <Ionicons name="lock-open" size={24} color="#00bcd4" />
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.containerCenter}>
                <ActivityIndicator size="large" color="#00bcd4" />
                <Text style={{ marginTop: 10, color: '#00796b' }}>A carregar cofre...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Contatos Escondidos (Cofre)</Text>
            <Text style={styles.headerSubtitle}>Estes contatos foram removidos da agenda pública.</Text>
            
            {cofreContacts.length === 0 ? (
                <View style={styles.containerCenter}>
                    <Text style={styles.emptyText}>Seu cofre de contatos está vazio!</Text>
                    <Text style={styles.emptySubText}>Nenhum contato está escondido.</Text>
                </View>
            ) : (
                <FlatList
                    data={cofreContacts}
                    keyExtractor={(item) => item.cofrePath}
                    renderItem={renderItem}
                    style={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e0f7fa', padding: 10 },
    containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#004d40', paddingVertical: 5, textAlign: 'center' },
    headerSubtitle: { fontSize: 14, color: '#e53935', textAlign: 'center', marginBottom: 10 },
    list: { flex: 1 },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 15,
        marginVertical: 4,
        borderRadius: 8,
        elevation: 2,
    },
    contactDetails: { flex: 1 },
    contactName: { fontSize: 16, fontWeight: 'bold', color: '#e53935' },
    contactNumber: { fontSize: 14, color: '#00796b' },
    restoreButton: {
        padding: 5,
        marginLeft: 10,
        backgroundColor: '#b2ebf2',
        borderRadius: 5,
    },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#004d40', marginBottom: 5 },
    emptySubText: { fontSize: 14, color: '#00796b' },
});
