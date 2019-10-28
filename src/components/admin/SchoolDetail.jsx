import React from "react";
import Header from "./Header";

import firebase from "../../firebase";
import swal from "sweetalert";

import SchoolForm from "../form/SchoolForm";
import StudentForm from "../form/StudentForm";

import CsvParse from '@vtex/react-csv-parse'
import BaseAdminPage from "../common/BaseAdminPage";

let db = firebase.firestore();

const CollectionConfig = require('../../config/collection.json');

class SchoolDetail extends BaseAdminPage {
    constructor(props) {
        super(props);

        var self = this;
        let organizationId = this.props.params.schoolId;

        db.collection(CollectionConfig.ORGANIZATION)
            .doc(organizationId)
            .get()
            .then((doc) => {
                let organization  = {
                    id: doc.id,
                    organizationCode: doc.data().organizationCode,
                    organizationCredit: doc.data().organizationCredit,
                    organizationName: doc.data().organizationName,
                    organizationLogoUrl: doc.data().organizationLogoUrl,
                    stat: doc.data().stat,
                    isDelete: doc.data().isDelete
                };

                self.setState({
                    'newOrganization': organization,
                    'organization': organization
                })
            });

        db.collection(CollectionConfig.ORGANIZATION)
            .doc(organizationId)
            .collection(CollectionConfig.STUDENT)
            .get()
            .then((querySnapshot) => {
                let students = [];
                querySnapshot.forEach((doc) => {
                    var item = {
                        id: doc.id,
                        firstName: doc.data().firstName,
                        lastName: doc.data().lastName,
                        level: doc.data().level,
                        room: doc.data().room,
                        department: doc.data().department,
                        status: doc.data().status,
                        studentId: doc.data().studentId,
                        avatarUrl: doc.data().avatarUrl,
                        isDelete: doc.data().isDelete
                    };
                    students.push(item);
                });

                this.setState({
                    students: students
                })
            });



        this.state = {
            organizationId: organizationId,
            organization: {},
            newOrganization: {},
            newStudent: {},
            students: [],
            errors: '',
            importStudents: [],
            checkedStudents: {}
        }

    }

    onChange(e) {
        const { name, value } = e.target

        this.setState({
            [name]: value
        })
    }

    onEditOrganization(e, organization, organizationLogo) {
        e.preventDefault()

        var self = this;

        if (typeof(organization['organizationLogoUrl']) === 'undefined') {
            delete organization['organizationLogoUrl'];
        }

        db.collection(CollectionConfig.ORGANIZATION).doc(this.state.organizationId).update(organization)
            .then(function(docRef) {
                swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                organization['id'] = self.state.organizationId;

                if (typeof(organizationLogo) !== 'undefined' && organizationLogo !== null) {
                    self.submitLogo(organizationLogo, organization['id'])
                }

                console.log(organization);

                self.setState({
                    'errors': [],
                    'newOrganization': organization,
                    'organization': organization
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

                        var organization = self.state.organization;
                        organization.organizationLogoUrl = url;

                        self.setState({
                            'newOrganization': organization,
                            'organization': organization
                        })
                    })
                    .catch(function (error) {
                    });

            })
            .catch(console.error);

    }

    onSubmitStudent(e, student) {
        e.preventDefault()

        var self = this;

        var studentId =  this.state['newStudent.id'];

        if (typeof(studentId) === 'undefined' || studentId === '') {

            student['created'] = (new Date()).getTime();
            student['isDelete'] = false;
            student['totalScore'] = 0;

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(this.state.organizationId)
                .collection(CollectionConfig.STUDENT)
                .doc(student.studentId)
                .set(student)
                .then(function(docRef) {
                    swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                    student['id'] = student.studentId;

                    var students = self.state.students;
                    students.push(student)

                    db.collection(CollectionConfig.ORGANIZATION)
                        .doc(self.state.organization.organizationCode)
                        .get().then(function(doc) {

                        var totalUser = 1;

                        if (typeof(doc.data()) !== 'undefined' &&
                            typeof(doc.data().stat) !== 'undefined' &&
                            typeof(doc.data().stat.totalUser) !== 'undefined') {
                            totalUser = doc.data().stat.totalUser + 1;

                        }

                        self.state.organization.stat.totalUser = totalUser;

                        if (typeof(self.state.organization.organizationLogoUrl) === 'undefined') delete self.state.organization.organizationLogoUrl;

                        db.collection(CollectionConfig.ORGANIZATION)
                            .doc(self.state.organization.organizationCode)
                            .set(self.state.organization).then(function(docRef) {

                                self.setState({
                                organization: self.state.organization
                            });
                        });

                    });

                    self.updateStat();

                    self.setState({
                        'newStudent': {},
                        'errors': [],
                    });

                    $('#editStudent').modal('hide');

                })
                .catch(function(error) {
                    swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                    console.error("Error adding document: ", error);
                });




        } else {

            var oldStudent = this.state.oldStudent;

            student['modified'] = (new Date()).getTime();

            db.collection(CollectionConfig.ORGANIZATION).doc(this.state.organizationId)
                .collection(CollectionConfig.STUDENT)
                .doc(student.studentId)
                .update(student)
                .then(function(docRef) {
                    swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                    self.updateStat();

                    student.id = student.studentId;

                    let studentIndex = self.getStudentId(e, student);
                    console.log('studentIndex', studentIndex);

                    let items =  self.state.students;
                    items[studentIndex] = student;

                    self.setState({
                        'newStudent': {},
                        'errors': [],
                        'students': items
                    });

                    $('#editStudent').modal('hide');
                })
                .catch(function(error) {
                    swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                    console.error("Error adding document: ", error);
                });

        }


        return true
    }

    renderStudent(e, student) {

        console.log("student", student)
        this.setState({
            'oldStudent': student,
            'newStudent': student,
            'newStudent.id': student['id']
        });

    }

    removeStudent(e, student) {
        let self = this;
        let organizationId = this.props.params.schoolId;

        console.log('organizationId', organizationId);
        console.log('student', student);

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this student!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    db.collection(CollectionConfig.ORGANIZATION).doc(organizationId)
                        .collection(CollectionConfig.STUDENT).doc(student.id).update({isDelete: true})
                        .then(function(docRef) {
                            swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                            self.updateStat();


                            student.isDelete = true;

                            let studentIndex = self.getStudentId(e, student);
                            console.log('studentIndex', studentIndex);

                            let items =  self.state.students;
                            items[studentIndex] = student;

                            self.state.organization.stat.totalUser = self.state.organization.stat.totalUser - 1;
                            if (typeof(self.state.organization.organizationLogoUrl) === 'undefined') delete self.state.organization.organizationLogoUrl;

                            db.collection(CollectionConfig.ORGANIZATION)
                                .doc(self.state.organization.organizationCode)
                                .set(self.state.organization).then(function(docRef) {

                            });



                            console.log(self.state.organization);
                            self.setState({
                                students: items,
                                organization: self.state.organization
                            });

                        })
                        .catch(function(error) {
                            swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                        });
                }
            });


    }

    getStudentId(e, student) {
        let index = -1;
        this.state.students.forEach(function (item, i) {
            if (item.id === student.id) {
                index = i
            }
        });

        return index;
    }


    handleCSVFile(csvData) {
        this.setState({
            importStudents: csvData
        });
    }

    onSubmitImportStudents() {
        var self = this;

        this.state.importStudents.forEach(function (student) {
            if (typeof(student.studentId) === 'undefined' || student.studentId == '') return;
            student['firstName'] = student['name'];
            student['created'] = (new Date()).getTime();
            student['isDelete'] = false;
            student['totalScore'] = 0;

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(self.state.organizationId)
                .collection(CollectionConfig.STUDENT)
                .doc(student.studentId)
                .set(student)
                .then(function(docRef) {

                    student['id'] = student.studentId;

                    var students = self.state.students;
                    students.push(student);


                    self.setState({
                        'newStudent': {},
                        'errors': [],
                    });

                    if (self.state.importStudents[self.state.importStudents.length-1].studentId == student.studentId) {
                        $('#uploadStudent').modal('hide');
                        swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                        document.getElementById("uploadStudentFile").value = "";

                        self.updateStat();

                        self.setState({
                            'importStudents': [],
                        })
                    }

                })
                .catch(function(error) {
                    console.error("Error adding document: ", error);
                });

        });

    }

    OnChecked(e, student) {

        var checkedStudents = this.state.checkedStudents;
        if (e.target.checked) {
            checkedStudents[student.studentId] = student;
        } else {
            delete checkedStudents[student.studentId]
        }

        this.setState({
            checkedStudents: checkedStudents,
        })
    }


    removeMultipleStudent() {

        var self = this;
        var checkedStudents = this.state.checkedStudents;
        console.log('checkedStudents', checkedStudents);

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this student!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {

                var organizationId = self.state.organizationId;

                if (willDelete) {
                    var studentIds =  Object.keys(checkedStudents);
                    studentIds.forEach(function (studentId) {
                        var student = self.state.checkedStudents[studentId];

                        db.collection(CollectionConfig.ORGANIZATION).doc(organizationId)
                            .collection(CollectionConfig.STUDENT).doc(student.id).update({isDelete: true})
                            .then(function(docRef) {

                                student.isDelete = true;

                                let studentIndex = self.getStudentId(true, student);
                                console.log('studentIndex', studentIndex);

                                let items =  self.state.students;
                                items[studentIndex] = student;

                                self.setState({
                                    students: items,
                                });

                                if (studentIds[studentIds.length-1] == student.studentId) {
                                    swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                                    self.updateStat();

                                    self.setState({
                                        'checkedStudents': {},
                                    })
                                }

                            })
                            .catch(function(error) {
                                // swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                            });
                    })

                }
            });

    }

    updateStat() {
        var self = this;
        db.collection(CollectionConfig.ORGANIZATION)
            .doc(this.state.organizationId)
            .collection(CollectionConfig.STUDENT)
            .get()
            .then((querySnapshot) => {
                let demographics = {};
                let department = {};
                let section = {};

                let totalUser = 0;

                querySnapshot.forEach((doc) => {
                    var student = {
                        id: doc.id,
                        firstName: doc.data().firstName,
                        lastName: doc.data().lastName,
                        level: doc.data().level,
                        room: doc.data().room,
                        department: doc.data().department,
                        status: doc.data().status,
                        studentId: doc.data().studentId,
                        isDelete: doc.data().isDelete
                    };

                    if (!student.isDelete) {
                        if (typeof(demographics[student.level]) === 'undefined') demographics[student.level] = 1;
                        else demographics[student.level] += 1;

                        if (typeof(department[student.department]) === 'undefined') department[student.department] = 1;
                        else department[student.department] += 1;

                        if (typeof(section[student.level + "-" + student.room]) === 'undefined') section[student.level + "-" + student.room] = 1;
                        else section[student.level + "-" + student.room] += 1;

                        totalUser += 1;
                    }
                });

                console.log('totalUser', totalUser);
                console.log('department', department);
                console.log('section', section);

                self.calculateDepartmentGrowth(department, totalUser);

                db.collection(CollectionConfig.ORGANIZATION)
                    .doc(self.state.organization.organizationCode)
                    .collection(CollectionConfig.DEPARTMENT).get().then((querySnapshot) => {

                    querySnapshot.forEach((doc) => {
                        db.collection(CollectionConfig.ORGANIZATION)
                            .doc(self.state.organization.organizationCode)
                            .collection(CollectionConfig.DEPARTMENT).doc(doc.id).delete()
                    });

                    Object.keys(department).forEach(function (key) {
                        db.collection(CollectionConfig.ORGANIZATION)
                            .doc(self.state.organization.organizationCode)
                            .collection(CollectionConfig.DEPARTMENT)
                            .doc(key)
                            .set({
                                totalUser: department[key]
                            }).then(function (docRef) {
                        });
                    });

                });


                db.collection(CollectionConfig.ORGANIZATION)
                    .doc(self.state.organization.organizationCode)
                    .collection(CollectionConfig.SECTION).get().then((querySnapshot) => {


                    querySnapshot.forEach((doc) => {
                        db.collection(CollectionConfig.ORGANIZATION)
                            .doc(self.state.organization.organizationCode)
                            .collection(CollectionConfig.SECTION).doc(doc.id).delete()
                    });


                    Object.keys(section).forEach(function (key) {
                        db.collection(CollectionConfig.ORGANIZATION)
                            .doc(self.state.organization.organizationCode)
                            .collection(CollectionConfig.SECTION)
                            .doc(key)
                            .set({
                                level: key.split('-')[0],
                                room: key.split('-')[1],
                                totalUser: section[key]
                            }).then(function (docRef) {
                        });
                    });
                });


                db.collection(CollectionConfig.ORGANIZATION)
                    .doc(self.state.organization.organizationCode)
                    .collection(CollectionConfig.ORGANIZATION_STAT)
                    .doc('demographics')
                    .set({
                        name: 'Demographics',
                        values: demographics
                    }).then(function(docRef) {});


                db.collection(CollectionConfig.ORGANIZATION)
                    .doc(self.state.organization.organizationCode)
                    .collection(CollectionConfig.ORGANIZATION_STAT)
                    .doc('demographics')
                    .set({
                        name: 'Demographics',
                        values: demographics
                    }).then(function(docRef) {});


                db.collection(CollectionConfig.ORGANIZATION)
                    .doc(self.state.organization.organizationCode)
                    .update({
                        'stat.totalUser': totalUser
                    }).then(function(docRef) {});
                self.state.organization.stat.totalUser = totalUser;

                this.setState({
                    organization: self.state.organization
                })
            });
    }

    calculateDepartmentGrowth(department, totalUser) {
        var self = this;

        var created = (new Date()).getTime()
        var dateKey = "D" + (new Date()).setHours(0, 0, 0, 0);


        db.collection(CollectionConfig.ORGANIZATION).doc(self.state.organization.organizationCode)
            .collection(CollectionConfig.ORGANIZATION_STAT).doc('courseCompletionGrowth')
            .collection(CollectionConfig.DATA).doc(dateKey)
            .get().then((doc) => {

                if (!doc.exists) {

                    db.collection(CollectionConfig.ORGANIZATION).doc(self.state.organization.organizationCode)
                        .collection(CollectionConfig.ORGANIZATION_STAT).doc('courseCompletionGrowth')
                        .collection(CollectionConfig.DATA).doc(dateKey)
                        .set({
                            level1: 0,
                            level2: 0,
                            level3: 0,
                            level4: 0,
                            level5: 0,
                            level6: 0,
                            avgScore: 0,
                            created: created,
                            totalCompletion: 0,
                            totalUser: totalUser,
                            totalInteraction: 0,
                            section: department
                        }).then(function (docRef) {
                    });


                } else {

                    db.collection(CollectionConfig.ORGANIZATION).doc(self.state.organization.organizationCode)
                        .collection(CollectionConfig.ORGANIZATION_STAT).doc('courseCompletionGrowth')
                        .collection(CollectionConfig.DATA).doc(dateKey)
                        .update({
                            section: department,
                            totalUser: totalUser
                        }).then(function (docRef) {
                    });



                }
            });
    }

    render() {

        if (this.state.user == null || typeof(this.state.user) === "undefined") {
            return  super.render()
        }

        var newOrganization = this.state.newOrganization;
        return (
            <div className="wrapper-cms">
                <Header user={this.state.user}/>
                <div className="container">
                    <div className="card mb-5">
                        <div className="card-body">
                            <SchoolForm newOrganization={newOrganization}
                                        onSubmitOrganization={this.onEditOrganization.bind(this)}
                                        isCreated={true} />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <div className="d-flex justify-content-between align-items-center">
                            <h2 className="card-title text-primary ic-edit mb-0">Edit Student ({ typeof(this.state.organization) !== 'undefined' && typeof(this.state.organization.stat) !== 'undefined'? this.state.organization.stat.totalUser: this.state.students.length })</h2>
                            <div className="">
                                <button type="submit" className="btn btn-green " data-toggle="modal" data-target="#confirm-delete" onClick={(e) => this.removeMultipleStudent()}>Delete</button>
                                <button type="submit" className="btn btn-green ml-3"  data-toggle="modal" data-target="#uploadStudent">+ Upload List</button>
                                <button type="submit" className="btn btn-green ml-3" data-toggle="modal" data-target="#editStudent" onClick={(e) => this.renderStudent(e, {})}>+ Add Student</button>
                            </div>
                        </div>

                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        <input type="checkbox" className="d-none"  />
                                    </th>
                                    <th scope="col"></th>
                                    <th scope="col" className="w-25">Student name</th>
                                    <th scope="col">ID</th>
                                    <th scope="col">Department</th>
                                    <th scope="col">Level</th>
                                    <th scope="col">Room</th>
                                    <th scope="col">Status</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.students.map((student, i) =>
                                !student.isDelete?
                                    <tr>
                                        <td className="select-checkbox">
                                            <input type="checkbox" className="" onChange={(e) => this.OnChecked(e, student)} />
                                        </td>
                                        <td>
                                            <div className="img-thumb">
                                            <img className="img-cover"
                                                 src="/static/images/default-user.png"
                                                 src={typeof(student.avatarUrl) === 'undefined' || student.avatarUrl.indexOf('https') === -1 ? "/static/images/default-user.png": student.avatarUrl}
                                                 alt={ student.firstName } /></div>
                                        </td>
                                        <td>{ student.firstName } { student.lastName }</td>
                                        <td>{ student.studentId }</td>
                                        <td className="text-center">{ student.department }</td>
                                        <td className="text-center">M{ student.level }</td>
                                        <td className="text-center">/{ student.room }</td>
                                        <td className="text-center">{ student.status === 'active'? 'กำลังศึกษาอยู่': 'จบแล้ว' }</td>
                                        <td className="text-center">
                                            <a href="#" className="btn btn-outline btn-sm" data-toggle="modal" data-target="#editStudent" onClick={(e) => this.renderStudent(e, student)}>แก้ไข</a>
                                            <a href="#" className="btn btn-danger btn-sm ml-2" data-toggle="modal" data-target="#confirm-delete"  onClick={(e) => this.removeStudent(e, student)}>ลบ</a>
                                        </td>
                                    </tr>: <tr></tr>
                                )
                            }
                            </tbody>
                        </table>
                        {/* Modal Edit */}
                        <div className="modal fade" id="editStudent">
                            <div className="modal-dialog modal-lg modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h2 className="card-title text-primary ic-edit mb-0">Student</h2>
                                        <button type="button" className="close" data-dismiss="modal">×</button>
                                    </div>
                                    <div className="modal-body">
                                        <StudentForm newStudent={this.state.newStudent}
                                                     onSubmitStudent={this.onSubmitStudent.bind(this)} />
                                    </div>

                                </div>
                            </div>
                        </div>



                        <div className="modal fade" id="uploadStudent">
                            <div className="modal-dialog modal-lg modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h2 className="card-title text-primary ic-edit mb-0">Upload Student</h2>
                                        <button type="button" className="close" data-dismiss="modal">×</button>
                                    </div>
                                    <div className="modal-body">
                                        <CsvParse
                                            keys={['name',
                                                'studentId',
                                                'department',
                                                'level',
                                                'room',
                                                'status']}
                                            onDataUploaded={(e) => this.handleCSVFile(e)}
                                            render={onChange => <input type="file" id="uploadStudentFile" className="form-control" onChange={onChange} />}
                                        />

                                        {
                                            this.state.importStudents.length > 0?
                                                <div><table className="table table-hover">
                                                    <thead>
                                                    <tr>
                                                        <th scope="col" className="w-25">Student name</th>
                                                        <th scope="col">ID</th>
                                                        <th scope="col">Department</th>
                                                        <th scope="col">Level</th>
                                                        <th scope="col">Room</th>
                                                        <th scope="col">Status</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {
                                                        this.state.importStudents.map((student, i) =>
                                                            <tr>
                                                                <td>{ student.name }</td>
                                                                <td>{ student.studentId }</td>
                                                                <td>{ student.department }</td>
                                                                <td>{ student.level }</td>
                                                                <td>{ student.room }</td>
                                                                <td>{ student.status }</td>
                                                            </tr>
                                                        )
                                                    }
                                                    </tbody>
                                                </table>

                                                <button type="submit" className="btn btn-primary"  onClick={(e) => this.onSubmitImportStudents(e)} >บันทึก</button>

                                                </div>: <div></div>

                                        }



                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

export default SchoolDetail;
