import React from "react";
import swal from 'sweetalert';

import Header from "./Header";
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

import firebase from "../../firebase";
import SchoolForm from "../form/SchoolForm";
import BaseAdminPage from "../common/BaseAdminPage";

let db = firebase.firestore();

const CollectionConfig = require('../../config/collection.json');

class School extends BaseAdminPage {

    constructor(props) {
        super(props);

        db.collection(CollectionConfig.ORGANIZATION)
            .where("isDelete", "==", false)
            .get()
            .then((querySnapshot) => {
                let organizations = [];
                querySnapshot.forEach((doc) => {
                    var item = {
                        id: doc.id,
                        organizationCode: doc.data().organizationCode,
                        organizationCredit: doc.data().organizationCredit,
                        organizationName: doc.data().organizationName,
                        organizationLogoUrl: doc.data().organizationLogoUrl,
                        totalComplete: typeof(doc.data().stat) !== 'undefined' && typeof(doc.data().stat.totalCompletion) !== 'undefined'? doc.data().stat.totalCompletion:0,
                        totalUser: typeof(doc.data().stat) !== 'undefined' && typeof(doc.data().stat.totalUser) !== 'undefined'? doc.data().stat.totalUser:0,
                        isDelete: doc.data().isDelete
                    };
                    organizations.push(item);
                });

                this.setState({
                    organizations: organizations
                })
        });


        this.state = {
            organizations: [],
            newOrganization: {},
            errors: ''
        }
    }

    onChange(e) {
        const { name, value } = e.target

        this.setState({
            [name]: value
        })
    }

    onDelete(e, organization) {

        var self = this;

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this school!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    db.collection(CollectionConfig.ORGANIZATION).doc(organization.id).update({isDelete: true})
                    .then(function(docRef) {
                        swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                        organization.isDelete = true;

                        let organizationIndex = self.getOrganizationId(e, organization);
                        console.log('organizationIndex', organizationIndex);

                        let items =  self.state.organizations;
                        items[organizationIndex] = organization;

                        self.setState({
                            'organizations': items
                        });


                    })
                    .catch(function(error) {
                        swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                    });
                }
            });

    }

    getOrganizationId(e, organization) {
        let index = -1;
        this.state.organizations.forEach(function (item, i) {
            console.log(item, organization.id)
            if (item.id === organization.id) {
                index = i
            }
        });

        return index;
    }

    onSubmit(e, organization, organizationLogo) {
        e.preventDefault()

        var self = this;
        organization['created'] = (new Date()).getTime();
        organization['stat'] = {
            created: (new Date()).getTime(),
            totalCompletion: 0,
            totalInteraction: 0,
            totalUser: 0
        };

        if (typeof(organization['organizationLogoUrl']) === 'undefined') {
            delete organization['organizationLogoUrl'];
        }


        db.collection(CollectionConfig.ORGANIZATION).doc(organization.organizationCode).set(organization)
            .then(function(docRef) {
                swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                organization['id'] = organization.organizationCode;

                if (typeof(organizationLogo) !== 'undefined' && organizationLogo !== null) {
                    self.submitLogo(organizationLogo, organization['id'])
                }

                let organizations = self.state.organizations;
                organizations.push(organization);

                self.setState({
                    'newOrganization': {},
                    'organizations': organizations,
                    'errors': [],
                });
            })
            .catch(function(error) {
                swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                console.error("Error adding document: ", error);
            });

        return true
    }


    submitLogo(file, organizationId) {
        var self = this;

        const ref = firebase.storage().ref();
        const name = (+new Date()) + '-' + file.name;

        console.log("submitDocument", file);

        const metadata = {
            contentType: file.type
        };
        const task = ref.child('organizationLogo').child(name).put(file, metadata);
        task
            .then(snapshot => snapshot.ref.getDownloadURL())
            .then((url) => {

                db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .update({organizationLogoUrl: url})
                .then(function (response) {

                    var organizations = self.state.organizations;
                    organizations.forEach(function (organization) {
                        if (organization.id == organizationId) {
                            organization.organizationLogoUrl = url;
                        }
                    })

                    self.setState({
                        'organizations': organizations,
                    });
                })
                .catch(function (error) {
                });

            })
            .catch(console.error);

    }


    render() {
        if (this.state.user == null || typeof(this.state.user) === "undefined") {
            return  super.render()
        }

        var error = this.state.error;

        var newOrganization = this.state.newOrganization;

        return (
            <div className="wrapper-cms">
                <Header user={this.state.user}/>
                <div className="container">
                    <div className="card mb-4">
                        <div className="card-body">
                            <SchoolForm newOrganization={newOrganization}
                                        onSubmitOrganization={this.onSubmit.bind(this)}
                                        isCreated={false} />
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Logo</th>
                                <th scope="col" className="w-50">School Name</th>
                                <th scope="col">Users</th>
                                <th scope="col">Challenges</th>
                                <th scope="col">Credits</th>
                                <th scope="col" className="w-25"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.organizations.map((organization, i) =>
                                        !organization.isDelete?
                                        <tr>
                                            <th scope="row">{organization.organizationCode}</th>
                                            <td><div className="img-thumb"><img
                                                width="44"
                                                src={typeof(organization.organizationLogoUrl) === 'undefined' || organization.organizationLogoUrl.indexOf('https') === -1 ? "/static/images/default-school.png": organization.organizationLogoUrl}
                                                alt={organization.organizationName} /></div></td>
                                            <td>{organization.organizationName}</td>
                                            <td className="text-center">{organization.totalUser}</td>
                                            <td className="text-center">{organization.totalComplete}</td>
                                            <td className="text-center">{organization.organizationCredit}</td>
                                            <td className="text-center">
                                                <Link to={`/admin/school/${organization.id}/detail`} className="btn btn-outline btn-sm ic-search">รายละเอียด</Link>
                                                <a href="#" onClick={(e) => this.onDelete(e, organization)} className="btn btn-danger btn-sm ml-2">ลบ</a></td>
                                        </tr>: <tr></tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default School;
