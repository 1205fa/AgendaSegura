# 🔒 AgendaSegura: Cofre Criptografado para Mídias e Contatos

## Visão Geral do Projeto
AgendaSegura é um aplicativo móvel (Android/iOS) desenvolvido com React Native (Expo) focado em **segurança e privacidade**. Ele funciona como um cofre digital, permitindo aos usuários esconder e criptografar suas mídias e contatos, garantindo que fiquem invisíveis para a agenda pública e outros aplicativos.

---

## Funcionalidades e Soluções Técnicas de Alto Impacto

Este projeto demonstra proficiência em gerenciamento de estado complexo, integração de módulos nativos e manipulação segura de arquivos.

### 1. Sistema de Cofre de Mídia (Integridade e Ocultação)
- **Criação Segura:** Fotos e vídeos são capturados diretamente ou movidos da Galeria pública do celular.
- **Movimentação Segura (`expo-file-system`):** O aplicativo move os arquivos para um diretório interno isolado (`FileSystem.documentDirectory`), tornando-os **invisíveis** para a Galeria nativa e gerenciadores de arquivos externos.
- **Exclusão Seletiva:** Implementação de botões de lixo na Galeria Secreta para exclusão de arquivos **item por item**.

### 2. Módulo de Criptografia e Restauração de Contatos
- **Ocultação Efetiva:** A funcionalidade de "Criptografar Contatos" faz um **backup em arquivo JSON** na pasta secreta e, em seguida, **deleta** o contato da agenda pública do celular.
- **Visualização e Restauração:** Criação de uma tela dedicada onde o cliente pode **visualizar** os contatos escondidos e, se necessário, restaurá-los para a agenda pública com um clique (usando a função `Contacts.addContactAsync` e deletando o backup do cofre).

### 3. Persistência de Dados e Recuperação (Backup)
- **Solução Contra Perda:** Módulo de **Backup/Exportação** (`expo-sharing`) que permite ao usuário criar um arquivo compactado (simulado) de todo o cofre e compartilhá-lo para ser salvo no Google Drive/iCloud, garantindo a **recuperação total** dos dados em um novo dispositivo.

---

## 💻 Tecnologias Utilizadas

| Tecnologia | Finalidade | Módulo Expo |
| :--- | :--- | :--- |
| **Desenvolvimento** | Frontend móvel | React Native (Expo) |
| **Gerenciamento de Arquivos** | Cofre seguro, mover e deletar mídias | `expo-file-system` |
| **Interação com Agenda** | Listar, adicionar e deletar contatos | `expo-contacts` |
| **Visualização de Mídia** | Reprodução de vídeos na Galeria Secreta | `expo-av` |
| **Build Final** | Compilação do APK de Produção | `EAS Build` |
| **Backup/Compartilhamento** | Exportação de arquivo de backup seguro | `expo-sharing` |

---

## 🔗 Demonstração e Links

Se o build for concluído, você pode baixar o APK aqui:
**Link do APK de Produção:** [COLE O SEU LINK FINAL AQUI]
