var db = firebase.firestore();
var usersCollection = db.collection("usuarios");

// Login state control
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Logged
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