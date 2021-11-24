var usersCollection = db.collection("usuarios");


$(document).ready(function() {


    // BUSCADOR

    {
        function getUsers() {
            console.log('Trayendo usuarios');
            return usersCollection.get();
            // .then(
            //     (querySnapshot) => {
            //         querySnapshot.forEach((doc) => {
            //             // doc.data() is never undefined for query doc snapshots
            //             console.log(doc.id, " => ", doc.data());
            //         })
            //     }
            // );
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







})



// OBTENER DATOS DEL USUARIO
{
    function getUserData(userID) {

        // Get User Info
        let userDoc = usersCollection.doc(userID).get();

        return userDoc;
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

// OBTENER CHATS ABIERTOS
{
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
}

// MOSTRAR CHATS ABIERTOS
{

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

}

// OBTENER CHAT
{
    var messagesCollection;
    async function getChat(interlocutorID) {

        interlocutorID = interlocutorID.trim();

        messagesCollection = usersCollection.doc(user.uid).collection('conversaciones').doc(interlocutorID).collection('Mensajes');

        let messages = await messagesCollection.get();

        return messages.docs;
    }
}

// MOSTRAR CHAT
{
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

}