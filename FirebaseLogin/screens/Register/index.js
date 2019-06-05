import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableOpacity} from 'react-native';
import {w, h, totalSize} from '../../api/Dimensions';
import InputField from '../../components/InputField';
import Continue from './Continue';
import Firebase from "../../api/Firebase";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import axios from "axios";

const email = require('../../assets/email.png');
const password = require('../../assets/password.png');
const repeat = require('../../assets/repeat.png');
const person = require('../../assets/person.png');

export default class Register extends Component {
    state = {
        isNameCorrect: false,
        isEmailCorrect: false,
        isPasswordCorrect: false,
        isRepeatCorrect: false,
        isCreatingAccount: false,
        isAddressCorrect: false,
    };

    createUserAccount = () => {
        const name = this.name.getInputValue();
        const email = this.email.getInputValue();
        const password = this.password.getInputValue();
        const repeat = this.repeat.getInputValue();
        const address = this.address.getInputValue();
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
                    this.props.change('email')()
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

    render() {
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
    }
});