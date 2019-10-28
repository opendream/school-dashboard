import React from "react";
import Header from "./Header";

import BaseSchoolPage from "../common/BaseSchoolPage";


import firebase from "../../firebase";
let db = firebase.firestore();

import swal from "sweetalert";
const CollectionConfig = require('../../config/collection.json');

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;


class Report extends BaseSchoolPage {
    constructor(props) {
        super(props);

        this.state = {
            organization: null,
            subjects: [],
            departments: [],
            levels: [],
            rooms: []
        }

    }

    componentWillUpdate(nextProps, nextState) {

        var self = this;
        if (this.state.organization == null && nextState.user) {

            var organizationId = nextState.user.organizationId;
            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        self.setState({
                            'organization':  doc.data(),
                        })

                    }
                })

            db.collection(CollectionConfig.CONTENT)
                .where("isDelete", "==", false)
                .orderBy("subjectCode")
                .get()
                .then((querySnapshot) => {
                    let subjects = [];
                    querySnapshot.forEach((doc) => {
                        var item = {
                            id: doc.id,
                            subjectName: doc.data().subjectName,
                            subjectCode: doc.data().subjectCode,
                            isDelete: doc.data().isDelete
                        };
                        subjects.push(item);
                    });

                    this.setState({
                        subjects: subjects
                    })
                });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.DEPARTMENT)
                .get()
                .then((querySnapshot) => {

                    let departments = [];
                    querySnapshot.forEach((doc) => {

                        var item = {
                            id: doc.id,
                            name: doc.id,
                        };
                        departments.push(item);

                    });

                    this.setState({
                        departments: departments
                    })
                });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.SECTION)
                .get()
                .then((querySnapshot) => {
                    let rooms = [];
                    let levels = [];
                    querySnapshot.forEach((doc) => {
                        let room = doc.data().room;
                        if (rooms.indexOf(room) == -1) rooms.push(room);

                        let level = doc.data().level;
                        if (levels.indexOf(level) == -1) levels.push(level);
                    });

                    this.setState({
                        rooms: rooms.sort(),
                        levels: levels.sort()
                    })
                });

        }



    }

    onChange(e) {
        const { name, value } = e.target;

        this.setState({
            [name]: value
        })
    }

    render() {
        // if (this.state.user == null || typeof(this.state.user) === "undefined") {
        //     return  super.render()
        // }

        return (
            <div className="bg-light mh-100vh">
                <Header user={this.state.user} organization={this.state.organization} />
                <div className="container report-page pb-5">
                    <div className="card p-4 mb-4">
                        <div className="row d-flex">
                            <div className="col-lg-3 text-center">
                                <img className="img-fluid" src="/static/images/01school-dashboard.png" alt="sample" width="150px" />
                            </div>
                            <div className="col-lg-6 pr-3">
                                <h3>School Dashboard</h3>
                                <p>รายงานภาพรวมผลสัมฤทธิ์การเรียนของนักเรียน ข้อมูล: จำนวนนักเรียนรวม, คอร์สที่เรียนจบ, พัฒนาการของการเรียน, กลุ่มนักเรียน</p>
                            </div>
                            <div className="col-lg-3">
                                <div className="mb-3">
                                    <Link to={`/export/?file=csv`} target="_blank" className="btn btn-download btn-sm ic-export mr-2">
                                        Export CSV</Link>
                                </div>
                                <div>
                                    <Link to={`/export/?file=xls`} target="_blank" className="btn btn-download btn-sm ic-export mr-2">
                                        Export XLS</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4 mb-4">
                        <div className="row d-flex">
                            <div className="col-lg-3 text-center">
                                <img className="img-fluid" src="/static/images/02course-report.png" alt="sample" width="150px" />
                            </div>
                            <div className="col-lg-6 pr-3">
                                <h3>Course Report</h3>
                                <p>รายงานภาพรวมผลสัมฤทธิ์การเรียนของนักเรียนข้อมูล: จำนวนนักเรียนรวม, คอร์สที่เรียนจบ</p>
                                <div className="form-inline">
                                    <select className="form-control w-100" id="" name="subjectId" onChange={(e) => this.onChange(e)}>
                                        <option selected disabled hidden>เลือกวิชา</option>
                                        {
                                                this.state.subjects.map((subject, i) =>
                                                    <option value={subject.subjectCode}>{subject.subjectName}</option>)
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className="col-lg-3">
                                <div className="mb-3">
                                    <Link to={`/chapter/export/?file=csv&subjectId=${this.state.subjectId || ""}`} target="_blank" className="btn btn-download btn-sm ic-export mr-2">
                                        Export CSV</Link>
                                </div>
                                <div>
                                    <Link to={`/chapter/export/?file=xls&subjectId=${this.state.subjectId || ""}`} target="_blank" className="btn btn-download btn-sm ic-export mr-2">
                                        Export XLS</Link>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="card p-4 mb-4">
                        <div className="row d-flex">
                            <div className="col-lg-3 text-center">
                                <img className="img-fluid" src="/static/images/03student-report.png" alt="sample" width="150px" />
                            </div>
                            <div className="col-lg-6 pr-3">
                                <h3>Student Report</h3>
                                <p>รายงานภาพรวมผลสัมฤทธิ์การเรียนของนักเรียน ข้อมูล: จำนวนนักเรียนรวม, คอร์สที่เรียนจบ, พัฒนาการของ</p>
                                <div className="form-inline mb-2">
                                    <select className="form-control w-100"  id="" name="department" onChange={(e) => this.onChange(e)}>
                                        <option selected disabled hidden>เลือกสายการเรียน</option>
                                        {
                                            this.state.departments.map((department, i) =>
                                                <option value={department.name}>{department.name}</option>)
                                        }
                                    </select>
                                </div>
                                <div className="form-inline mb-2">
                                    <select className="form-control w-100" id="" name="level" onChange={(e) => this.onChange(e)}>
                                        <option selected disabled hidden>เลือกชั้น</option>
                                        {
                                            this.state.levels.map((level, i) =>
                                                <option value={level}>{level}</option>)
                                        }
                                    </select>
                                </div>
                                <div className="form-inline">
                                    <select className="form-control w-100"  id="" name="room" onChange={(e) => this.onChange(e)}>
                                        <option selected disabled hidden>เลือกห้อง</option>
                                        {
                                            this.state.rooms.map((room, i) =>
                                                <option value={room}>{room}</option>)
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className="col-lg-3">
                                <div className="mb-3">
                                    <Link to={`/user/export/?file=csv&department=${this.state.department || ""}&level=${this.state.level || ""}&room=${this.state.room || ""}`} target="_blank" className="btn btn-download btn-sm ic-export mr-2">
                                        Export CSV</Link>
                                </div>
                                <div>
                                    <Link to={`/user/export/?file=xls&department=${this.state.department || ""}&level=${this.state.level || ""}&room=${this.state.room || ""}`} target="_blank" className="btn btn-download btn-sm ic-export mr-2">
                                        Export XLS</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        );
    }
}

export default Report;