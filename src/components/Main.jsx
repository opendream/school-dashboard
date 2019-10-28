import React from 'react';

import firebase from "../firebase";

import {Router, Route, browserHistory} from 'react-router'

import Report from './organization/Report';
import School from './organization/School';
import Chapters from './organization/Chapters';
import User from './organization/User';
import UserDetail from './organization/UserDetail';
import ChaptersDetail from './organization/ChaptersDetail';
import ChallengeDetail from './organization/ChallengeDetail';
import Login from "./Login";


import Footer from "./organization/Footer";

import CMSSchool from "./admin/School";
import CMSSchoolDetail from "./admin/SchoolDetail";
import CMSChapter from "./admin/Chapter";
import CMSChapterDetail from "./admin/ChapterDetail";
import CMSChallengeDetail from "./admin/ChallengeDetail";
import CMSSubject from "./admin/Subject";
import CMSLoginForm from "./admin/Login";


import ExportChapter from "./export/ExportChapter";
import ExportUser from "./export/ExportUser";
import ExportChallenge from "./export/ExportChallenge";
import ExportChallengeDetail from "./export/ExportChallengeDetail";
import ExportUserDetail from "./export/ExportUserDetail";
import ExportSchoolDetail from "./export/ExportSchoolDetail";

class NoMatch extends React.Component {
    render() {
        return (
            <div className="page">
                <div className="container h-100">
                    <div className="row justify-content-center align-items-center h-100">
                        <div className="col-6 text-center">
                            <h2>404 Not found</h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class BasePage extends React.Component {

    componentDidMount() {

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.setState({
                    currentUser: user
                })
            } else {

                if (window.location.href.indexOf('admin') !== -1) {
                    window.location.href = "/admin/login";
                    return;
                }

                window.location.href = "/login";
            }
        })
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}

class BaseSchoolPage extends React.Component {

    componentDidMount() {

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
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
                {this.props.children}
            </div>
        );
    }
}

class Logout extends React.Component {

    componentDidMount() {

        firebase.auth().signOut();
        window.location.href = "/login";
    }

    render() {
        return (
            <div></div>
        );
    }
}

class AppComponent extends React.Component {
    render() {
        return (
            <div className="index">
                <Router history={browserHistory}>
                    <Route path="/admin/login" component={CMSLoginForm}/>
                    <Route path="/login" component={Login}/>
                    <Route path="/logout" component={Logout}/>
                    <Route component={BasePage}>
                        <Route path="/admin" component={CMSSchool}/>
                        <Route path="/admin/school" component={CMSSchool}/>
                        <Route path="/admin/school/:schoolId/detail" component={CMSSchoolDetail}/>
                        <Route path="/admin/chapter/:chapterId/detail" component={CMSChapterDetail}/>
                        <Route path="/admin/chapter/:chapterId/challenge/:challengeId/detail" component={CMSChallengeDetail}/>
                        <Route path="/admin/chapter" component={CMSChapter}/>
                        <Route path="/admin/subject" component={CMSSubject}/>

                        <Route path="/" component={School} />
                        <Route path="/school" component={School} />
                        <Route path="/export" component={ExportSchoolDetail} />

                        <Route path="/chapter" component={Chapters} />
                        <Route path="/chapter/export" component={ExportChapter} />
                        <Route path="/chapter/:chapterId/detail" component={ChaptersDetail} />
                        <Route path="/chapter/:chapterId/export" component={ExportChallenge} />

                        <Route path="/chapter/:chapterId/challenge/:challengeId/detail" component={ChallengeDetail} />
                        <Route path="/chapter/:chapterId/challenge/:challengeId/export" component={ExportChallengeDetail} />

                        <Route path="/user" component={User} />
                        <Route path="/user/export" component={ExportUser} />
                        <Route path="/user/:userId/detail" component={UserDetail} />
                        <Route path="/user/:userId/export" component={ExportUserDetail} />
                        <Route path="/report" component={Report} />
                        <Route path="*" component={NoMatch}/>
                    </Route>
                </Router>
                <Footer/>
            </div>
        );
    }
}

AppComponent.defaultProps = {};

export default AppComponent;
