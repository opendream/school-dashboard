import React from 'react';

import firebase from "../../firebase";
let db = firebase.firestore();

import swal from "sweetalert";

import BeatLoader from 'react-spinners/BeatLoader';
import Header from "../organization/Header";

const CollectionConfig = require('../../config/collection.json');

class BaseSchoolPage extends React.Component {

    componentDidMount() {

        var self = this;

        firebase.auth().onAuthStateChanged(user => {
            if (user) {

                db.collection(CollectionConfig.USER).doc(user.uid)
                    .get()
                    .then((doc) => {

                        if (doc.exists) {

                            let role = doc.data().role;
                            // if (role === 'admin') {
                            //     window.location.href = "/admin/school";
                            // }

                            console.log('current-user', doc.data());


                            self.setState({
                                'user':  doc.data(),
                            })
                        } else {
                            window.location.href = "/login";
                        }

                    })
                    .catch(function(error) {
                        swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                        window.location.href = "/login";
                    });


                this.setState({
                    currentUser: user
                })
            } else {
                window.location.href = "/login";
            }
        })
    }

    render() {
        return (
            <div>
                <Header  />
                <div className="text-center" style={{'margin': '150px'}}>
                    <BeatLoader
                        sizeUnit={"px"}
                        size={30}
                        color={'#6c6c6d'}
                        loading={this.state.loading}
                    />
                </div>
            </div>
        );
    }
}

export default BaseSchoolPage;
