const functions = require('firebase-functions');
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});
const axios = require('axios')
const express = require("express");
const nodemailer = require("nodemailer");
admin.initializeApp(functions.config().firebase);
var db = admin.firestore();
const sgMail = require('@sendgrid/mail');
const app = express();
// import * as cors from 'cors';
// const corsHandler = cors({origin: true});
// app.use(cors({origin: true}));
// app.use(cors())
app.use(express.urlencoded());
app.use(express.json());      // if needed

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yadavsourav24071998@gmail.com',
        pass: ''
    }
});

// admin.initializeApp(functions.config().firebase);
// var db = admin.firestore();

//
// authenticate

const authenticate = async (req, res, next) => {
    var _ = require("underscore"),
        nonSecurePaths = [
            "https://us-central1-verdant-abacus-186311.cloudfunctions.net/api/genqr",

        ];

    if (_.contains(nonSecurePaths, req.path)) return next();

    console.log("authenticate function");
    if (
        !req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ")
    ) {
        console.log(req.body);
        res.status(403).send("Unauthorized");
        return;
    }
    const idToken = req.headers.authorization.split("Bearer ")[1];
    try {
        console.log("idToken", idToken);
        const decodedIdToken = await admin
            .auth()
            .verifyIdToken(idToken)
            .then(claims => {
                console.log("claims", claims);

                req.user = claims;
                console.log(req.user);
                next();
                return;
            });
    } catch (e) {
        console.log("error above 403...");
        res.status(403).send("Unauthorized");
        return;
    }
};

app.use(cors);
exports.api = functions.https.onRequest(app)
app.post("/genqr", async (req, res) => {
    // const message = req.body.message;
    // console.log(req.body)
    // let output = []
    db.collection("tokens").where('email', '==', req.body.email).get().then((snapshot) => {
        // snapshot.forEach((doc) => {
        //     output.push(doc)
        // })
        console.log(snapshot.docs[0].data())
        res.status(200).json(snapshot.docs[0].data())
    }).catch = (error) => {
        console.log(error)
        res.status(500).send(error)
    }
    // try {
    //res.send("hello")   ye chal jata h
    //     // console.log("req", req);
    //     // console.log("req user", req.user);
    //     const data = {message: message};
    //     console.log("message", message);
    //     res.status(201).send({message: "works"});
    // } catch (error) {
    //     console.log("Error", error.message);
    //     res.sendStatus(500);
    // }
});
exports.valid = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        db.collection("tokens").where('email', '==', req.body.email).get().then((snapshot) => {
            // const data = snapshot.docs.map(doc => doc.data())
            res.send(snapshot.docs[0].id)
        })
    })
})
exports.denial = functions.https.onRequest((req, res) => {
    const mailOptions = {
        from: 'ENA <yadavsourav24071998@gmail.com>',
        to: req.body.email,
        subject: 'CITA AGENDADA', // email subject
        html: `<h2>Hola,</h2>
<br><p></p><span style="font-size: 20px;">Sorry your appointment has been declined.
</span>
<strong><p style="font-size: 19px;">¡Saludos!</p></strong>
`
    };
    // returning result
    return transporter.sendMail(mailOptions, (erro, info) => {
        if (erro) {
            return res.send(erro.toString());
        }
        return res.send('Thanks for your response.');
    });

})
exports.createUser = functions.firestore
    .document('tokens/{userId}')
    .onCreate((snap, context) => {
        // Get an object representing the document
        // e.g. {'name': 'Marie', 'age': 66}
        const newValue = snap.data();
        console.log(newValue)
        // access a particular field as you would any JS property
        const email = newValue.email;
        const name = newValue.name
        const mailOptions = {
            from: 'ENA <yadavsourav24071998@gmail.com>',
            to: email,
            subject: 'CITA AGENDADA', // email subject
            html: `<h2>Hola, ${name}</h2>
<br><p></p><span style="font-size: 20px;">
 ha atendido tu solicitud y te estará esperando el día (date of the appointment), a las time. </span>
<br><p></p><span style="font-size: 20px;">
Por favor no olvides mostrar tu credencial en recepción al entrar y salir del Corporativo ENA.</span>
<br>
<strong><p style="font-size: 20px;">¡Saludos!</p></strong>
`
        };

        // returning result
        return transporter.sendMail(mailOptions, (erro, info) => {
            if (erro) {
                // return res.send(erro.toString());
            }
            // return res.send('Sended');
        });


    });
exports.approvedmail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        console.log("ww")
        // getting dest email by query string
        // const dest = req.query.dest;

        const mailOptions = {
            from: 'NFS <yadavsourav24071998@gmail.com>',
            to: req.body.email,
            subject: 'CITA AGENDADA', // email subject
            html: `Hola, ${req.body.name}
<br>
 ha atendido tu solicitud y te estará esperando el día (date of the appointment), a las time. 
<br>
Por favor no olvides mostrar tu credencial en recepción al entrar y salir del Corporativo ENA.
<br>
<strong>¡Saludos!</strong>
`
        };

        // returning result
        return transporter.sendMail(mailOptions, (erro, info) => {
            if (erro) {
                return res.send(erro.toString());
            }
            return res.send('Sended');
        });
    });
});


exports.sendqr = functions.https.onRequest(async (req, res) => {
    db.collection('tokens')
        .add({
            email: req.query.email,
            location: req.query.location,
            name: req.query.name,
            date: req.query.date,
            time: req.query.time
        }).then((ref) => {
        res.json({result: `Thanks for your approval`})
        console.log("Added document with ID: ", ref.id);
    }).catch(error => {
        console.error("Error adding document: ", error);
    });
})

// exports.genqr = functions.https.onRequest((req, res) => {
//     corsHandler(req, res, () => {
//
//
//         // const markers = [];
//         // await db.collection('tokens').where('email', '==', req.body.email).get()
//         //     .then(querySnapshot => {
//         //         querySnapshot.docs.forEach(doc => {
//         //             markers.push(doc.data());
//         //         });
//         //     });
//         // res.send(markers)
//
//         // const data = []
//         db.collection("tokens").where('email', '==', req.body.email).get().then((snapshot) => {
//             const data = snapshot.docs.map(doc => doc.data())
//             // console.log(snapshot)
//
//             // snapshot.forEach((doc) => {
//             //     const {location} = doc.data();
//             //
//             //     todos.push({
//             //         location
//             //         // time, // DocumentSnapshot
//             //         // date
//             //
//             //     });
//             // });
//             // let dataa = snapshot.docs[0].data().location + " "
//             // const c=dataa+" "
//             // console.log(todos[0].location)
//             // const t = todos[0].location
//             // console.log(snapshot.docs[0].val())
//             // res.json({location: snapshot.docs[0].data().location, timestamp: snapshot.docs[0].data().time,date:snapshot.docs[0].data().date})
//             res.send(snapshot.docs[0].data())
//             // for (let i = 0; i < snapshot.size; i++) {
//             //     const data = snapshot.docs[i].id;
//             // // const data1 = snapshot.docs[i]._fieldsProto.location.stringValue; ye location ke liye tha
//             //     res.send(data)
//             // }
//         })
//         //
//         //
//     })
// })
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
    console.log("added", req.body.location.coords)
    // const l = JSON.parse(req.body.location.coords)

    res.send(req.body.location.coords)

})
exports.addtime = functions.https.onRequest(async (req, res) => {
    var time = Date.now();
    var d = new Date(time)
    db.collection('visits').add({
        date: d,
        email: req.body.email,
        name: req.body.name,
        stop: ""
    }).then(response => {
        res.send(d)
        console.log(response);
    }).catch(error => {
        console.error("Error adding document: ", error);
    });


})
exports.stoptime = functions.https.onRequest(async (req, res) => {

    var time = Date.now();
    var d = new Date(time)
    var id = ""

    db.collection("visits").where('email', '==', req.body.email).get().then((snapshot) => {
        // id =snapshot.docs[0].id+""
        db.collection("visits").doc(snapshot.docs[0].id).update({
            stop: d
        }).then(response => {
            console.log(response);
            res.send(d)

        }).catch(error => {
            console.error("Error adding document: ", error);
        });
    })


})

exports.add_profile_url = functions.https.onRequest(async (req, res) => {

    db.collection('pic')
        .add({
            email: req.body.email,
            url: req.body.url
        }).then(ref => {
        res.json({result: `Thanks for your approval`})
        console.log("Added document with ID: ", ref.id);
    }).catch(error => {
        console.error("Error adding document: ", error);
    });

})
exports.get_profile_url = functions.https.onRequest(async (req, res) => {
    return cors(req, res, () => {
        db.collection("pic").where('email', '==', req.body.email).get().then((snapshot) => {
            // const data = snapshot.docs.map(doc => doc.data())
            console.log(snapshot.docs[0].data().url)
            // console.log(data.location)
            res.send(snapshot.docs[0].data().url)

        })
    })
})