// FIREBASE AUTHENTICATION

{
    var db = firebase.firestore();
    // Login state control
    firebase.auth().onAuthStateChanged(async(user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User

            let userData = await getUserData(user.uid);
            // displayUserData(userData.data()); Arreglo1

            let openedChats = await getOpenedChats(user.uid);
            // displayOpenedChats(openedChats);  Arreglo1



        } else {

            // User is signed out
            location = '../index.html';

        }
    });
}

// LOGOUT

{
    var logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', logoutUser);

    function logoutUser() {
        firebase.auth().signOut()
            .catch((error) => {
                console.log(`Se ha producido el siguiente error: ${error}`);
            });
    }
}