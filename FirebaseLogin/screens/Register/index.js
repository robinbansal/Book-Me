import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, Text, StyleSheet, FlatList, BackHandler,
    AsyncStorage, Button, Platform, KeyboardAvoidingView, Dimensions, ScrollView, TouchableOpacity
} from 'react-native';
import {w, h, totalSize} from '../../api/Dimensions';
import InputField from '../../components/InputField';
import Continue from './Continue';
import Firebase from "../../api/Firebase";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import axios from "axios";
import ImagePicker from 'react-native-image-picker';
import uuid from 'uuid/v4';
import * as firebase from 'firebase'

const email = require('../../assets/email.png');
const password = require('../../assets/password.png');
const repeat = require('../../assets/repeat.png');
const person = require('../../assets/person.png');
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
// const ImageRow = ({image, windowWidth, popImage}) => (
//     <View>
//         <Image
//             source={{uri: image}}
//             style={[styles.img, {width: windowWidth / 2 - 15}]}
//             onError={popImage}
//         />
//     </View>
// );
export default class Register extends Component {

    constructor() {
        super()
        this.getImage = this.getImage.bind(this)
        // this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.state = {
            isNameCorrect: false,
            isEmailCorrect: false,
            isPasswordCorrect: false,
            isRepeatCorrect: false,
            isCreatingAccount: false,
            isAddressCorrect: false,
            imgSource: '',
            uploading: false,
            progress: 0,
            images: [],
            image_uri: ''
        };

    }

    // componentWillMount() {
    //     BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    // }
    //
    // componentWillUnmount() {
    //     BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    // }
    //
    // handleBackButtonClick() {
    //     this.props.navigation.goBack(null);
    //     return true;
    // }

    createUserAccount = () => {
        const name = this.name.getInputValue();
        const email = this.email.getInputValue();
        const password = this.password.getInputValue();
        const repeat = this.repeat.getInputValue();
        const address = this.address.getInputValue();
        // const image=this.state.image_uri
        this.setState({
            isNameCorrect: name === '',
            isEmailCorrect: email === '',
            isPasswordCorrect: password === '',
            isRepeatCorrect: repeat === '' || repeat !== password,
            isAddressCorrect: address === ''
        }, () => {
            if (name !== '' && email !== '' && password !== '' && (repeat !== '' && repeat === password) && address !== '') {
                this.createFireBaseAccount(name, email, password, address);
            } else {
                console.warn('Fill up all fields correctly');
            }
        })
    };

    createFireBaseAccount = (name, email, password, address) => {
        this.setState({isCreatingAccount: true});
        Firebase.createFirebaseAccount(name, email, password)
            .then(result => {
                axios.post('https://us-central1-verdant-abacus-186311.cloudfunctions.net/addDetails', {
                    email: email,
                    name: name,
                    address: address
                }).then((response) => {
                    console.log(response)
                }).catch((error) => {
                    console.warn("Error: ", error);
                });
                if (result) {
                    this.props.change('img')()
                }
                ;
                this.setState({isCreatingAccount: false});
            });
    };

    changeInputFocus = name => () => {
        switch (name) {
            case 'Name':
                this.setState({isNameCorrect: this.name.getInputValue() === ''});
                this.email.input.focus();
                break;
            case 'Email':
                this.setState({isEmailCorrect: this.email.getInputValue() === ''});
                this.password.input.focus();
                break;
            case 'Password':
                this.setState({
                    isPasswordCorrect: this.password.getInputValue() === '',
                    isRepeatCorrect: (this.repeat.getInputValue() !== ''
                        && this.repeat.getInputValue() !== this.password.getInputValue())
                });
                this.repeat.input.focus();
                break;
            default:
                this.setState({
                    isRepeatCorrect: (this.repeat.getInputValue() === ''
                        || this.repeat.getInputValue() !== this.password.getInputValue())
                });
        }
    };


    uploadImage = (uri, mime = 'image/jpg') => {
        var user = firebase.auth().currentUser;

        // if (user != null) {
        //     // name = user.displayName;
        //     // email = user.email;
        //
        // } else {
        //     console.warn("You are not Logged in");
        // }
        return new Promise((resolve, reject) => {

            const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
            // console.warn(uploadUri)
            let uploadBlob = null

            const imageRef = firebase.storage().ref('images').child(user.uid)

            fs.readFile(uploadUri, 'base64')
                .then((data) => {
                    console.warn(data);
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
                    // console.warn(url)
                    resolve(url)
                })
                .catch((error) => {
                    console.warn(error)
                    reject(error)
                })
        })
    }

    getImage() {

        ImagePicker.showImagePicker(options, (response) => {
            console.warn('Response = ', response);

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
                    .catch(error => console.log(error))

            }
        });

    }

    render() {

        const {uploading, imgSource, progress, images} = this.state;
        const windowWidth = Dimensions.get('window').width;
        const disabledStyle = uploading ? styles.disabledBtn : {};
        const actionBtnStyles = [styles.btn, disabledStyle];
        return (
            <KeyboardAwareScrollView>
                <View style={styles.container}>
                    <Text style={styles.create}>CREATE ACCOUNT</Text>
                    <InputField
                        placeholder="Name"
                        autoCapitalize="words"
                        error={this.state.isNameCorrect}
                        style={styles.input}
                        focus={this.changeInputFocus}
                        ref={ref => this.name = ref}
                        icon={person}
                    />
                    <InputField
                        placeholder="Email"
                        keyboardType="email-address"
                        error={this.state.isEmailCorrect}
                        style={styles.input}
                        focus={this.changeInputFocus}
                        ref={ref => this.email = ref}
                        icon={email}
                    />
                    <InputField
                        placeholder="Password"
                        error={this.state.isPasswordCorrect}
                        style={styles.input}
                        focus={this.changeInputFocus}
                        ref={ref => this.password = ref}
                        secureTextEntry={true}
                        icon={password}
                    />
                    <InputField
                        placeholder="Repeat Password"
                        error={this.state.isRepeatCorrect}
                        style={styles.input}
                        secureTextEntry={true}
                        returnKeyType="done"
                        blurOnSubmit={true}
                        focus={this.changeInputFocus}
                        ref={ref => this.repeat = ref}
                        icon={repeat}
                    />
                    <InputField
                        placeholder="Enter Address"
                        autoCapitalize="words"
                        error={this.state.isAddressCorrect}
                        style={styles.input}
                        focus={this.changeInputFocus}
                        ref={ref => this.address = ref}
                        icon={person}
                    />


                    <Continue isCreating={this.state.isCreatingAccount} click={this.createUserAccount}/>
                    <TouchableOpacity onPress={this.props.change('login')} style={styles.touchable}>
                        <Text style={styles.signIn}>{'<'} Sign In</Text>
                    </TouchableOpacity>

                </View>
            </KeyboardAwareScrollView>
        )
    }
}

Register.propTypes = {
    change: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledBtn: {
        backgroundColor: 'rgba(3,155,229,0.5)'
    },
    btnTxt: {
        color: '#fff'
    },
    create: {
        color: 'white',
        fontSize: totalSize(2.4),
        marginTop: h(7),
        marginBottom: h(4),
        fontWeight: '700',
    },
    signIn: {
        color: '#ffffffEE',
        fontSize: totalSize(2),
        fontWeight: '700',
    },
    touchable: {
        alignSelf: 'flex-start',
        marginLeft: w(8),
        marginTop: h(4),
    },
    input: {
        marginVertical: h(2),
    },
    img: {
        flex: 1,
        height: 100,
        margin: 5,
        resizeMode: 'contain',
        borderWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#ccc'
    },
    progressBar: {
        backgroundColor: 'rgb(3, 154, 229)',
        height: 3,
        shadowColor: '#000',
    }
});