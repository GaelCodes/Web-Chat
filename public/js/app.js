var db = firebase.firestore();
var auth = firebase.auth;

var usersCollection = db.collection("usuarios");


/* 
    FIREBASE AUTHENTICATION
*/

// SIGN UP
function createUser(email, password) {
    auth().createUserWithEmailAndPassword(email, password)
        .then((userCredentials) => {
            var userData = userCredentials.user;

            var newUserDoc = usersCollection.doc(`${userData.uid}`);

            newUserDoc.set({
                    nombre: "",
                    email: userData.email,
                    photoURL: "",
                })
                .then(() => {
                    // Navegar a HOME
                    console.log('Navegando a Home...');



                }).catch((error) => {
                    console.log('Se ha producido el siguiente error: ', error);
                });
        })
        .catch((error) => {

            console.log(`Se ha producido el siguiente error: ${error.code} :  ${error.message}`);

        });
}



// LOGIN
function loginUser(email, password) {
    auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Navegar a HOME

            var userData = userCredential.user;
        })
        .catch((error) => {
            console.log(`Se ha producido el siguiente error: ${error.code} :  ${error.message}`);
        });
}


// LOGOUT
function logoutUser() {
    auth().signOut()
        .then(() => {
            console.log('Signed Out');
        })
        .catch((error) => {
            console.log(`Se ha producido el siguiente error: ${error}`);
        });
}