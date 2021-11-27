// COLLECTIONS STRUCTURE 
// messages = db.collection(`usuarios/${Sxp3K71KnROFTIegzpAK5ccnsuj1}/conversaciones/${2thYZz4eWje7FicqRiGQrdiozoY2}/messages`);

var db = firebase.firestore();
var usersCollection = db.collection("usuarios");
var user;


$(document).ready(function() {

    // FIREBASE

    firebase.auth().onAuthStateChanged(async(userAuth) => {
        if (userAuth) {
            user = userAuth;
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User

            let userData = await getUserData(user.uid);
            // displayUserData(userData.data()); Arreglo1

            let openedChats = await getOpenedChats(user.uid);
            displayOpenedChats(openedChats);



        } else {

            // User is signed out
            location = '../index.html';

        }
    });

    // BUSCADOR

    {


        function getUsers() {
            return usersCollection.get();

        }

        var usersList = $('#foundUsersList');
        var users;
        async function showUsers() {


            if (!users)
                users = await getUsers();

            // Si el buscador no está vacio dejalo filtrar, no muestres la lista completa
            if (buscador.val().trim() == '') {
                usersList.html(' ');
                for (let i = 0; i < 5; i++) {

                    let userData = users.docs[i].data();
                    userData.id = users.docs[i].id;
                    usersList.append(`
                    <li class="found-user dropdown-item chat-item-md p-2 mb-2 badge bg-info text-dark d-block text-start" data-fs-id="${userData.id}">
                        <img src="${userData.picture}" class="rounded w-25"></img>    
                        <p>${userData.email}</p>
                    </li>`);

                }

                $('.found-user').click(createChat);
            }

        }

        function filterUsers(params) {

            // Compruebo si ya ha obtenido la lista de usuarios
            if (users) {
                usersList.html('');

                // Bucle para mostrar solo 5 usuarios que encajen como máximo
                let numUser = 0;
                let numUsersMatched = 0;
                while (numUsersMatched < 5 && numUser < users.docs.length) {
                    let userDoc = users.docs[numUser];
                    let email = userDoc.data().email;
                    let picture = userDoc.data().picture;

                    if (email.includes(buscador.val().toLowerCase()) && buscador.val() != '') {


                        usersList.append(`
                        <li class="found-user dropdown-item chat-item-md p-2 mb-2 badge bg-info text-dark d-block text-start" data-fs-id="${userDoc.id}">
                            <img src="${picture}" class="rounded w-25"></img>    
                            <p>${email}</p>
                        </li>`);

                        $('.found-user').click(createChat);
                        numUsersMatched++;
                    }

                    numUser++;
                }
            }
        }

        var buscador = $('[type="search"]');
        buscador.focus(showUsers);
        buscador.keyup(filterUsers);

    }


    // OBTENER CONVERSACIONES ABIERTAS

    function getOpenedChats(userID) {
        let conversCollection = `usuarios/${userID}/conversaciones`;
        return db.collection(conversCollection).get();
    }


    // MOSTRAR CONVERSACIONES ABIERTAS


    var desktopChatList = $('#desktop-chat-list');
    var mobileChatList = $('#mobile-chat-list');

    async function displayOpenedChats(chatsDocs) {

        // OBTENER DATOS INTERLOCUTORES
        let interlocutorsData = [];

        for (let i = 0; i < chatsDocs.docs.length; i++) {
            const chatDoc = chatsDocs.docs[i];

            await getUserData(chatDoc.id)
                .then(
                    (interlocutorDoc) => {
                        let interlocutorData = interlocutorDoc.data();
                        interlocutorsData.push(interlocutorData);
                    }
                );
            // El id de la conversacion es el id del interlocutor
            interlocutorsData[i].id = chatDoc.id
        }

        // PINTAR EN PANTALLA
        interlocutorsData.forEach(
            (interlocutor) => {

                mobileChatList.append(
                    `
                        <li class="chat-item mb-2 badge p-0 text-dark d-block text-start">
                        <button type="button" class="btn btn-primary w-100 text-start" data-bs-toggle="modal" data-bs-target="#chatModal" data-fs-id="${interlocutor.id}">
                        <img src="${interlocutor.picture}" class="rounded w-25"></img>    
                            ${interlocutor.email}
                        </button>
                        </li> `
                );
                desktopChatList.append(
                    `
                        <li class="chat-item-md d-flex justify-content-around align-items-center  p-2 mb-2 badge bg-info text-dark d-block text-start" data-fs-id="${interlocutor.id}" style="display:none">
                            <img src="${interlocutor.picture}" class="rounded-circle w-25 "></img>    
                            <p>${interlocutor.email}</p>
                            <button type="button" class="deleteChatButton btn btn-secondary"><i class="bi bi-trash"></i></button>
                        </li>`
                );
            }
        );

        // // AÑADIR EVENT LISTENERS A LOS CHATS
        let chatsElementsMobile = $('.chat-item');
        chatsElementsMobile.click(displayChatMobile);

        let chatsElementsDesktop = $('.chat-item-md');
        $('.chat-item-md').fadeIn(400, function() {
            // Animation complete
        });
        chatsElementsDesktop.click(displayChatDesktop);

        // Añadir evento al delete Button
        $('.deleteChatButton').click(deleteChat);
    }


    // CREAR CHAT

    function createChat(event) {
        console.log('Evento click en foundUser', event);
        let interlocutorID = event.currentTarget.dataset.fsId;
        let conversationHTML = event.currentTarget.outerHTML;
        let newChat = $(conversationHTML).removeClass('found-user dropdown-item');


        // Si no existe el chat crea uno, si existe abrelo
        if (!$(`#desktop-chat-list [data-fs-id="${interlocutorID}"]`).length) {



            $('#desktop-chat-list').prepend(newChat[0]);
            newChat = $(`#desktop-chat-list [data-fs-id="${interlocutorID}"]`);

            newChat.click(displayChatDesktop).click();

        } else {

            let chat = $(`#desktop-chat-list [data-fs-id="${interlocutorID}"]`);
            chat.click();
        }


        // let messagesCollection = db.collection(`usuarios/Sxp3K71KnROFTIegzpAK5ccnsuj1/conversaciones/2thYZz4eWje7FicqRiGQrdiozoY2/messages`);

        // messagesCollection.add({
        //     author: "tutancamon",
        //     content: "Mensaje importante",
        //     date: Date.now(),
        //     state: "created"
        // });
    }

    // BORRAR CHAT

    function deleteChat(event) {


        deleteAtPath(`usuarios/${user.uid}/conversaciones/${event.currentTarget.dataset.fsId}`);


        function deleteAtPath(path) {
            var deleteFn = firebase.functions().httpsCallable('recursiveDelete');
            deleteFn({ path: path })
                .then(function(result) {
                    logMessage('Delete success: ' + JSON.stringify(result));
                })
                .catch(function(err) {
                    logMessage('Delete failed, see console,');
                    console.warn(err);
                });
        }


    }


    // ENVIAR MENSAJE

    var inputDesktop = '#inputDesktop';
    var sendButtonDesktop = '#sendButtonDesktop';
    $(sendButtonDesktop).click(sendMessage);
    $(inputDesktop).on('input', enableButton);

    async function sendMessage(event) {

        if (event.currentTarget.id === 'sendButtonMobile') {
            var input = inputNewMessageMobile;
            var sendButton = sendButtonMobile;

        } else if (event.currentTarget.id === 'sendButtonDesktop') {
            var input = $(inputDesktop);
            var sendButton = sendButtonDesktop;
        }

        let message = {
            'emisor': 'yo',
            'content': input.val(),
            'estado': 'enviado',
            'fecha': Date.now()
        }

        let chatExistsInSender = await checkChatInSender();
        let chatExistsInReceiver = await checkChatInReceiver();

        if (chatExistsInSender && chatExistsInReceiver) {
            setMessageSender(message);
            setMessageReceiver(message);
        } else if (chatExistsInReceiver) {
            console.log('El chat existe en receptor');
            setMessageReceiver(message);
            createChatSender(message);
        } else if (chatExistsInSender) {
            console.log('El chat existe en emisor');
            createChatReceiver(message);
            setMessageSender(message);
        } else {
            console.log('El chat existe no existe en ninguno de los 2');
            createChatReceiver(message);
            createChatSender(message);
        }

        function checkChatInSender() {
            let chatRef = `usuarios/${user.uid}/conversaciones/${chat.interlocutorID}`;

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
            let chatRef = `usuarios/${chat.interlocutorID}/conversaciones/${user.uid}`;

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
            let newChatRef = `usuarios/${chat.interlocutorID}/conversaciones/${user.uid}`;
            db.doc(newChatRef).set({ 'dummy': 'dummy' })
                .then(
                    (data) => {
                        console.log('Chat creado en receptor', chat.interlocutorID);
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
            let newChatRef = `usuarios/${user.uid}/conversaciones/${chat.interlocutorID}`;

            db.doc(newChatRef).set({ 'dummy': 'dummy' })
                .then()
                .catch(
                    (error) => {
                        console.log(error);
                    }
                );


            setMessageSender(message);
        };

        function setMessageReceiver(message) {

            let messagesRef = `usuarios/${chat.interlocutorID}/conversaciones/${user.uid}/messages`;

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
            let messagesRef = `usuarios/${user.uid}/conversaciones/${chat.interlocutorID}/messages`;

            db.collection(messagesRef).add(message)
                .then(
                    (data) => {
                        input.val("");
                        $(sendButtonDesktop).attr('disabled');
                    }
                )
                .catch(
                    (error) => {
                        console.log(error);
                    }
                );
        };
    }





    function enableButton(event) {
        let sendButton = event.target.nextElementSibling;

        if (event.target.value != '') {
            sendButton.removeAttribute('disabled');

        } else {
            sendButton.setAttribute('disabled', 'disabled');
        }
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


    // OBTENER CHAT

    var messagesCollection;
    async function getChat(interlocutorID) {

        // messagesCollection = usersCollection.doc(user.uid).collection('conversaciones').doc(interlocutorID).collection('Messages');
        messagesCollection = db.collection(`usuarios/${user.uid}/conversaciones/${interlocutorID}/messages`);

        let messages = await messagesCollection.get();

        return messages.docs;
    }


    // MOSTRAR CHAT

    var interlocutorMobile = $('#chat-interlocutor');
    var interlocutorDesktop = $('#chat-interlocutor-md');

    var messagesListMobile = $('#messages-list');
    var messagesListDesktop = $('#messages-list-md');

    var chat = { 'interlocutorID': '', 'messages': [] };
    async function displayChatDesktop(event) {

        animarSalida();

        function animarSalida() {

            $('#chatCard').animate({
                    left: "+=75%",
                    opacity: 0.25
                },
                500,
                async function RellenarDatos() {

                    $(inputDesktop).val(""); // Limpio el input 

                    chat.interlocutorID = event.currentTarget.dataset.fsId;

                    // interlocutorElementDesktop.innerHTML = event.target.innerHTML;
                    $('#chat-interlocutor-md').html(event.currentTarget.innerHTML);

                    chat.messages = await getChat(chat.interlocutorID);


                    $('#messages-list-md').html('');
                    chat.messages.forEach(
                        (message) => {

                            message = message.data();
                            // let messageElement = document.createElement('li');

                            // messageElement.classList.add('align-self-end', 'badge', 'rounded-pill', 'bg-light', 'text-dark', 'mt-2');
                            // messageElement.innerHTML = `${mensaje.contenido}`;

                            $('#messages-list-md').append()
                            messagesListDesktop.append(`
                            <li class="align-self-end badge rounded-pill bg-light text-dark mt-2">                
                                ${message.content}                
                            </li>`);

                            console.log('Notiene ningun mensaje: ' + message);

                        }
                    );

                    // // Habilitar el input

                    $(inputDesktop).removeAttr('disabled');


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



    // OBTENER DATOS DEL USUARIO

    function getUserData(userID) {

        return usersCollection.doc(userID).get();

    }




});










// MOSTRAR DATOS DEL USUARIO Arreglo1
// {

//     var userMenuElement = document.getElementById('userMenu');

//     function displayUserData(userData) {

//         userMenuElement.innerHTML = `
//     <img src="${userData.picture}" class="rounded w-25"></img>
//     ${userData.email}
//     `;

//     }

// }