const functions = require('firebase-functions');

// // // https://firebase.google.com/docs/functions/write-firebase-functions

const qr = require('qr-image');
const cors = require("cors");
const express = require("express");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

/* Express with CORS & automatic trailing '/' solution */
const app = express();
app.use(cors({origin: true}));
app.use(express.urlencoded());
app.use(express.json());      // if needed

// exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
//     const email = user.email; // The email of the user.
//     const displayName = user.displayName; // The display name of the user.
// // const
//     var addDoc = db
//         .collection("visits")
//         .add({
//             name: displayName,
//             email: email
//
//         }).then(ref => {
//             console.log("Added document with ID: ", ref.id);
//         });
//
// });

exports.sendqr = functions.https.onRequest(async (req, res) => {
    db.collection('tokens')
        .add({
            email: req.query.email,
            location: req.query.location
        }).then(ref => {
        res.json({result: `Thanks for your approval`})
        console.log("Added document with ID: ", ref.id);
    }).catch(error => {
        console.error("Error adding document: ", error);
    });
})
// exports.genqr = functions.https.onRequest(async (req, res) => {
//
//     // res.set("Access-Control-Allow-Origin", "*");
//     //
//     // if (req.method === "OPTIONS") {
//     //     // Send response to OPTIONS requests
//     //     res.set("Access-Control-Allow-Methods", "GET");
//     //     res.set("Access-Control-Allow-Headers", "Content-Type");
//     //     res.set("Access-Control-Max-Age", "3600");
//     //     res.status(204).send("");
//     // } else {
//         db.collection("tokens").where('email', '==', req.body.email).get().then((snapshot) => {
//             for (let i = 0; i < snapshot.size; i++) {
//                 // const data1 = snapshot.docs[i]._fieldsProto.location.stringValue;
//                 const data = snapshot.docs[i].id
//                 res.send(data)
//             }
//         })
//     // }
// })
exports.genQR = functions.https.onRequest(   (req, res) => {



    // if (req.method === "OPTIONS") {
    //     // Send response to OPTIONS requests
    //     res.set("Access-Control-Allow-Methods", "POST");
    //     res.set("Access-Control-Allow-Headers", "Content-Type");
    //     res.set("Access-Control-Max-Age", "3600");
    //     res.status(204).send("");
    // }
    // else{

    db.collection("tokens").where('email', '==', req.body.email).get().then( (snapshot) => {
        // console.log(snapshot.docs[0].data())
        // res.set("Access-Control-Max-Age", "3600");
        const data =  snapshot.docs.map(doc => doc.data())
        console.log(data[0])
        res.set("Access-Control-Allow-Origin", "*");
        res.jsonp(snapshot.docs[0].id)
        // for (let i = 0; i < snapshot.size; i++) {
        //     const data = snapshot.docs[i].id;
        // // const data1 = snapshot.docs[i]._fieldsProto.location.stringValue; ye location ke liye tha
        //     res.send(data)
        // }
    })
    // }

})
exports.addDetails = functions.https.onRequest(async (req, res) => {
    // Add a new document with a generated id.
    db.collection('User_Details').add({
        name: req.body.name,
        email: req.body.email,
        address: req.body.address
    })
        .then(() => {
            console.log("User Details Added");
            res.json('added')
        })
        .catch(function (error) {
            res.json(error)
            console.error("Error adding details: ", error);
        });
});
exports.location = functions.https.onRequest(async (req, res) => {
    // console.log("added", req.body.location.coords)
    // const l = JSON.parse(req.body.location.coords)

    res.send(req.body.location.coords)

})
// exports.l=functions.https.onRequest(async (req, res) => {
//   res.send("hello")
// })