var db = firebase.firestore();
var usersCollection = db.collection("usuarios");
var user;

$(document).ready(function() {

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
        async function showUsers(params) {


            if (!users)
                users = await getUsers();

            // Si el buscador no está vacio dejalo filtrar, no muestres la lista completa
            if (buscador.val().trim() == '') {
                usersList.html(' ');
                for (let i = 0; i < 5; i++) {

                    let userData = users.docs[i].data();

                    usersList.append(`
                    <li class="dropdown-item chat-item-md p-2 mb-2 badge bg-info text-dark d-block text-start">
                        <img src="${userData.picture}" class="rounded w-25"></img>    
                        <p>${userData.email}</p>
                    </li>`);

                }
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
                        <li class="dropdown-item chat-item-md p-2 mb-2 badge bg-info text-dark d-block text-start">
                            <img src="${picture}" class="rounded w-25"></img>    
                            <p>${email}</p>
                        </li>`);

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
        return usersCollection.doc(userID).collection('conversaciones').get();
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
                    <li class="chat-item-md p-2 mb-2 badge bg-info text-dark d-block text-start" data-fs-id="${interlocutor.id}">
                    <img src="${interlocutor.picture}" class="rounded w-25"></img>    
                        ${interlocutor.email}
                    </li>`
                );
            }
        )

        // // AÑADIR EVENT LISTENERS A LOS CHATS
        // chatsElementsMobile = document.getElementsByClassName('chat-item');
        let chatsElementsMobile = $('.chat-item');
        chatsElementsMobile.click(displayChatMobile);

        // chatsElementsDesktop = document.getElementsByClassName('chat-item-md');
        let chatsElementsDesktop = $('.chat-item-md');
        chatsElementsDesktop.click(displayChatDesktop);



        // for (const chatElementMobile of chatsElementsMobile) {
        //     chatElementMobile.click(displayChatMobile());
        // }
        // for (const chatElementDesktop of chatsElementsDesktop) {
        //     chatElementDesktop.click(displayChatDesktop());
        // }

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



// OBTENER DATOS DEL USUARIO
{
    function getUserData(userID) {

        return usersCollection.doc(userID).get();

    }

}

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




// OBTENER CHAT

var messagesCollection;
async function getChat(interlocutorID) {

    messagesCollection = usersCollection.doc(user.uid).collection('conversaciones').doc(interlocutorID).collection('Messages');

    let messages = await messagesCollection.get();

    return messages.docs;
}


// MOSTRAR CHAT

var interlocutorMobile = $('#chat-interlocutor');
var interlocutorDesktop = $('#chat-interlocutor-md');

var messagesListMobile = $('#messages-list');
var messagesListDesktop = $('#messages-list-md');

async function displayChatDesktop(event) {
    console.log(event);

    let chat = {
        'interlocutorID': event.target.dataset.fsId,
        'menssages': []
    }

    // interlocutorElementDesktop.innerHTML = event.target.innerHTML;
    $('#chat-interlocutor-md').html(event.target.innerHTML);
    console.log($('#chat-interlocutor-md'));
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

    // inputNewMessageDesktop.removeAttribute('disabled');

}

async function displayChatMobile(event) {

    let chat = {
        'interlocutorID': event.target.innerText,
        'mensajes': []
    }

    console.log(event.target.innerHTML);
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