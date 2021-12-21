// COLLECTIONS STRUCTURE 
// messages = db.collection(`users/${Sxp3K71KnROFTIegzpAK5ccnsuj1}/chats/${2thYZz4eWje7FicqRiGQrdiozoY2}/messages`);

var db = firebase.firestore();
var usersCollection = db.collection("users");
var user;


class Chat {
    //Estoy filtrando los mensajes al ser enviados
    // y recibidos(en el controlador y en el modelo respectivamente )
    // ¿es útil esta redundancia, o solo haría falta filtrar en el envío?
    constructor(id, lastMessage) {
        this.interlocutorId = id;
        this.interlocutorEmail = null;
        this.messages = [];
        this.observers = [];
        this.lastMessage = lastMessage;

        //Para evitar la emisión de errores establezco la url
        // a una imagen por defecto, hasta que se obtenga
        // la información del usuario en la suscripción a los datos del interlocutor(suscribeToInterlocutorData)
        this.interlocutorPictureUrl = 'https://firebasestorage.googleapis.com/v0/b/web-chat-de48b.appspot.com/o/default-avatar-usuario.png?alt=media&token=1942c2c5-33d2-4a0c-a70d-fd6e24c5cfdb';


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
            addedMessage = this.formatMessage(addedMessage);
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
        let filteredMessage = message;
        filteredMessage.content = escapeHTML(message.content);
        filteredMessage.content = filteredMessage.content.trim();
        return filteredMessage;
    }

    formatMessage(message) {
        // formateo de fecha
        message.date = new Date(message.date);
        message.date = message.date.toLocaleTimeString('es-ES').replace(/:[0-9]{2}$/g, '');
        let formatedMessage = message;
        return formatedMessage;
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
                this.lastMessage = auxChatData.lastMessage;
                this.notifyAllModifiedLastMessage();
            });
    }

    suscribeToInterlocutorData() {
        db.collection(`users`).doc(`${this.interlocutorId}`)
            .onSnapshot((InterlocutorDoc) => {
                let auxInterlocutorData = InterlocutorDoc.data();
                this.interlocutorEmail = auxInterlocutorData.email;
                this.interlocutorPictureUrl = auxInterlocutorData.pictureUrl;
                this.notifyAllModifiedInterlocutorData();
            });
    }

    suscribeToMessages() {
        db.collection(`users/${user.uid}/chats/${this.interlocutorId}/messages`)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
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

class ChatController {
    constructor(chat, chatView) {
        this.chat = chat;
        this.chatView = chatView;
        chat.registerObserver(chatView);
        chatView.populateChatTag(this.chat.copy());


        // Utilizo bind para establecer el contexto de ejecución en el ChatController
        // en lugar de en el elemento al que se le añade el evento
        this.chatView.chatTag.addEventListener('click', this.showMessages.bind(this));
        ChatView.chatCardSendButtonDesktop.addEventListener('click', this.sendMessageFromDesktop.bind(this));
        ChatView.chatCardInputDesktop.addEventListener('keyup', this.sendMessageWithEnterKey.bind(this));
        ChatView.chatCardHideChatCardButton.addEventListener('click', this.hideMessages.bind(this));
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
                            let chat = new Chat(chatData.id, chatData.lastMessage);
                            let chatView = new ChatView();
                            let chatController = new ChatController(chat, chatView);
                            ChatController.chats.push({ 'model': chat, 'view': chatView, 'controller': chatController });
                        }
                        if (change.type === "modified") {

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
        ChatView.chatCardInputDesktop.addEventListener('keyup', ChatController.enableOrDisableSendButton);
    }

    static findChat(interlocutorId) {
        let foundChatIndex = ChatController.chats.findIndex((chatComponent) => chatComponent.model.interlocutorId === interlocutorId);
        if (foundChatIndex != -1) {
            return ChatController.chats[foundChatIndex];
        } else {
            return false;
        }
    }

    async showMessages() {

        if (window.matchMedia('(max-width: 767px)').matches) {
            // Animation chatCardFadeIn Mobile

            this.chatView.populateChatCard(this.chat.copy());
            await this.chatView.animateChatCardZoomIn();
            ChatView.chatCardInputDesktop.disabled = false;
            ChatView.chatShowingMessages = this.chatView;

        } else {
            // Animation chatCard Desktop

            // Si ya se están mostrando los mensajes 
            // del chat en cuestión no pasará nada
            if (ChatView.chatShowingMessages != this.chatView) {
                $('.selected').removeClass('selected');
                // Sacaré la chatCard, cuando esté fuera se rellenará
                // y finalmente volverá a entrar entonces
                // se habilitará el input
                if (ChatView.chatShowingMessages) {
                    await this.chatView.animateChatCardFadeOutRight();
                }
                this.chatView.populateChatCard(this.chat.copy());
                await this.chatView.animateChatCardFadeInRight();
                ChatView.chatCardInputDesktop.disabled = false;
                this.chatView.chatTag.classList.add('selected');
                ChatView.chatShowingMessages = this.chatView;
            }
        }
    }

    async hideMessages() {

        if (ChatView.chatShowingMessages === this.chatView) {


            if (window.matchMedia('(max-width: 768px)').matches) {
                // Algorithm hide messages for mobile

                await this.chatView.animateChatCardZoomOut()
                $('#chatCard').addClass('d-none');
                $('#chatCard').removeClass('d-flex');
                this.chatView.resetChatCard();
                ChatView.chatCardInputDesktop.disabled = true;
                ChatView.chatShowingMessages = null;

            } else {
                // Algorithm hide messages for desktop
                $('.selected').removeClass('selected');
                await this.chatView.animateChatCardFadeOutRight();
                this.chatView.resetChatCard();
                ChatView.chatCardInputDesktop.disabled = true;
                ChatView.chatShowingMessages = null;

            }
        }

    }

    async sendMessage(messageContent) {
        let newMessage = {
            'author': user.uid,
            'content': messageContent,
            'state': 'enviado',
            'date': Date.now()
        }

        let messageFiltered = this.chat.filterMessage(newMessage);
        if (messageFiltered.content) {

            ChatView.chatCardInputDesktop.value = '';
            ChatController.enableOrDisableSendButton();

            createUpdateChatLastMessage.call(this, messageFiltered);
            setMessage.call(this, messageFiltered);
        }

        function createUpdateChatLastMessage(message) {
            // Actualizo el último mensaje del chat en receptor
            let receiverChatRef = `users/${this.chat.interlocutorId}/chats/${user.uid}`;
            db.doc(receiverChatRef).set({ 'lastMessage': message })
                .then()
                .catch(
                    (error) => {
                        console.log(error);
                    }
                );
            // Actualizo el último mensaje del chat en emisor
            let senderChatRef = `users/${user.uid}/chats/${this.chat.interlocutorId}`;
            db.doc(senderChatRef).set({ 'lastMessage': message })
                .then()
                .catch(
                    (error) => {
                        console.log(error);
                    }
                );
        }

        function setMessage(message) {
            setMessageReceiver.call(this, message);
            setMessageSender.call(this, message);
        }

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
            // Creo el mensaje
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

        if (ChatView.chatShowingMessages === this.chatView) {
            let messageContent = ChatView.chatCardInputDesktop.value;
            this.sendMessage(messageContent);
        }
    }

    sendMessageWithEnterKey(e) {
        if (e.keyCode === 13) {
            this.sendMessageFromDesktop();
        }
    }

    static enableOrDisableSendButton() {
        if (ChatView.chatCardInputDesktop.value.trim() != "") {
            ChatView.chatCardSendButtonDesktop.disabled = false;
        } else {
            ChatView.chatCardSendButtonDesktop.disabled = true;
        }
    }
}
ChatController.chats = [];

class ChatView {
    constructor() {
        this.chatTag = null;
        this.chatSpeechBubbles = [];
    }

    static init() {
        ChatView.chatsContainer = $('#chatsContainer ul')[0];

        ChatView.chatCard = $('#chatCard');
        ChatView.chatCardInterlocutorPicture = $('#chatCardInterlocutorPicture')[0];
        ChatView.chatCardInterlocutorEmail = $('#chatCardInterlocutorEmail')[0];
        ChatView.chatCardMessagesList = $('#messages-list-md')[0];
        ChatView.chatCardInputDesktop = $('#inputDesktop')[0];
        ChatView.chatCardSendButtonDesktop = $('#sendButtonDesktop')[0];
        ChatView.chatCardHideChatCardButton = $('#hideChatCardButton')[0];
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
        ChatView.speechBubbleState = document.createElement('span');
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
        this.chatTag.querySelector('.chatTagLastMessage').innerText = chat.lastMessage.content;
    }

    populateChatCard(chat) {
        ChatView.chatCardMessagesList.innerHTML = '';
        ChatView.chatCardInputDesktop.value = '';
        ChatView.chatCardInterlocutorPicture.src = chat.interlocutorPictureUrl;
        ChatView.chatCardInterlocutorEmail.innerText = chat.interlocutorEmail;

        for (let i = 0; i < this.chatSpeechBubbles.length; i++) {
            let speechBubble = this.chatSpeechBubbles[i];
            ChatView.chatCardMessagesList.append(speechBubble);
        }
    }

    setInitialPositionForFadeInRigh() {
        // Con getBoundingClientRect() obtengo las  
        // dimensiones y posición del chatTag
        $('#chatCard').css({
            'left': "175%",
            'position': 'absolute',
        });
        $('#chatCard').addClass('d-flex');
        $('#chatCard').removeClass('d-none');
    }

    animateChatCardFadeInRight() {
        this.setInitialPositionForFadeInRigh();
        return $('#chatCard').animate({
                left: "0",
                opacity: 1
            },
            500).promise();

    }

    animateChatCardFadeOutRight() {
        return $('#chatCard').animate({
                left: "+=75%",
                opacity: 0.25
            },
            500).promise();
    }

    setInitialPositionForZoomIn() {
        // Con getBoundingClientRect() obtengo las  
        // dimensiones y posición del chatTag
        let chatTagRectangle = this.chatTag.getBoundingClientRect();

        $('#chatCard').css({
            'opacity': 0.25,
            'position': 'absolute',
            'width': chatTagRectangle.width,
            'height': chatTagRectangle.height,
            'top': chatTagRectangle.y,
        });
        $('#chatCard').addClass('d-flex');
        $('#chatCard').removeClass('d-none');
    }

    animateChatCardZoomIn() {
        // Estado inicial del FadeIn
        this.setInitialPositionForZoomIn();

        // Estado final del fadeIn
        return $('#chatCard').animate({
            'opacity': 1,
            top: 0,
            height: "100vh",
            width: "100vw"
        }, "slow").promise();

    }

    animateChatCardZoomOut() {
        // Estado inicial es desplegado
        let chatTagRectangle = this.chatTag.getBoundingClientRect();
        return $('#chatCard').animate({
            'position': 'absolute',
            'opacity': 0.25,
            'top': chatTagRectangle.y,
            'height': chatTagRectangle.height,
        }, "slow").promise()


    }

    updateChatSpeechBubbles(changeType, newMessage) {
        if (changeType === "added") {
            // Por cada nuevo mensaje añado un nuevo chatSpeechBubble
            // hago que la clonación incluya los nodos hijos con el parámetro true
            let newSpeechBubble = ChatView.speechBubblePrototype.cloneNode(true);
            newSpeechBubble.querySelector('.speechBubbleMessageContent').innerText = newMessage.content;
            newSpeechBubble.querySelector('.speechBubbleMessageDate').innerText = newMessage.date;

            // Según el estado del mensaje, añadiré un ícono u otro ( enviado, recibido o leído )
            switch (newMessage.state) {
                case 'enviado':
                    newSpeechBubble.querySelector('.speechBubbleMessageState').innerHTML = '<i class="icon-enviado bi bi-check2"></i>';
                    break;
                case 'recibido':
                    newSpeechBubble.querySelector('.speechBubbleMessageState').innerHTML = '<i class="icon-recibido bi bi-check2-all"></i>';
                    break;
                case 'leido':
                    newSpeechBubble.querySelector('.speechBubbleMessageState').innerHTML = '<i class="icon-leido bi bi-check2-all"></i>';
                    break;
                default:
                    break;
            }
            // Según el author del mensaje será un mensaje enviado o recibido
            if (newMessage.author === user.uid) {
                newSpeechBubble.classList.add('sentMessage');
            } else {
                newSpeechBubble.classList.add('receivedMessage');
            }

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

    resetChatCard() {
        ChatView.chatShowingMessages = null;
        ChatView.chatCardInterlocutorPicture.src = 'https://firebasestorage.googleapis.com/v0/b/web-chat-de48b.appspot.com/o/default-avatar-usuario.png?alt=media&token=1942c2c5-33d2-4a0c-a70d-fd6e24c5cfdb';
        ChatView.chatCardInterlocutorEmail.innerText = '';
        ChatView.chatCardMessagesList.innerHTML = '';
        ChatView.chatCardInputDesktop.value = '';
    }
}
//Inicializo las variables globales de la vista
ChatView.chatShowingMessages = null;
ChatView.chatsContainer = null;
ChatView.chatCard = null;

class Searcher {

    constructor() {
        throw new Error("Can't instantiate abstract class!");
    }

    static init() {
        Searcher.foundUsers = [];
        Searcher.input = $('input[type="search"]')[0];
        Searcher.input.addEventListener('focus', Searcher.getUsers);
        Searcher.input.addEventListener('keyup', Searcher.filterUsers);
    }

    static getUsers() {
        // Compruebo si ya ha obtenido la lista de usuarios
        if (Searcher.foundUsers.length === 0) {
            db.collection(`users`)
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "added") {
                            let foundUserData = change.doc.data();
                            foundUserData.id = change.doc.id;

                            // El usuario no podrá enviarse mensajes así mismo por lo tanto,
                            // nunca debe estar en la lista de búsqueda
                            if (foundUserData.id != user.uid) {
                                let foundUser = new FoundUser(foundUserData.id, foundUserData.email, foundUserData.pictureUrl);
                                let foundUserView = new FoundUserView();
                                let foundUserController = new FoundUserController(foundUser, foundUserView);
                                Searcher.foundUsers.push({ 'model': foundUser, 'view': foundUserView, 'controller': foundUserController });
                            }
                        }
                        if (change.type === "modified") {
                            let modifiedFoundUserData = change.doc.data();
                            modifiedFoundUserData.id = change.doc.id;

                            // El usuario no podrá enviarse mensajes así mismo por lo tanto,
                            // nunca habrá estado en la lista de búsqueda
                            if (modifiedFoundUserData.id != user.uid) {
                                let modifiedFoundUserIndex = this.foundUsers.findIndex((foundUser) => foundUser['model'].id === modifiedFoundUserData.id);
                                Searcher.foundUsers[modifiedFoundUserIndex]['model'].updateFoundUser(modifiedFoundUserData);
                            }
                        }
                        if (change.type === "removed") {
                            let removedFoundUserData = change.doc.data();
                            removedFoundUserData.id = change.doc.id;

                            // El usuario no podrá enviarse mensajes así mismo por lo tanto,
                            // nunca habrá estado en la lista de búsqueda
                            if (removedFoundUserData.id != user.uid) {
                                let removedFoundUserIndex = this.foundUsers.findIndex((foundUser) => foundUser[0].id === modifiedFoundUserData.id);
                                Searcher.foundUsers.splice(removedFoundUserIndex, 1);
                            }
                        }
                    });
                });
        } else {
            // Si ya tiene los usuarios y gana focus simplemente filtrará
            Searcher.filterUsers();
        }
    }

    static filterUsers() {

        let searchedString = Searcher.input.value;
        Searcher.foundUsers.forEach(
            (foundUser) => {
                if (foundUser.model.email.includes(searchedString)) {
                    foundUser.view.showFoundUser.call(foundUser.view);
                } else {
                    foundUser.view.hideFoundUser.call(foundUser.view);
                }
            }
        )
    }
}
//Inicializo las variables globales
Searcher.usersList = null;
Searcher.users = null;
Searcher.input = null;
Searcher.foundUsers = [];

class User {
    constructor(id, email, pictureUrl) {
        this.id = id;
        this.email = email;
        this.pictureUrl = pictureUrl;
    }
}

class FoundUser extends User {
    constructor(id, email, pictureUrl) {
        super(id, email, pictureUrl);
        this.observers = [];
    }

    registerObserver(observer) {
        this.observers.push(observer);
    }

    unregisterObserver(observer) {
        let observerIndex = this.observers.indexOf(observer);
        this.observers.splice(observerIndex, 1);
    }

    copy() {
        return {
            email: this.email,
            pictureUrl: this.pictureUrl
        }
    }

    updateFoundUser(modifiedFoundUserData) {
        this.picture = foundUser.picture;
        this.notifyAll();
    }

    notifyAll() {
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].update(this.copy());
        }
    }
}

class FoundUserController {
    constructor(foundUser, foundUserView) {
        this.foundUser = foundUser;
        this.foundUserView = foundUserView;
        this.foundUser.registerObserver(this.foundUserView);
        this.foundUserView.populate(this.foundUser.copy());

        // Event listeners
        this.foundUserView.foundUserTag.addEventListener('click', this.chatWithFoundUser.bind(this));
    }

    chatWithFoundUser() {
        // Si no existe el chat lo precreo, si existe ábrelo
        let foundChat = ChatController.findChat(this.foundUser.id);
        if (foundChat) {
            foundChat.controller.showMessages();
        } else {
            this.preCreateChat();
        }
    }

    preCreateChat() {

        // La precreación del chat es simplemente crearlo en la colección de chats del usuario
        // y no en el destinatario
        db.collection(`users/${user.uid}/chats`).doc(`${this.foundUser.id}`).set({
                lastMessage: "Sin mensajes"
            })
            .then(() => {
                // Una vez creado lo busco nuevamente y se lo abro al usuario
                let foundChat = ChatController.findChat(this.foundUser.id);
                foundChat.controller.showMessages();
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }
}

class FoundUserView {
    constructor() {
        // Paso el parámetro true para que la clonación sea profunda
        this.foundUserTag = FoundUserView.foundUserTagPrototype.cloneNode(true);
    }

    static init() {
        FoundUserView.foundUsersList = document.getElementById('foundUsersList');
        FoundUserView.foundUserTagPrototype = document.createElement('li');
        FoundUserView.foundUserTagPrototype.classList.add('foundUserTag');
        FoundUserView.foundUserEmail = document.createElement('p');
        FoundUserView.foundUserEmail.classList.add('foundUserEmail');
        // La foundUserTag del usuario encontrado tendrá una imagen
        // inicial por defecto hasta que se carguen los datos
        // del usuario encontrado
        FoundUserView.foundUserPicture = document.createElement('img');
        FoundUserView.foundUserPicture.classList.add('foundUserPicture');
        FoundUserView.foundUserPicture.src = 'https://firebasestorage.googleapis.com/v0/b/web-chat-de48b.appspot.com/o/default-avatar-usuario.png?alt=media&token=1942c2c5-33d2-4a0c-a70d-fd6e24c5cfdb';

        FoundUserView.foundUserTagPrototype.append(FoundUserView.foundUserPicture);
        FoundUserView.foundUserTagPrototype.append(FoundUserView.foundUserEmail);
    }

    populate(foundUser) {
        this.foundUserTag.querySelector('.foundUserPicture').src = foundUser.pictureUrl;
        this.foundUserTag.querySelector('.foundUserEmail').innerText = foundUser.email;
        FoundUserView.foundUsersList.append(this.foundUserTag);
    }

    update(foundUser) {
        this.foundUserTag.querySelector('foundUserPicture').src = foundUser.pictureUrl;
    }

    showFoundUser() {
        this.foundUserTag.style.display = 'flex';
    }

    hideFoundUser() {
        this.foundUserTag.style.display = 'none';
    }
}
//Inicializo las variables globales
FoundUserView.foundUsersList = null;

function escapeHTML(text) {
    var replacements = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' };
    return text.replace(/[<>&"]/g, function(character) {
        return replacements[character];
    });
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
            Searcher.init();
            FoundUserView.init();
        } else {
            // User is signed out

            location = '../index.html';
        }
    });


    // Función que muestra los datos del usuario
    function displayUserData(userData) {
        $('#userBadge').html(`
        <img src="https://firebasestorage.googleapis.com/v0/b/web-chat-de48b.appspot.com/o/default-avatar-usuario.png?alt=media&token=1942c2c5-33d2-4a0c-a70d-fd6e24c5cfdb" alt="Imagen no encontrada">
                        <p class="p-0 m-0 mx-2">${userData.email}</p>
        
        `);
    }
    // Función que obtiene los datos del usuario
    function getUserData(userID) {

        return usersCollection.doc(userID).get();

    }


    // LOGOUT
    var logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', logoutUser);

    function logoutUser() {
        firebase.auth().signOut()
            .catch((error) => {
                console.log(`Se ha producido el siguiente error: ${error}`);
            });
    }

});