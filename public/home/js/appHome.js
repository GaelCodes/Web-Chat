var db = firebase.firestore();
var usersCollection = db.collection("usuarios");
var user;
var messagesCollection;
// Login state control
firebase.auth().onAuthStateChanged((userData) => {
    if (userData) {
        // Logged
        user = userData;
    } else {
        // Not Logged
        location = '../index.html';
    }
});

// LOGOUT
var logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', logoutUser);

function logoutUser() {
    firebase.auth().signOut()
        .catch((error) => {
            console.log(`Se ha producido el siguiente error: ${error}`);
        });
}