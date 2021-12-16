// COLLECTIONS STRUCTURE 
// messages = db.collection(`users/${Sxp3K71KnROFTIegzpAK5ccnsuj1}/chats/${2thYZz4eWje7FicqRiGQrdiozoY2}/messages`);

var db = firebase.firestore();
var usersCollection = db.collection("users");
var user;


class Chat {
    //Estoy filtrando los mensajes al ser enviados
    // y recibidos(en el controlador y en el modelo respectivamente )
    // ¿es útil esta redundancia, o solo haría falta filtrar en el envío?
    constructor(chatData) {
        this.interlocutorId = chatData.id;
        this.interlocutorEmail = null;
        //Para evitar la emisión de errores establezco la url
        // a una imagen por defecto, hasta que se obtenga
        // la información del usuario en la suscripción a los datos del interlocutor(suscribeToInterlocutorData)
        this.interlocutorPictureUrl = 'https://firebasestorage.googleapis.com/v0/b/web-chat-de48b.appspot.com/o/default-avatar-usuario.png?alt=media&token=1942c2c5-33d2-4a0c-a70d-fd6e24c5cfdb';
        this.messages = [];
        this.lastMessage = chatData.lastMessage;
        this.observers = [];

        // El modelo estará suscrito a los cambios de la BBDD
        this.suscribeToChat();
        this.suscribeToInterlocutorData();
        this.suscribeToMessages();
    }

    set messages(newMessages) {
        this._messages = newMessages;
    }

    get messages() {
        return this._messages;
    }

    set interlocutorId(newInterlocutorId) {
        this._interlocutorId = newInterlocutorId;
    }

    get interlocutorId() {
        return this._interlocutorId;
    }

    set interlocutorEmail(newInterlocutorEmail) {
        this._interlocutorEmail = newInterlocutorEmail;
    }

    get interlocutorEmail() {
        return this._interlocutorEmail;
    }

    set interlocutorPictureUrl(newInterlocutorPictureUrl) {
        this._interlocutorPictureUrl = newInterlocutorPictureUrl;
    }

    get interlocutorPictureUrl() {
        return this._interlocutorPictureUrl;
    }

    addMessage(addedMessage) {
        if (this.filterMessage(addedMessage)) {
            this.messages.push(addedMessage);

            //Notifico a los observers de la adición de un mensaje
            this.notifyAllAddedMessage(addedMessage);
        }
    }

    modifyMessage(modifiedMessage) {

        if (this.filterMessage(modifiedMessage)) {
            let modifiedMessageIndex = this.messages.findIndex((message) => message.id === modifiedMessage.id);
            this.messages[modifiedMessageIndex] = modifiedMessage;

            //Notifico a los observers de la modificación de un mensaje
            this.notifyAllModifiedMessage(modifiedMessage);
        }

    }

    removeMessage(removedMessage) {
        let removedMessageIndex = this.messages.findIndex((message) => message.id === removedMessage.id);
        this.messages.splice(removedMessageIndex, 1);

        //Notifico a los observers de la eliminación de un mensaje
        this.notifyAllRemovedMessage(removedMessage);
    }



    registerObserver(observer) {
        this.observers.push(observer);
    }

    unregisterObserver(observer) {
        let auxIndexObserver = this.observers.indexOf(observer);
        this.observers.splice(auxIndexObserver, 1);
    }

    //Haré notificaciones parciales según los cambios del modelo,
    // el método notifyAll no será usado, el método update de la vista
    // no existirá.
    //
    // notifyAll() {
    //     for (let i = 0; i < this.observers.length; i++) {
    //         this.observers[i].update(this.copy());
    //     }
    // }

    notifyAllAddedMessage(addedMessage) {
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].updateChatSpeechBubbles("added", addedMessage);
        }
    }

    notifyAllModifiedMessage(modifiedMessage) {
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].updateChatSpeechBubbles("modified", modifiedMessage);
        }
    }

    notifyAllRemovedMessage(removedMessage) {
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].updateChatSpeechBubbles("removed", removedMessage);
        }
    }

    notifyAllModifiedLastMessage() {
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].updateChatTag(this.copy());
        }
    }

    notifyAllModifiedInterlocutorData() {
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].updateChatTag(this.copy());
        }
    }



    copy() {
        return {
            interlocutorId: this.interlocutorId,
            lastMessage: this.lastMessage,
            interlocutorEmail: this.interlocutorEmail,
            interlocutorPictureUrl: this.interlocutorPictureUrl
        }
    }

    filterMessage(message) {
        let filteredMessage = escapeHTML(message).trim()
        return filteredMessage;
    }

    //TODO: Solucionar la doble suscripción al documento chat,
    // por un lado aquí con la suscripción a la colección
    // y en el modelo con la suscripción al documento
    suscribeToChat() {
        // Me suscribo al documento chat
        // Tal vez tenga que suscribirme a la subcolección messages
        // dependiendo de si esta suscripción no recibe los cambio de las subcolecciones
        // 
        //COMPROBADO: según stackoverflow (https://stackoverflow.com/questions/53227376/firestore-listener-for-sub-collections),
        // las colecciones no reciben los cambios de las subcolecciones
        db.collection(`users/${user.uid}/chats`).doc(`${this.interlocutorId}`)
            .onSnapshot((chatDoc) => {
                let auxChatData = chatDoc.data();
                this.lastMessage = auxChatData.lastMessage.content;
                this.notifyAllModifiedLastMessage();
            });
    }

    suscribeToInterlocutorData() {
        db.collection(`users`).doc(`${this.interlocutorId}`)
            .onSnapshot((InterlocutorDoc) => {
                let auxInterlocutorData = InterlocutorDoc.data();
                this.interlocutorEmail = auxInterlocutorData.email;
                this.interlocutorPictureUrl = auxInterlocutorData.picture;
                this.notifyAllModifiedInterlocutorData();
            });
    }

    suscribeToMessages() {
        db.collection(`users/${user.uid}/chats/${this.interlocutorId}/messages`)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        console.log("New message: ", change.doc.data());
                        let addedMessage = change.doc.data();
                        addedMessage.id = change.doc.id;
                        this.addMessage(addedMessage);
                    }
                    if (change.type === "modified") {
                        console.log("Modified message: ", change.doc.data());
                        let modifiedMessage = change.doc.data();
                        modifiedMessage.id = change.doc.id;
                        this.modifyMessage(modifiedMessage);
                    }
                    if (change.type === "removed") {
                        console.log("Removed message: ", change.doc.data());
                        let removedMessage = change.doc.data();
                        removedMessage.id = change.doc.id;
                        this.removeMessage(removedMessage);
                    }
                })
            });
    }
}

class ChatView {
    constructor() {
        this.chatTag = null;
        this.chatSpeechBubbles = [];
    }

    static init() {
        ChatView.chatsContainer = $('#desktop-chat-list');

        ChatView.chatCard = $('#chatCard');
        ChatView.chatCardInterlocutorPicture = $('#chat-interlocutor-md img')[0];
        ChatView.chatCardInterlocutorEmail = $('#chat-interlocutor-md p')[0];
        ChatView.chatCardMessagesList = $('#messages-list-md')[0];
        ChatView.chatCardInputDesktop = $('#inputDesktop')[0];
        ChatView.chatCardSendButtonDesktop = $('#sendButtonDesktop')[0];
        //Prototipo de los chat tags
        ChatView.chatTagPrototype = document.createElement('li');
        ChatView.chatTagPrototype.classList.add('chatTag');
        ChatView.chatTagLastMessage = document.createElement('p');
        ChatView.chatTagLastMessage.classList.add('chatTagLastMessage');
        ChatView.chatTagInterlocutorEmail = document.createElement('p');
        ChatView.chatTagInterlocutorEmail.classList.add('chatTagInterlocutorEmail');
        ChatView.chatTagInterlocutorPicture = document.createElement('img');
        ChatView.chatTagInterlocutorPicture.classList.add('chatTagInterlocutorPicture');

        ChatView.chatTagPrototype.append(ChatView.chatTagInterlocutorPicture);
        ChatView.chatTagPrototype.append(ChatView.chatTagInterlocutorEmail);
        ChatView.chatTagPrototype.append(ChatView.chatTagLastMessage);

        //Prototipo de los bocadillos de mensajes
        ChatView.speechBubblePrototype = document.createElement('li');
        ChatView.speechBubblePrototype.classList.add('speechBubble');
        ChatView.speechBubbleState = document.createElement('p');
        ChatView.speechBubbleState.classList.add('speechBubbleMessageState');
        ChatView.speechBubbleDate = document.createElement('p');
        ChatView.speechBubbleDate.classList.add('speechBubbleMessageDate');
        ChatView.speechBubbleMessageContent = document.createElement('p');
        ChatView.speechBubbleMessageContent.classList.add('speechBubbleMessageContent');

        ChatView.speechBubblePrototype.append(ChatView.speechBubbleMessageContent);
        ChatView.speechBubblePrototype.append(ChatView.speechBubbleDate);
        ChatView.speechBubblePrototype.append(ChatView.speechBubbleState);

    }

    populateChatTag(chat) {
        // Relleno los datos de los nodos del chat tag
        // hago que la clonación incluya los nodos hijos con el parámetro true
        this.chatTag = ChatView.chatTagPrototype.cloneNode(true);
        this.chatTag.querySelector('.chatTagInterlocutorPicture').src = chat.interlocutorPictureUrl;
        this.chatTag.querySelector('.chatTagInterlocutorEmail').innerText = chat.interlocutorEmail;
        this.chatTag.querySelector('.chatTagLastMessage').innerText = chat.lastMessage.content;

        ChatView.chatsContainer.append(this.chatTag);


        // Por si no se reciben los mensajes en la suscripción del chat,
        // voy a añadir los mensajes en el evento disparado cada vez que
        // se añade un mensaje nuevo o al iniciar la suscripcion a la
        // colección messages: updateChatSpeechBubbles
        //
        // TODO: revisar si se obtienen subcolecciones y sus cambios en 
        // la suscripción a una colección
        // DONE: comprobado los cambios de las subcolecciones no se muestran
        // en las suscripciones a las colecciones padres
        // 
        // Los mensajes del chat se añaden en updateChatSpeechBubbles
    }

    updateChatTag(chat) {
        this.chatTag.querySelector('.chatTagInterlocutorPicture').src = chat.interlocutorPictureUrl;
        this.chatTag.querySelector('.chatTagInterlocutorEmail').innerText = chat.interlocutorEmail;
        this.chatTag.querySelector('.chatTagLastMessage').innerText = chat.lastMessage;
    }

    populateChatCard(chat) {
        ChatView.chatShowingMessages = this;

        ChatView.chatCardMessagesList.innerHTML = '';
        ChatView.chatCardInputDesktop.value = '';
        ChatView.chatCardInterlocutorPicture.src = chat.interlocutorPictureUrl;
        ChatView.chatCardInterlocutorEmail.innerText = chat.interlocutorEmail;

        for (let i = 0; i < this.chatSpeechBubbles.length; i++) {
            let speechBubble = this.chatSpeechBubbles[i];
            ChatView.chatCardMessagesList.append(speechBubble);
        }
    }

    updateChatSpeechBubbles(changeType, newMessage) {

        if (changeType === "added") {
            // Por cada nuevo mensaje añado un nuevo chatSpeechBubble
            // hago que la clonación incluya los nodos hijos con el parámetro true
            let newSpeechBubble = ChatView.speechBubblePrototype.cloneNode(true);
            newSpeechBubble.querySelector('.speechBubbleMessageContent').innerText = newMessage.content;
            newSpeechBubble.querySelector('.speechBubbleMessageDate').innerText = newMessage.date;
            newSpeechBubble.querySelector('.speechBubbleMessageState').innerText = newMessage.state;
            this.chatSpeechBubbles.push(newSpeechBubble);

            //Si este chat se está mostrando también añado
            // el speechBubble a la lista de mensajes
            if (ChatView.chatShowingMessages === this) {
                ChatView.chatCardMessagesList.append(newSpeechBubble);
            }

        } else if (changeType === "modified") {
            //TODO: Pensar si los mensajes se van a poder modificar
        } else if (changeType === "removed") {
            //TODO: Pensar si los mensajes se van a poder eliminar
        }

    }

    hideMessages() {
        ChatView.chatShowingMessages = null;
        ChatView.chatCardInterlocutorPicture.src = '';
        ChatView.chatCardInterlocutorEmail.innerText = '';
        ChatView.chatCardMessagesList.innerHTML = '';
        ChatView.chatCardInputDesktop.value = '';
    }
}
//Inicializo las variables globales de la vista
ChatView.chatShowingMessages = null;
ChatView.chatsContainer = null;
ChatView.chatCard = null;

class ChatController {
    constructor(chat, chatView) {
        this.chat = chat;
        this.chatView = chatView;
        chat.registerObserver(chatView);
        chatView.populateChatTag(this.chat.copy());


        // Utilizo bind para establecer el contexto de ejecución en el ChatController
        // en lugar de en el elemento al que se le añade el evento
        this.chatView.chatTag.addEventListener('click', this.showMessages.bind(this));
        ChatView.chatCardInputDesktop.addEventListener('change', this.enableSendButton.bind(this));
        ChatView.chatCardSendButtonDesktop.addEventListener('click', this.sendMessage.bind(this));
    }

    static init() {
        //TODO: Solucionar la doble suscripción al documento chat,
        // por un lado aquí con la suscripción a la colección
        // y en el modelo con la suscripción al documento
        db.collection(`users/${user.uid}/chats`)
            .onSnapshot(
                (snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "added") {
                            let chatData = change.doc.data();
                            chatData.id = change.doc.id;
                            let chat = new Chat(chatData);
                            let chatView = new ChatView();
                            let chatController = new ChatController(chat, chatView);
                        }
                        if (change.type === "modified") {
                            console.log("Modified chat: ", change.doc.data());
                        }
                        if (change.type === "removed") {
                            console.log("Removed city: ", change.doc.data());
                        }
                    });
                },
                (error) => {
                    console.log('Ha ocurrido un error en la escucha de la colección chats: ', error);
                }
            );
    }

    showMessages() {
        //La idea final es esta:
        //animarSalida();
        //this.chatView.populateChatCard();
        //animarEntrada();
        this.chatView.populateChatCard(this.chat);
    }

    async sendMessage(messageContent) {
        let messageFiltered = this.chat.filterMessage(messageContent);
        if (messageFiltered) {
            let newMessage = {
                'author': user.uid,
                'content': messageFiltered,
                'state': 'enviado',
                'date': Date.now()
            }

            ChatView.chatCardInputDesktop.value = '';
            ChatView.chatCardSendButtonDesktop.enabled = false;

            let chatExistsInSender = await checkChatInSender();
            let chatExistsInReceiver = await checkChatInReceiver();

            if (chatExistsInSender && chatExistsInReceiver) {
                // El chat existe en emisor y receptor
                setMessageSender(newMessage);
                setMessageReceiver(newMessage);
            } else if (chatExistsInReceiver) {
                // El chat existe en receptor
                setMessageReceiver(newMessage);
                createChatSender(newMessage);
            } else if (chatExistsInSender) {
                // El chat existe en emisor
                createChatReceiver(newMessage);
                setMessageSender(newMessage);
            } else {
                // El chat NO existe en ninguno de los 2
                createChatReceiver(newMessage);
                createChatSender(newMessage);
            }
        }


        function checkChatInSender() {
            let chatRef = `users/${user.uid}/chats/${chat.interlocutorID}`;

            //TODO: ¿doble return? Revisar si hay que devolver la promesa o co
            // o con el último return sería suficiente
            return db.doc(chatRef).get()
                .then(
                    (chat) => {
                        return chat.exists;
                    }
                )
                .catch(
                    (error) => {
                        console.log(error);
                        return false;
                    }
                );


        }

        function checkChatInReceiver() {
            let chatRef = `users/${this.chat.interlocutorId}/chats/${user.uid}`;

            //TODO: ¿doble return? Revisar si hay que devolver la promesa o co
            // o con el último return sería suficiente
            return db.doc(chatRef).get()
                .then(
                    (chat) => {
                        return chat.exists;
                    }
                )
                .catch(
                    (error) => {
                        console.log(error);
                        return false;
                    }
                );
        }

        function createChatReceiver(message) {
            let newChatRef = `users/${this.chat.interlocutorId}/chats/${user.uid}`;
            db.doc(newChatRef).set({ 'dummy': 'dummy' })
                .then(
                    (data) => {
                        console.log('Chat creado en receptor', this.chat.interlocutorId);
                    }
                )
                .catch(
                    (error) => {
                        console.log(error);
                    }
                );

            setMessageReceiver(message);
        };

        function createChatSender(message) {
            let newChatRef = `users/${user.uid}/chats/${this.chat.interlocutorId}`;

            db.doc(newChatRef).set({ 'dummy': 'dummy' })
                .then(
                    (data) => {
                        console.log('Chat creado en emisor:', user.uid);
                    }
                )
                .catch(
                    (error) => {
                        console.log(error);
                    }
                );


            setMessageSender(message);
        };

        function setMessageReceiver(message) {

            let messagesRef = `users/${this.chat.interlocutorId}/chats/${user.uid}/messages`;

            db.collection(messagesRef).add(message)
                .then(
                    (data) => {}
                )
                .catch(
                    (error) => {
                        console.log(error);
                    }
                );

        };

        function setMessageSender(message) {
            let messagesRef = `users/${user.uid}/chats/${this.chat.interlocutorId}/messages`;

            db.collection(messagesRef).add(message)
                .then(
                    (data) => {
                        //(se puede borrar)
                        //El botón de enviar lo restablezco antes mejor
                        //$(sendButtonDesktop).attr('disabled');
                    }
                )
                .catch(
                    (error) => {
                        console.log(error);
                    }
                );
        };


    }

    sendMessageFromDesktop() {
        let messageContent = ChatView.chatCardInputDesktop.value;
        sendMessage(messageContent);
    }

    sendMessageFromMobile() {
        //Capturar el contenido del input del modal
        // y lanzar sendMessage con el contenido del input del modal
        // Ejemplo:
        // let messageContent = ChatView.chatCardInputDesktop.value;
        // sendMessage(messageContent);
    }

    enableSendButton() {
        if (ChatView.chatCardInputDesktop.value != "") {
            ChatView.chatCardSendButtonDesktop.enable = true;
        } else {
            ChatView.chatCardSendButtonDesktop.enable = false;
        }
    }

    disableSendButton() {
        ChatView.sendButtonDesktop.enable = false;
        //TODO: Añadir la deshabilitación del botón del modal
    }
}

$(document).ready(function() {
    firebase.auth().onAuthStateChanged(async(userAuth) => {
        if (userAuth) {
            // User is signed in

            user = userAuth;
            let userData = await getUserData(user.uid);
            displayUserData(userData.data());
            ChatView.init();
            ChatController.init();
        } else {
            // User is signed out

            location = '../index.html';
        }
    });


    // Función que muestra los datos del usuario
    function displayUserData(userData) {
        $('#userBadge').text(`${userData.email}`);
    }
    // Función que obtiene los datos del usuario
    function getUserData(userID) {

        return usersCollection.doc(userID).get();

    }

    // BUSCADOR
    class User {
        constructor(email, picture) {
            this.email = email;
            this.picture = picture;
        }
    }

    class UserFound extends User {
        constructor(email, picture) {
            this.email = email;
            this.picture = picture;
        }
    }

    class UserFoundView {
        constructor() {

        }
    }

    class UserFoundController {
        constructor() {

        }
    }

    class Searcher {

        init() {
            Searcher.usersList = $('#foundUsersList')[0];
            Searcher.input = $('[type="search"]')[0];
            Searcher.input.addEventListener('focus', showUsers);
            Searcher.input.addEventListener('keyup', filterUsers);
        }

        getUsers() {
            return usersCollection.get();
        }

        async showUsers() {
            // Compruebo si ya ha obtenido la lista de usuarios
            if (!Searcher.users)
                Searcher.users = await getUsers();

            // Si el buscador no está vacio dejalo filtrar, no muestres la lista completa
            if (buscador.val().trim() == '') {
                usersList.html(' ');
                for (let i = 0;
                    (i < 5 && i < users.docs.length); i++) {


                    let userData = users.docs[i].data();
                    userData.id = users.docs[i].id;

                    if (userData.id != user.uid) {
                        usersList.append(`
                        <li class="found-user dropdown-item chat-item-md d-flex justify-content-center align-items-center p-2 d-block text-start" data-fs-id="${userData.id}">
                            <img src="${userData.picture}" class="rounded-circle"></img>    
                            <p class="m-0">${userData.email}</p>
                        </li>`);
                    }


                }

                $('.found-user').click(createChat);
            }

        }

        filterUsers() {
            // Compruebo si ya ha obtenido la lista de usuarios (es una promesa puede tardar)
            if (users) {
                usersList.html('');

                // Bucle para mostrar solo 5 usuarios que encajen como máximo
                let numUser = 0;
                let numUsersMatched = 0;
                while (numUsersMatched < 5 && numUser < users.docs.length) {
                    let userDoc = users.docs[numUser];
                    let email = userDoc.data().email;
                    let picture = userDoc.data().picture;

                    if (user.uid != users.docs[numUser].id) {

                        if (email.includes(buscador.val().toLowerCase()) && buscador.val() != '') {
                            usersList.append(`
                            <li class="found-user dropdown-item chat-item-md d-flex justify-content-center align-items-center p-2 d-block text-start" data-fs-id="${userDoc.id}">
                                <img src="${picture}" class="rounded-circle"></img>    
                                <p class="m-0">${email}</p>
                            </li>`);

                            $('.found-user').click(createChat);
                            numUsersMatched++;
                        }
                    }


                    numUser++;
                }
            }
        }


    }
    Searcher.usersList = null;
    Searcher.users = null;
    Searcher.input = null;



    // CREAR CHAT

    function createChat(event) {
        let interlocutorID = event.currentTarget.dataset.fsId;
        let newConversationHTML =
            `<li class="chat-item-md d-flex justify-content-around align-items-center  p-2 d-block text-start" data-fs-id="${interlocutorID}" style="display:none">
                ${event.currentTarget.innerHTML}
            </li>`;

        // Si no existe el chat crea uno, si existe abrelo
        if (!$(`#desktop-chat-list [data-fs-id="${interlocutorID}"]`).length) {



            $('#desktop-chat-list').prepend(newConversationHTML);
            newChat = $(`#desktop-chat-list [data-fs-id="${interlocutorID}"]`);



            // newChat.click(displayChatDesktop).click();

        } else {

            let chat = $(`#desktop-chat-list [data-fs-id="${interlocutorID}"]`);
            chat.click();
        }


        // let messagesCollection = db.collection(`users/Sxp3K71KnROFTIegzpAK5ccnsuj1/chats/2thYZz4eWje7FicqRiGQrdiozoY2/messages`);

        // messagesCollection.add({
        //     author: "tutancamon",
        //     content: "Mensaje importante",
        //     date: Date.now(),
        //     state: "created"
        // });
    }


    // ENVIAR MENSAJE

    function escapeHTML(text) {
        var replacements = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' };
        return text.replace(/[<>&"]/g, function(character) {
            return replacements[character];
        });
    }

    var sendButtonDesktop = '#sendButtonDesktop';
    // $(sendButtonDesktop).click(sendMessage);
    // $('#inputDesktop').on('input', enableButton);
    $('#inputDesktop').on('keyup', (event) => {
        if (event.code === "Enter" && !$(sendButtonDesktop)[0].disabled) {
            $(sendButtonDesktop).click();
        }
    });


    // LOGOUT
    var logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', logoutUser);

    function logoutUser() {
        firebase.auth().signOut()
            .catch((error) => {
                console.log(`Se ha producido el siguiente error: ${error}`);
            });
    }


    // OBTENER CHAT
    // MOSTRAR CHAT

    var interlocutorMobile = $('#chat-interlocutor');
    var interlocutorDesktop = $('#chat-interlocutor-md');

    var messagesListMobile = $('#messages-list');
    var messagesListDesktop = $('#messages-list-md');

    var chat = { 'interlocutorID': '', 'messages': [] };
    async function displayChatDesktop(event) {
        chat.interlocutorID = event.currentTarget.dataset.fsId;

        $('.selected').toggleClass('selected');
        $(`.chatsContainer [data-fs-id="${chat.interlocutorID}"]`).addClass('selected');

        animarSalida();

        function animarSalida() {
            $('#chatCard').animate({
                    left: "+=75%",
                    opacity: 0.25
                },
                500,
                async function RellenarDatos() {

                    // Si estaba suscrito a algún chat, me desuscribo
                    if (unsubscribeMessagesMethod) {
                        unsubscribeMessagesMethod();
                    }

                    $('#inputDesktop').val("");

                    let interlocutorHTML = event.currentTarget.innerHTML;
                    $('#chat-interlocutor-md').html(`${interlocutorHTML}`);

                    $('#messages-list-md').html('');

                    //  REFACTORIZACIÓN MUESTREO DE MENSAJES

                    var unsubscribeMessagesMethod = db.collection(`users/${user.uid}/chats/${chat.interlocutorID}/messages`).orderBy("date")
                        .onSnapshot((snapshot) => {
                            snapshot.docChanges().forEach((change) => {
                                if (change.type === "added") {
                                    let message = change.doc.data();
                                    message.date = new Date(message.date); // formateo de fecha
                                    message.date = message.date.toLocaleTimeString('es-ES').replace(/:[0-9]{2}$/g, '');

                                    if (message.author == user.uid) {

                                        messagesListDesktop.append(`
                                                    <li class="message align-self-start text-start mt-2">                
                                                        <p>${message.content}</p>
                                                        <p class="text-start">${message.date} ${message.state}</p>      
                                                    </li>`);
                                    } else {

                                        messagesListDesktop.append(`
                                                    <li class="message align-self-end text-start mt-2">                
                                                        <p>${message.content}</p>
                                                        <p class="text-end">${message.date} ${message.state}</p>   
                                                    </li>`);

                                    }
                                }
                                if (change.type === "modified") {
                                    let message = change.doc.data();
                                }
                                if (change.type === "removed") {
                                    let message = change.doc.data();
                                }
                            });

                            (function scrollToBottom() {
                                $('.card-body').animate({ scrollTop: $('.card-body ul').height() });
                            })();
                        });

                    $('#inputDesktop').removeAttr('disabled'); // Habilito el input

                    animarEntrada();

                    function animarEntrada() {
                        $('#chatCard').css({ "position": "relative", "left": "75%" });
                        $('#chatCard').animate({
                                left: "-=75%",
                                opacity: 1
                            },
                            500);
                    }
                }

            )
        }

    }

    async function displayChatMobile(event) {

        let chat = {
            'interlocutorID': event.target.innerText,
            'mensajes': []
        }


        interlocutorElementMobile.innerHTML = event.target.innerHTML;


        chat.mensajes = await getChat(chat.interlocutorID);


        messagesListElementMobile.innerHTML = '';
        chat.mensajes.forEach(
            (mensaje) => {

                mensaje = mensaje.data();
                let messageElement = document.createElement('li');

                messageElement.classList.add('align-self-end', 'badge', 'rounded-pill', 'bg-light', 'text-dark', 'mt-2');
                messageElement.innerHTML = `${mensaje.contenido}`;


                messagesListElementMobile.appendChild(messageElement);
            }
        );
    }








});