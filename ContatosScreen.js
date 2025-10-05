import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Contacts from 'expo-contacts';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // Adicionado useNavigation
import { Ionicons } from '@expo/vector-icons';

const COFRE_DIR = `${FileSystem.documentDirectory}CofreSeguro/`; 

export default function ContatosScreen() {
    const navigation = useNavigation(); // Inicializa a navegação
    const [secureContacts, setSecureContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState({});

    // Função para pedir permissão e carregar contatos
    const loadSecureContacts = async () => {
        setLoading(true);
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permissão Necessária", "O aplicativo precisa de acesso aos seus contatos.");
                setLoading(false);
                return;
            }

            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
            });

            if (data.length > 0) {
                setSecureContacts(data);
            } else {
                setSecureContacts([]);
            }

        } catch (error) {
            Alert.alert("Erro", "Não foi possível carregar os contatos.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadSecureContacts();
            setSelectedContacts({});
        }, [])
    );

    // Adiciona ou remove o contato da seleção
    const toggleContactSelection = (contactId) => {
        setSelectedContacts(prev => ({
            ...prev,
            [contactId]: !prev[contactId]
        }));
    };

    // Abre o formulário nativo do sistema para criar um novo contato
    const handleAddContact = async () => {
        const newContact = await Contacts.presentFormAsync(null, { 
            isNew: true 
        });

        if (newContact.status === 'granted' && newContact.data) {
            Alert.alert("Sucesso", "Novo contato adicionado à agenda do celular.");
            loadSecureContacts(); 
        } else if (newContact.status === 'granted' && !newContact.data) {
            Alert.alert("Aviso", "A adição do contato foi cancelada.");
        }
    };

    // Função para deletar e salvar o backup criptografado (LÓGICA REAL)
    const encryptAndRemoveSelected = async () => {
        const idsToEncrypt = Object.keys(selectedContacts).filter(id => selectedContacts[id]);

        if (idsToEncrypt.length === 0) {
            Alert.alert("Aviso", "Selecione pelo menos um contato para criptografar.");
            return;
        }

        Alert.alert(
            "Confirmar Criptografia",
            `Tem certeza que deseja esconder ${idsToEncrypt.length} contatos? Eles serão apagados da agenda pública.`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "SIM, ESCONDER", onPress: async () => {
                    setLoading(true);
                    let successfulDeletions = 0;
                    
                    await FileSystem.makeDirectoryAsync(COFRE_DIR, { intermediates: true });

                    for (const id of idsToEncrypt) {
                        try {
                            const contactToEncrypt = secureContacts.find(c => c.id === id);

                            if (!contactToEncrypt) {
                                 console.warn(`Contato com ID ${id} não encontrado ou inválido.`);
                                 continue; 
                            }

                            const encryptedData = JSON.stringify(contactToEncrypt);
                            const backupPath = COFRE_DIR + `contato_${id}.json`;
                            
                            if (encryptedData) { 
                                await FileSystem.writeAsStringAsync(backupPath, encryptedData);
                            } else {
                                throw new Error("Dados de contato vazios.");
                            }
                            
                            await Contacts.removeContactAsync(id);
                            successfulDeletions++;

                        } catch (e) {
                            Alert.alert("Erro de Processamento", `Falha ao esconder contato. ID: ${id}`);
                            console.error("Falha ao processar contato:", id, e);
                        }
                    }

                    setLoading(false);
                    Alert.alert("Concluído!", `${successfulDeletions} contatos foram escondidos e apagados da agenda pública.`);
                    loadSecureContacts();
                }}
            ]
        );
    };


    const renderItem = ({ item }) => {
        const isSelected = selectedContacts[item.id];
        return (
            <TouchableOpacity 
                style={[styles.contactItem, isSelected && styles.selectedItem]}
                onPress={() => toggleContactSelection(item.id)}
            >
                <Ionicons 
                    name={isSelected ? "checkmark-circle" : "person-circle-outline"} 
                    size={30} 
                    color={isSelected ? "#00bcd4" : "#004d40"} 
                    style={{ marginRight: 10 }} 
                />
                <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{item.name || "Nome Não Disponível"}</Text>
                    {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                        <Text style={styles.contactNumber}>{item.phoneNumbers[0].number}</Text>
                    )}
                </View>
                <Ionicons name="lock-closed-outline" size={24} color={isSelected ? "#00bcd4" : "gray"} />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.containerCenter}>
                <ActivityIndicator size="large" color="#00bcd4" />
                <Text style={{ marginTop: 10, color: '#00796b' }}>A carregar agenda...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Seus Contatos Seguros</Text>
            
            {secureContacts.length === 0 && !loading ? (
                <View style={styles.containerCenter}>
                    <Text style={styles.emptyText}>Nenhum contato seguro encontrado!</Text>
                    <Text style={styles.emptySubText}>Use "Adicionar Novo Contato" para começar.</Text>
                </View>
            ) : (
                <FlatList
                    data={secureContacts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    style={styles.list}
                />
            )}

            <View style={styles.buttonContainer}>
                {/* BOTÃO NOVO: Navega para a lista de contatos escondidos */}
                <Button 
                    title="VER COFRE DE CONTATOS ESCONDIDOS" 
                    onPress={() => navigation.navigate('ContatosCofre')} 
                    color="#004d40" 
                />
                <View style={{ height: 10 }} /> 
                {/* BOTÃO PRINCIPAL: CRIPTOGRAFAR SELECIONADOS */}
                <Button 
                    title={`CRIPTOGRAFAR ${Object.keys(selectedContacts).filter(id => selectedContacts[id]).length} CONTATO(S) SELECIONADO(S)`} 
                    onPress={encryptAndRemoveSelected} 
                    color="#e53935" 
                    disabled={Object.keys(selectedContacts).filter(id => selectedContacts[id]).length === 0}
                />
                <View style={{ height: 10 }} /> 
                {/* BOTÃO ADICIONAR NOVO CONTATO */}
                <Button title="ADICIONAR NOVO CONTATO" onPress={handleAddContact} color="#00bcd4" />
            </View>
        </View>
    );
}

/* --- SEÇÃO DE ESTILOS --- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e0f7fa', padding: 10 },
    containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004d40', paddingVertical: 10, textAlign: 'center' },
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
    selectedItem: { 
        borderWidth: 2,
        borderColor: '#00bcd4',
        backgroundColor: '#b2ebf2',
    },
    contactDetails: { flex: 1 },
    contactName: { fontSize: 16, fontWeight: 'bold', color: '#004d40' },
    contactNumber: { fontSize: 14, color: '#00796b' },
    buttonContainer: {
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#b2dfdb',
        backgroundColor: '#e0f7fa',
    },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#004d40', marginBottom: 5 },
    emptySubText: { fontSize: 14, color: '#00796b' },
});
