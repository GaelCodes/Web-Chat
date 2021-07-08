var db = firebase.firestore();
var usersCollection = db.collection("usuarios");

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('usuario logeado redirigiendo');
        // Logged
        location = './home/home.html';
    } else {
        // Not Logged
    }
});


/* 
    FIREBASE AUTHENTICATION
*/



// SIGN UP
//  Get elements + add event listeners

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
                var userData = userCredentials.user;

                var newUserDoc = usersCollection.doc(`${userData.uid}`);

                newUserDoc.set({
                        nombre: "",
                        email: userData.email,
                        photoURL: "",
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


// LOGIN

var signInButton = document.getElementById('signInButton');
var signInEmail = document.getElementById('signInEmail');
var signInPassword = document.getElementById('signInPassword');
var signInErrorsContainer = document.getElementById('signInErrorsContainer');

signInButton.addEventListener('click', loginUser);

function loginUser(event) {
    event.preventDefault();
    let email = signInEmail.value;
    let password = signInPassword.value;
    console.log(email, password);

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Navegar a HOME

            var userData = userCredential.user;
        })
        .catch((error) => {
            signInErrorsContainer.innerHTML = `Error : ${error.message}`;
        });
}


// FORM SELECTION

var radioButtons = document.getElementsByName('formsOptions');
var signInForm = document.getElementById('signInForm');
var signUpForm = document.getElementById('signUpForm');

radioButtons.forEach((radioButton) => {
    radioButton.addEventListener('change', changeForm);
})

function changeForm(event) {
    let form = event.target.value;
    if (form === 'SignInForm') {
        signUpForm.classList.toggle('d-none');
        signInForm.classList.toggle('d-none');
    } else if (form === 'SignUpForm') {
        signUpForm.classList.toggle('d-none');
        signInForm.classList.toggle('d-none');
    }
}

// METHODS

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}