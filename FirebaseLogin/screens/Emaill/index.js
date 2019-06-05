// @flow
import * as React from 'react';
import {Button} from 'react-native';
import {View, Text, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import InputField from '../../components/InputField';
import PropTypes from 'prop-types';
import {h, totalSize, w} from "../../api/Dimensions";
import {sendGridEmail} from 'react-native-sendgrid'
import * as firebase from "firebase";
import axios from "axios";


export default class Email extends React.Component {
    state = {
        isEmailCorrect: false,
        isName: false,
        location: null,
        dd: ""
    };

    componentDidMount() {
        // findCoordinates = () => {
        // let dd=""
        navigator.geolocation.getCurrentPosition(
            position => {
                const location = position;

                axios.post('https://us-central1-verdant-abacus-186311.cloudfunctions.net/location', {
                    location: location
                })
                    .then((response) => {
                        // console.warn("Main", response)
                        axios.get(`https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?prox=${response.data.latitude}%2C${response.data.longitude}%2C563&mode=retrieveAll&maxresults=1&gen=9&app_id=CLOkS1sQQhDhcyeeLeZW&app_code=VIoTdVt53_g-E5XlP7UcSg`)
                            .then((res) => {

                                // console.warn("Details",res.data.Response.View[0].Result[0].Location.Address.Label+", "+res.data.Response.View[0].Result[0].Location.Address.PostalCode)
                                this.setState({
                                    dd: res.data.Response.View[0].Result[0].Location.Address.Label + ", " + res.data.Response.View[0].Result[0].Location.Address.PostalCode
                                })
                            }).catch((error) => {
                            console.log(error.message)
                            console.warn("Error", error.message)
                        })
                    })
            },
            error => console.log(error.message),
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        );
        // };
    }

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
            default:
                this.setState({
                    isRepeatCorrect: (this.repeat.getInputValue() === ''
                        || this.repeat.getInputValue() !== this.password.getInputValue())
                });
        }
    };
    postform = () => {
        var user = firebase.auth().currentUser;
        var useremail;

        if (user != null) {
            useremail = user.email;
        }
        console.warn("Data", this.state.dd)
        const email = this.email.getInputValue()
        const SENDGRIDAPIKEY = "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";
        const FROMEMAIL = useremail;
        const TOMEMAIL = email;
        const SUBJECT = "Approval for Appointment";
        const ContactDetails = `Hi,  <br>You have an appointment request. <br> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab atque, culpa cumque debitis dolor eos error fugiat,
        <br>incidunt iste itaque laboriosam laudantium libero quam quasi repellendus tempore ullam voluptate voluptatibus?10<br> Do you accept the appointment?<br> If yes, <a href="https://us-central1-verdant-abacus-186311.cloudfunctions.net/sendqr?email= ${FROMEMAIL}&location=${this.state.dd}"> Yes</a> <br> If no, <a href=\"#\">No</a>`
        const sendRequest = sendGridEmail(SENDGRIDAPIKEY, TOMEMAIL, FROMEMAIL, SUBJECT, ContactDetails, "text/html")
        sendRequest.then((response) => {
            this.props.change('qr')()

        }).catch((error) => {
            console.warn(error)
        })
        // })

        ;
    }

    render() {
        return (

            <View style={styles.container}>
                <Text style={styles.appointment}>Book an Appointment</Text>
                <InputField
                    placeholder="Email"
                    keyboardType="email-address"
                    style={styles.email}
                    error={this.state.isEmailCorrect}
                    focus={this.changeInputFocus}
                    ref={ref => this.email = ref}
                />

                <Button
                    onPress={this.postform}
                    color="#888"
                    title="Submit"
                    style={styles.button}
                    accessibilityLabel="Book an appointment"
                />
            </View>

        );
    };
};
Email.propTypes = {
    change: PropTypes.func.isRequired,
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: h(18)
    },
    icon: {
        width: w(70),
        height: h(30),
        marginTop: h(14),
        marginBottom: h(7),
    },
    TextInputStyle: {
        width: '100%',
        height: 40,
        marginTop: 20,
        borderWidth: 1,
        textAlign: 'center',
    },
    appointment: {
        color: 'white',
        fontSize: totalSize(4.5),
        marginBottom: h(5),
        fontWeight: '700',
    },
    textContainer: {
        width: w(100),
        flexDirection: 'row',
        marginTop: h(8),
    },
    qr: {
        width: '100%',
        paddingTop: 8,
        marginTop: 10,
        paddingBottom: 8,
        backgroundColor: '#F44336',
        marginBottom: 20,
    },
    button: {
        width: '80%',
        height: '8.5%',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: w(4),
        backgroundColor: '#888',
        borderRadius: w(10),
        marginTop: h(8),
    }, text: {
        color: 'white',
        fontWeight: '700',
        paddingVertical: h(2),
        fontSize: totalSize(3.1),
    },
    email: {
        marginBottom: h(4.5),
        marginVertical: h(1.8),
    },
    input: {
        marginVertical: h(1),
    },
    touchable: {
        flex: 1,
    },
})