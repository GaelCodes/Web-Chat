firebase.auth().onAuthStateChanged(async(user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User

        let userData = await getUserData(user.uid);
        displayUserData(userData.data());

        let openedChats = await getOpenedChats(user.uid);
        displayOpenedChats(openedChats);



    } else {
        // User is signed out

    }
});


// OBTENER DATOS DEL USUARIO
function getUserData(userID) {

    // Get User Info
    let userData = usersCollection.doc(userID).get();

    return userData;
}

// MOSTRAR DATOS DEL USUARIO


var userMenuElement = document.getElementById('userMenu');

function displayUserData(userData) {

    userMenuElement.innerHTML = `
    <img src="${userData.picture}" class="rounded w-25"></img>
    ${userData.email}
    `;

}



// OBTENER CHATS ABIERTOS

function getOpenedChats(userID) {

    return new Promise((resolve, reject) => {

        usersCollection.doc(userID).collection('conversaciones').get()
            .then(
                (conversaciones) => {
                    resolve(conversaciones.docs);
                }
            );

    });
}


// MOSTRAR CHATS ABIERTOS


var desktopChatListElement = document.getElementById('desktop-chat-list');
var mobileChatListElement = document.getElementById('mobile-chat-list');

async function displayOpenedChats(chatsDocs) {

    // OBTENER DATOS INTERLOCUTORES
    let interlocutorsData = [];

    for (const key in chatsDocs) {
        if (Object.hasOwnProperty.call(chatsDocs, key)) {
            const chat = chatsDocs[key];


            let interlocutorID = chat.data().refUser.id;

            let interlocutorData = await getUserData(interlocutorID);
            interlocutorData = interlocutorData.data();


            interlocutorsData.push(interlocutorData);

        }
    }

    // PINTAR EN PANTALLA
    interlocutorsData.forEach(
        (interlocutor) => {


            mobileChatListElement.innerHTML += `
            <li class="chat-item mb-2 badge p-0 text-dark d-block text-start">
            <button type="button" class="btn btn-primary w-100 text-start" data-bs-toggle="modal" data-bs-target="#chatModal">
            <img src="${interlocutor.picture}" class="rounded w-25"></img>    
                ${interlocutor.email}
            </button>
            </li>
            
            `;

            desktopChatListElement.innerHTML += `
            <li class="chat-item-md p-2 mb-2 badge bg-info text-dark d-block text-start">
            <img src="${interlocutor.picture}" class="rounded w-25"></img>    
                ${interlocutor.email}
            </li>
            
            `;
        }
    )

    // AÑADIR EVENT LISTENERS A LOS CHATS
    chatsElementsMobile = document.getElementsByClassName('chat-item');
    chatsElementsDesktop = document.getElementsByClassName('chat-item-md');

    for (const chatElementMobile of chatsElementsMobile) {
        chatElementMobile.addEventListener('click', displayChatMobile);
    }
    for (const chatElementDesktop of chatsElementsDesktop) {
        chatElementDesktop.addEventListener('click', displayChatDesktop);
    }

}


// OBTENER CHAT

async function getChat(interlocutorID) {

    interlocutorID = interlocutorID.trim();

    messagesCollection = usersCollection.doc(user.uid).collection('conversaciones').doc(interlocutorID).collection('Mensajes');

    let mensajes = await messagesCollection.get();

    return mensajes.docs;
}


// MOSTRAR CHAT


var interlocutorElementMobile = document.getElementById('chat-interlocutor');
var messagesListElementMobile = document.getElementById('messages-list');

var interlocutorElementDesktop = document.getElementById('chat-interlocutor-md');
var messagesListElementDesktop = document.getElementById('messages-list-md');



async function displayChatDesktop(event) {
    let chat = {
        'interlocutorID': event.target.innerText,
        'mensajes': []
    }

    interlocutorElementDesktop.innerHTML = event.target.innerHTML;


    chat.mensajes = await getChat(chat.interlocutorID);


    messagesListElementDesktop.innerHTML = '';
    chat.mensajes.forEach(
        (mensaje) => {

            mensaje = mensaje.data();
            let messageElement = document.createElement('li');

            messageElement.classList.add('align-self-end', 'badge', 'rounded-pill', 'bg-light', 'text-dark', 'mt-2');
            messageElement.innerHTML = `${mensaje.contenido}`;


            messagesListElementDesktop.appendChild(messageElement);
        }
    );

    // Habilitar el input

    inputNewMessageDesktop.removeAttribute('disabled');

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