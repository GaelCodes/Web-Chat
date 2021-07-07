var db = firebase.firestore();

var docRef = db.collection("usuarios").doc("abigael-hf@hotmail.com");
var newMessageRef = db.doc("usuarios/abigael/conversaciones/abigael2/mensajes/mensaje3");

// newMessageRef.add()
// docRef.set()
// docRef.get()