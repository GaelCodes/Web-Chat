// FIREBASE AUTHENTICATHION

{
    var db = firebase.firestore();
    var usersCollection = db.collection("usuarios");

    // var userDocExist = false; QUITAR SI TODO FUNCIONA

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {

            usersCollection.doc(user.uid).get().then(
                (doc) => {

                    // If logged and document has been created will be redirected
                    if (doc.exists) {
                        location = '../../home/home.html';
                    }
                }

            )


        } else {
            // Not Logged
        }
    });
}

// REGISTER
//  Get elements + add event listeners
{
    var signUpButton = document.getElementById('signUpButton');
    var signUpEmail = document.getElementById('signUpEmail');
    var signUpPassword = document.getElementById('signUpPassword');
    var signUpPassword2 = document.getElementById('signUpPassword2');
    var signUpErrorsContainer = document.getElementById('signUpErrorsContainer');

    signUpButton.addEventListener('click', createUser);


    function createUser(event) {
        event.preventDefault();


        let email = signUpEmail.value
        let password = signUpPassword.value
        let password2 = signUpPassword2.value

        if (password === password2) {
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredentials) => {
                    // El usuario ha sido creado
                    var userData = userCredentials.user;

                    var newUserDoc = usersCollection.doc(`${userData.uid}`);

                    newUserDoc.set({
                            nombre: "",
                            email: userData.email,
                            photoURL: "gs://web-chat-de48b.appspot.com/default-avatar-usuario.png",
                        })
                        .then((data) => {
                            // El documento del usuario ha sido creado redirigiendo al HOME
                            // el usuario aparecerá logeado automáticamente
                            location = '../../home/home.html';
                        })
                        .catch((error) => {
                            console.log('Se ha producido el siguiente error: ', error);
                        });
                })
                .catch((error) => {

                    signUpErrorsContainer.innerHTML = `Error : ${error.message}`;

                });


        } else {
            var wrongPasswordNode = document.createElement('p');
            wrongPasswordNode.innerText = 'Error, las contraseñas no coinciden';
            insertAfter(wrongPasswordNode, signUpPassword2);
        }


    }
}

// METHODS
{
    function insertAfter(newNode, existingNode) {
        existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
    }
}