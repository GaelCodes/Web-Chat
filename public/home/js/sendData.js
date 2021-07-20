// ENVIAR MENSAJE

var sendButton = document.getElementById('sendButton');
var inputNewMessage = document.getElementById('inputNewMessage');

sendButton.addEventListener('click', sendMessage);
inputNewMessage.addEventListener('input', enableButton);


function sendMessage() {
    messagesCollection.add({
            'emisor': 'yo',
            'contenido': inputNewMessage.value,
            'estado': 'enviado',
            'fecha': 'el día de hoy'
        }).then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            inputNewMessage.value = "";
            sendButton.setAttribute('disabled', 'disabled');
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
}

function enableButton() {
    console.log('Algo ha pasado con el input :O');
    if (inputNewMessage.value != '') {
        sendButton.removeAttribute('disabled');
    } else {
        sendButton.setAttribute('disabled', 'disabled');

    }
}