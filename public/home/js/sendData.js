// ENVIAR MENSAJE

var sendButtonMobile = document.getElementById('sendButtonMobile');
var inputNewMessageMobile = document.getElementById('inputNewMessageMobile');

var sendButtonDesktop = document.getElementById('sendButtonDesktop');
var inputNewMessageDesktop = document.getElementById('inputNewMessageDesktop');

sendButtonMobile.addEventListener('click', sendMessage);
sendButtonDesktop.addEventListener('click', sendMessage);

inputNewMessageDesktop.addEventListener('input', enableButton);
inputNewMessageMobile.addEventListener('input', enableButton);



function sendMessage(event) {

    if (event.target.id === 'sendButtonMobile') {
        var input = inputNewMessageMobile;
        var sendButton = sendButtonMobile;

    } else if (event.target.id === 'sendButtonDesktop') {
        var input = inputNewMessageDesktop;
        var sendButton = sendButtonDesktop;
    }

    messagesCollection.add({
            'emisor': 'yo',
            'contenido': input.value,
            'estado': 'enviado',
            'fecha': 'el día de hoy'
        }).then((docRef) => {
            input.value = "";
            sendButton.setAttribute('disabled', 'disabled');
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
}

function enableButton(event) {
    let sendButton = event.target.nextElementSibling;

    if (event.target.value != '') {
        sendButton.removeAttribute('disabled');

    } else {
        sendButton.setAttribute('disabled', 'disabled');
    }
}