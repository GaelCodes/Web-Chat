//     FIREBASE AUTHENTICATION
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
                        location = './home/home.html';
                    }
                }

            )


        } else {
            // Not Logged
        }
    });

}


// LOGIN
{
    var signInButton = document.getElementById('signInButton');
    var signInEmail = document.getElementById('signInEmail');
    var signInPassword = document.getElementById('signInPassword');
    var signInErrorsContainer = document.getElementById('signInErrorsContainer');

    signInButton.addEventListener('click', loginUser);

    function loginUser(event) {
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