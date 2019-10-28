import React from "react";
import Header from "./Header";

import BaseSchoolPage from "../common/BaseSchoolPage";

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

import firebase from "../../firebase";
let db = firebase.firestore();

import swal from "sweetalert";
import queryString from 'query-string'
import ExportUser from "../export/ExportUser";

const CollectionConfig = require('../../config/collection.json');


class User extends BaseSchoolPage {
    constructor(props) {
        super(props);

        const values = queryString.parse(this.props.location.search)
        const department = (values.department);
        const level = (values.level);
        const room = (values.room);
        const name = (values.name);

        this.state = {
            organization: null,
            departments: [],
            rooms: [],
            levels: [],
            department: department,
            level: level,
            room: room,
            name: name,
            students: [],
            totalStudent: 0,
            currentStudent: 0,
            latestId: "",
            exportData: []
        }
    }


    componentWillUpdate(nextProps, nextState) {

        var self = this;

        const values = queryString.parse(this.props.location.search)
        const department = (values.department);
        const level = (values.level);
        const room = (values.room);
        const name = (values.name);

        if (this.state.organization == null && nextState.user) {

            var organizationId = nextState.user.organizationId;
            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {
                    if (doc.exists) {

                        var totalStudent = doc.data().stat.totalUser;

                        self.setState({
                            'organization':  doc.data(),
                        })

                        db.collection(CollectionConfig.ORGANIZATION)
                            .doc(organizationId)
                            .collection(CollectionConfig.DEPARTMENT)
                            .get()
                            .then((querySnapshot) => {
                                var totalStudent = this.state.totalStudent;

                                let departments = [];
                                querySnapshot.forEach((doc) => {


                                    var item = {
                                        id: doc.id,
                                        name: doc.id,
                                        totalUser: doc.data().totalUser,
                                    };
                                    departments.push(item);

                                    if (department == item.id) {
                                        totalStudent = doc.data().totalUser
                                    }

                                });

                                this.setState({
                                    // totalStudent: totalStudent,
                                    departments: departments
                                })
                            });

                    }
                })




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

            var query = db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.STUDENT)
                .where("isDelete", "==", false);

            if (typeof(department) !== 'undefined' && department !== '') {
                query = query.where("department", "==", department);
            }

            if (typeof(level) !== 'undefined' && level !== '') {
                query = query.where("level", "==", level);
            }

            if (typeof(room) !== 'undefined' && room !== '') {
                query = query.where("room", "==", room);
            }

            if (typeof(name) !== 'undefined' && name !== '') {
                query = query.orderBy('firstName').where("firstName" ,'>=',name).where("firstName" ,'<=', name + "\uf8ff");

            }

            query.get()
                .then((querySnapshot) => {
                    console.log(querySnapshot.size);
                    this.setState({
                        totalStudent: querySnapshot.size,
                    })
                });

            query
                .orderBy('studentId')
                .limit(5).get()
                .then((querySnapshot) => {
                    let students = [];
                    var latestId = "";
                    querySnapshot.forEach((doc) => {
                        var item = {
                            id: doc.id,
                            firstName: doc.data().firstName,
                            lastName: doc.data().lastName,
                            level: doc.data().level,
                            room: doc.data().room,
                            department: doc.data().department,
                            studentId: doc.data().studentId,
                            stat: doc.data().stat,
                            avatarUrl: doc.data().avatarUrl,
                            isDelete: doc.data().isDelete
                        };

                        latestId = item.studentId;
                        students.push(item);

                    });

                    this.setState({
                        latestId: latestId,
                        currentStudent: 5,
                        students: students,
                    })
                });

            // query.orderBy("studentId")
            //     .get()
            //     .then((querySnapshot) => {
            //         let exportData = [];
            //         querySnapshot.forEach((doc) => {
            //
            //             let data = {
            //                 id: doc.id,
            //                 name: doc.data().firstName + " " + doc.data().lastName,
            //                 level: doc.data().level,
            //                 room: doc.data().room,
            //                 department: doc.data().department,
            //                 studentId: doc.data().studentId,
            //                 totalScore: typeof(doc.data().stat === 'undefined')? 0: doc.data().stat.totalScore,
            //                 totalComplete: typeof(doc.data().stat === 'undefined')? 0: doc.data().stat.totalComplete,
            //             };
            //             exportData.push(data);
            //         });
            //
            //         this.setState({
            //             exportData: exportData
            //         })
            //     });

        }



    }

    gotoFilterPage(department) {
        if (department == '') window.location.href = '/user';

        window.location.href = '/user?department=' + department;
    }

    loadMore() {
        var self = this;

        const organizationId = this.state.organization.organizationCode;
        const values = queryString.parse(this.props.location.search);
        const department = (values.department);
        const level = (values.level);
        const room = (values.room);
        const name = (values.name);

        var query = db.collection(CollectionConfig.ORGANIZATION)
            .doc(organizationId)
            .collection(CollectionConfig.STUDENT)
            .where("isDelete", "==", false)


        if (typeof(department) !== 'undefined' && department !== '') {
            query = query.where("department", "==", department);
        }

        if (typeof(level) !== 'undefined' && level !== '') {
            query = query.where("level", "==", level);
        }

        if (typeof(room) !== 'undefined' && room !== '') {
            query = query.where("room", "==", room);
        }

        if (typeof(name) !== 'undefined' && name !== '') {
            query = query.orderBy('firstName').where("firstName" ,'>=',name).where("firstName" ,'<=', name + "\uf8ff");
        }

        // query.get()
        //     .then((querySnapshot) => {
        //         this.setState({
        //             totalStudent: querySnapshot.size,
        //         })
        //     });

        query
            .orderBy('studentId')
            .where("studentId", ">", this.state.latestId)
            .limit(5)
            .get()
            .then((querySnapshot) => {
                let students = self.state.students;
                let latestId = "";
                let currentStudent = self.state.currentStudent;

                querySnapshot.forEach((doc) => {
                    var item = {
                        id: doc.id,
                        firstName: doc.data().firstName,
                        lastName: doc.data().lastName,
                        level: doc.data().level,
                        room: doc.data().room,
                        department: doc.data().department,
                        studentId: doc.data().studentId,
                        stat: doc.data().stat,
                        avatarUrl: doc.data().avatarUrl,
                        isDelete: doc.data().isDelete
                    };
                    latestId = item.studentId;
                    currentStudent += 1;
                    students.push(item);
                });

                self.setState({
                    latestId: latestId,
                    currentStudent: currentStudent,
                    students: students
                })
            });
    }

    onChange(e) {
        const { name, value } = e.target

        this.setState({
            [name]: value
        })
    }

    render() {

        if (this.state.user == null || typeof(this.state.user) === "undefined") {
            return  super.render()
        }

        var  isStudent = this.state != null && typeof(this.state) !== "undefined"
            && this.state.students != null && typeof(this.state.students) !== "undefined";

        const department = this.state.department;
        const level = (this.state.level);
        const room = (this.state.room);
        const name = (this.state.name);

        return (
            <div className="bg-light mh-100vh">
                <Header user={this.state.user} organization={this.state.organization} />
                <div className="container pb-5">
                    <div className="header-group">
                        <div className="row">
                            <div className="col-2">
                                <button className={"btn btn-radius mb-1 " + (typeof(department) === 'undefined' || "" === department? ' active': '')} onClick={(e) => this.gotoFilterPage('')}>รวมนักเรียน ({this.state.organization !=null && typeof(this.state.organization.stat) != 'undefined' ? <span>{this.state.totalStudent}</span>:<span></span>})</button>
                            </div>
                            <div className="col-10">
                                {
                                        this.state.departments.map((_department, i) =>
                                            <button className={"btn btn-radius " + (_department.name === department? ' active': '')} onClick={(e) => this.gotoFilterPage(_department.name)}>{_department.name} ({_department.totalUser})</button>
                                        )
                                }

                            </div>
                        </div>
                    </div>
                    <div className="float-right mt-5 w-100">
                        <form>
                            <div className="form-inline justify-content-end">
                            <select className="form-control w-25 mr-2" id="" value={this.state.level || ""} name="level" onChange={(e) => this.onChange(e)}>
                                <option selected disabled hidden value="">ชั้นมัธยมศึกษาปีที่</option>
                                {
                                    this.state.levels.map((level, i) =>
                                        <option selected={this.state.level == level}>{level}</option>
                                    )
                                }
                            </select>
                            <select className="form-control w-25 mr-2" id="" value={this.state.room || ""} name="room" onChange={(e) => this.onChange(e)}>
                                <option selected disabled hidden value="">ห้อง</option>
                                {
                                    this.state.rooms.map((room, i) =>
                                        <option selected={this.state.room == room}>{room}</option>
                                    )
                                }
                            </select>
                            <div className="search-group">
                                <input className="form-control mr-sm-2" type="search" placeholder="ค้นหา (ชื่อนักเรียน)" name="name" onChange={(e) => this.onChange(e)} aria-label="Search" value={this.state.name} />
                                <input className="form-control mr-sm-2" type="hidden" name="department" value={department} />
                                <input className="form-control mr-sm-2" type="hidden" name="level" value={level} />
                                <input className="form-control mr-sm-2" type="hidden" name="room" value={room} />
                                <Link to={`/user/?name=${name || ""}&department=${department || ""}&level=${level || ""}&room=${room || ""}`} target="_self" className="">
                                    <button className="btn btn-search-inline" type="button" >search</button></Link>
                            </div>

                            <Link to={`/user/export/?file=xls&name=${name || ""}&department=${department || ""}&level=${level || ""}&room=${room || ""}`} target="_blank" className="btn btn-download btn-sm ic-export mr-2">
                                XLS</Link>
                            <Link to={`/user/export/?file=csv&name=${name || ""}&department=${department || ""}&level=${level || ""}&room=${room || ""}`} target="_blank"  className="btn btn-download btn-sm ic-export">
                                CSV</Link>

                            </div>
                            
                        </form>
                    </div>
                    <div className="clearfix"></div>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                <th scope="col" style={{width: '2%'}}>ลำดับ</th>
                                <th scope="col" style={{width: '5%'}}></th>
                                <th scope="col" style={{width: '35%'}}>ชื่อ-สกุล</th>
                                <th scope="col" className="text-center">คะแนน</th>
                                <th scope="col" className="text-center">สายการเรียน</th>
                                <th scope="col" className="text-center">ชั้น</th>
                                <th scope="col" className="text-center">ห้อง</th>
                                <th scope="col" className="text-center">เริ่ม</th>
                                <th scope="col" className="text-center">เรียนจบ</th>
                                <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    isStudent ?
                                        this.state.students.map((student, i) =>
                                            <tr>
                                                <td>#{i+1}</td>
                                                <td>
                                                    <img className="img-cover"
                                                      src="/static/images/default-user.png"
                                                      src={typeof(student.avatarUrl) === 'undefined' || student.avatarUrl.indexOf('https') === -1 ? "/static/images/default-user.png": student.avatarUrl}
                                                      alt={ student.firstName } />
                                                </td>
                                                <td>{student.firstName} {student.lastName}</td>
                                                <td className="text-center">{typeof(student.stat) !== "undefined"? <span>{student.stat.totalScore}</span>: <span>0</span>}</td>
                                                <td className="text-center">{student.department}</td>
                                                <td className="text-center">{student.level}</td>
                                                <td className="text-center">/{student.room}</td>
                                                <td className="text-center">{typeof(student.stat) !== "undefined"? <span>{student.stat.totalStart}</span>: <span>0</span>}</td>
                                                <td className="text-center">{typeof(student.stat) !== "undefined" && typeof(student.stat.totalComplete) !== "undefined"? <span>{student.stat.totalComplete}</span>: <span>0</span>}</td>
                                                <td className="text-center">
                                                    <Link to={`/user/${student.id}/detail`} className="btn btn-outline btn-sm">อ่านเพิ่ม</Link>
                                                </td>
                                            </tr>) : <tr></tr>
                                }

                            </tbody>
                        </table>
                        {
                            this.state.students.length == 0? <div className="text-center" style={{'padding-bottom': '20px'}}>ยังไม่มีข้อมูล</div>:<span></span>
                        }
                        <div className={"text-center " + (this.state.currentStudent >= this.state.totalStudent ? 'd-none' : '')}>
                            <button className="btn btn-radius mb-1" onClick={(e) => this.loadMore()}>See more</button>
                        </div>
                    </div>
                
                </div>
                
            </div>
        );
    }
}

export default User;