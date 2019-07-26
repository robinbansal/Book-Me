import React, {Component, PureComponent} from 'react';
import {StyleSheet, View, TextInput, TouchableOpacity, Text, Button,} from 'react-native';
import QRCode from 'react-native-qrcode';
import axios from 'axios';
import  * as firebase from "firebase";
import {Firestore as firestore} from "firebase/firestore";
import '@firebase/firestore'

let u = ''

class App extends Component {
    constructor() {
        super();
        // this.ref = firebase.firestore().collection('tokens');
        this.em = this.em.bind(this)
        this.state = {
            inputValue: '',
            valueForQRCode: '',
            inputEmail: '',
            url: "",
            isAllowed: false,
            registerValid: ""
        };

    }


    getTextInputValue = () => {
        var user = firebase.auth().currentUser;

        // console.warn(user.email)
        // console.warn("inner res", response1)
        // Create a reference to the file we want to download
        var storag = firebase.storage()
        var storageRef = storag.ref('/images')
        // console.warn("storageref", storageRef)
        var starsRef = storageRef.child(`/${user.uid}`);
        // console.warn("starsref", starsRef)

        starsRef.getDownloadURL()
            .then( (url) => {
                console.warn("urlllll", url)
                    firebase.firestore().collection('tokens').where('email', '==', user.email).get().then((snapshot) => {
                    console.warn("sanpo")
                    // console.warn("snap", snapshot.docs[0])
                }).catch((error) => {
                    console.warn(error)
                })
                // u=url
                // this.setState({
                //     url: url
                // })
                // var user = firebase.auth().currentUser
                // fetch("https://us-central1-verdant-abacus-186311.cloudfunctions.net/api/genqr", {
                //     method: 'POST',
                //     headers: {
                //         'Accept': 'application/json',
                //         'Content-Type': 'application/json'
                //     },
                //     body: JSON.stringify({
                //
                //         email: user.email,
                //     })
                // })
                //     .then((data) => {
                //         console.warn('Request success: ', data);
                //     })
                //     .catch(function (error) {
                //         console.warn('Request failure: ', error);
                //     });
                // axios.post('https://us-central1-verdant-abacus-186311.cloudfunctions.net/api/genqr', {
                //     email: 'thesuesanz00@gmail.com',
                // })
                //     .then((response) => {
                //         // var d = new Date(response.data.timestamp)
                //         console.warn(response)
                //         // console.warn(response.data)
                //         // console.warn("urll ", u)
                //         // // console.warn(response.data.location)
                //         // // console.warn(response.data.timestamp)
                //         // // console.warn(response.data.location)
                //         // // console.warn("hello")
                //         // // this.setState({
                //         // //     valueForQRCode: "Name: " + user.displayName + "\n" + "VerifiedEmail id: " + user.email + "\n" + "Location:"
                //         // //         + response.data.location + "\n Time: " + d +
                //         // //         "\n" + "Profile_pic_url: "
                //         // // })
                //     })
                //     .catch((error) => {
                //
                //         console.warn("Inner Error: ", error);
                //     });
            })
            .catch(function (error) {
                console.warn("outer", error)
            });

    };
    em = async() => {
        var user = firebase.auth().currentUser;
        console.warn(user.email)
    await    firebase.firestore().collection('tokens').where('email', '==', user.email).get().then((snapshot) => {
                console.warn("sanpo")
                // console.warn("snap", snapshot.docs[0])
            }).catch((error) => {
            console.warn(error)
        })

    }

    // componentWillMount() {
    //     var user = firebase.auth().currentUser;
    //     axios({
    //         method: 'post',
    //         url: 'https://us-central1-verdant-abacus-186311.cloudfunctions.net/valid',
    //         data: {
    //             email: user.email
    //         }
    //     }).then((response1) => {
    //
    //         this.setState({
    //             isAllowed: true,
    //             registerValid: "Please Keep this QR code during the visit."
    //         })
    //
    //         console.warn(response1)
    //         // console.log(response1)
    //     })
    //         .catch((error) => {
    //             console.warn("Outer Error: ", error);
    //             this.setState({
    //                 registerValid: "Your approval is pending.."
    //             })
    //             // console.warn("Your approval is pending..")
    //
    //         });
    // }

    render() {


        const isAllowed = this.state.registerValid
        return (
            <View style={styles.MainContainer}>
                <QRCode
                    value={this.state.valueForQRCode}
                    //Setting the value of QRCode
                    size={250}
                    bgColor="#000"
                    fgColor="#fff"
                />

                <TouchableOpacity
                    onPress={
                        this.getTextInputValue
                    }
                    activeOpacity={0.7}
                    style={styles.button}>
                    <Text style={styles.TextStyle}> Generate QR Code </Text>
                </TouchableOpacity>
                <Text style={styles.TextStyle}>{isAllowed}</Text>
                <Button
                    onPress={this.em}
                    title="Upload Profile Picture"
                    color="#841584"
                />
            </View>
        );
    }
}


export default App;
const
    styles = StyleSheet.create({
        MainContainer: {
            flex: 1,
            margin: 10,
            alignItems: 'center',
            paddingTop: 40,
        },

        TextInputStyle: {
            width: '100%',
            height: 40,
            marginTop: 20,
            borderWidth: 1,
            textAlign: 'center',
        },

        button: {
            width: '100%',
            paddingTop: 8,
            marginTop: 10,
            paddingBottom: 8,
            backgroundColor: '#F44336',
            marginBottom: 20,
        },

        TextStyle: {
            color: '#fff',
            textAlign: 'center',
            fontSize: 18,
        },
    });