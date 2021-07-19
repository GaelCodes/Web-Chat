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

    userMenuElement.innerText = userData.email;

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

            desktopChatListElement.innerHTML += `
            <li class="p-2 mb-2 badge bg-info text-dark d-block text-start">
            <img src="${interlocutor.picture}" class="rounded w-25"></img>    
                ${interlocutor.email}
            </li>
            
            `;
        }
    )

}