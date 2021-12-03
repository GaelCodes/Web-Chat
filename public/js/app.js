// Guardia
firebase.auth().onAuthStateChanged((user) => {
    if (user) {

        usersCollection.doc(user.uid).get().then(
            (doc) => {

                // If logged and document has been created will be redirected
                if (doc.exists) {
                    location = './home/home.html';
                }
            }

        )


    } else {
        // Usuario no logueado
    }
});

// Funciones
function loginUser(event) {
    if (event.code === "Enter" || event.type === "click") {
        event.preventDefault();
        let email = signInEmail.value;
        let password = signInPassword.value;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Navegará a HOME por el evento firebase.auth().onAuthStateChanged 
            })
            .catch((error) => {
                signInErrorsContainer.innerHTML = `Error : ${error.message}`;
            });
    }

}

//Elementos de librerías

var db = firebase.firestore();
var usersCollection = db.collection("usuarios");


//Elementos del DOM
var signInForm = document.getElementById('signInForm');
var signInButton = document.getElementById('signInButton');
var signInEmail = document.getElementById('signInEmail');
var signInPassword = document.getElementById('signInPassword');
var signInErrorsContainer = document.getElementById('signInErrorsContainer');

// Events listener y funciones que detonan
signInButton.addEventListener('click', loginUser);
signInForm.addEventListener('keydown', loginUser)