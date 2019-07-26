import React, {Component} from 'react';
import {
    View, Image, Text, StyleSheet, FlatList, BackHandler,
    AsyncStorage, Button, Platform, KeyboardAvoidingView, Dimensions, ScrollView, TouchableOpacity
} from 'react-native';
import GetStarted from './GetStarted'
import {w, h, totalSize} from '../../api/Dimensions';

import PropTypes from 'prop-types';

import ImagePicker from "react-native-image-picker";
import * as firebase from 'firebase'

const companyLogo = require('../../assets/logo.jpeg');
import RNFetchBlob from 'react-native-fetch-blob'

const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const options = {
    title: 'Select Image',
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};
export default class Img extends Component {
    constructor() {
        super()
        this.getImage = this.getImage.bind(this)
        this.state = {
            imgSource: '',
            uploading: false,
            progress: 0,
            images: [],
            image_uri: '',
            uid:''
        };
    }

    uploadImage = (uri, mime = 'image/jpg') => {
        var user = firebase.auth().currentUser;
        console.warn(user.uid)

        return new Promise((resolve, reject) => {

            const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
            // console.warn(uploadUri)
            let uploadBlob = null

            const imageRef = firebase.storage().ref('images').child(user.uid)

            // imageRef.on('state_changed', function(snapshot){
            //     // Observe state change events such as progress, pause, and resume
            //     // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            //     var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            //     // console.warn('Upload is ' + progress + '% done');
            //     switch (snapshot.state) {
            //         case firebase.storage.TaskState.PAUSED: // or 'paused'
            //             console.warn('Upload is paused');
            //             break;
            //         case firebase.storage.TaskState.RUNNING: // or 'running'
            //             console.warn('Upload is running');
            //             break;
            //     }
            // }, function(error) {
            //     console.warn(error)
            //     // Handle unsuccessful uploads
            // });

            // const uploadTask = imageRef.putFile(imagePath);
            fs.readFile(uploadUri, 'base64')
                .then((data) => {
                    // console.warn(data);
                    return Blob.build(data, {type: `${mime};BASE64`})
                })
                .then((blob) => {
                    uploadBlob = blob
                    return imageRef.put(blob, {contentType: mime})
                })
                .then(() => {
                    uploadBlob.close()

                    return imageRef.getDownloadURL()
                })
                .then((url) => {
                    console.warn(url)
                    resolve(url)
                })
                .catch((error) => {
                    console.warn("sdf", error)
                    reject(error)
                })
        })
    }

    getImage() {

        ImagePicker.showImagePicker(options, (response) => {
            // console.warn('Response = ', response);

            if (response.didCancel) {
                console.warn('User cancelled image picker');
            } else if (response.error) {
                console.warn('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.warn('User tapped custom button: ', response.customButton);
            } else {
                // let source = { uri: response.uri };
                // this.setState({image_uri: response.uri})

                // You can also display the image using data:
                // let image_uri = { uri: 'data:image/jpeg;base64,' + response.data };

                this.uploadImage(response.uri)
                    .then(url => {
                        alert('uploaded');
                        this.setState({image_uri: url})
                    })
                    .catch(error => console.warn(error))

            }
        });

    }

    render() {
var user=firebase.auth().currentUser
const id=user.uid
        return (
            <View style={styles.container}>
                <Image style={styles.icon} resizeMode="contain" source={companyLogo}/>
                <Text style={styles.create}>Please Upload your profile picture</Text>
                <Text style={styles.create}>This is your Unique user Id {id}. Keep it for future references.</Text>

                <Image
                    style={{width: 100, height: 100}}
                    source={{uri: this.state.image_uri}}
                />
                <Button
                    onPress={this.getImage}
                    title="Upload Profile Picture"
                    color="#841584"
                />

                <View style={styles.textContainer}>
                    <TouchableOpacity onPress={this.props.change('email')} style={styles.touchable}
                                      activeOpacity={0.6}>
                        <Text style={styles.createAccount}>Continue</Text>
                    </TouchableOpacity>

                </View>
            </View>
        )
    }
}
Img.propTypes = {
    change: PropTypes.func.isRequired,
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    }, create: {
        color: 'white',
        fontSize: totalSize(2.4),
        marginTop: h(7),
        marginBottom: h(4),
        fontWeight: '700',
    },
    icon: {
        width: w(70),
        height: h(30),
        marginTop: h(10),
        marginBottom: h(7),
    },
    textContainer: {
        width: w(100),
        flexDirection: 'row',
        marginTop: h(5),
    },
    email: {
        marginBottom: h(4.5),
    },
    touchable: {
        flex: 1,
    },
    createAccount: {
        color: '#ffffffEE',
        textAlign: 'center',
        fontSize: totalSize(2),
        fontWeight: '600',
    },
    forgotPassword: {
        color: '#ffffffEE',
        textAlign: 'center',
        fontSize: totalSize(2),
        fontWeight: '600',
    },
    progressBar: {
        backgroundColor: 'rgb(3, 154, 229)',
        height: 3,
        shadowColor: '#000',
    }
});
