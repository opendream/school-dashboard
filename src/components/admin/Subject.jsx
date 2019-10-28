import React from "react";
import Header from "./Header";

import firebase from "../../firebase";
import swal from "sweetalert";
import BaseAdminPage from "../common/BaseAdminPage";
let db = firebase.firestore();

const CollectionConfig = require('../../config/collection.json');

class Subject extends BaseAdminPage {
    constructor(props) {
        super(props);

        db.collection(CollectionConfig.CONTENT)
            .where("isDelete", "==", false)
            .orderBy('subjectCode')
            .get()
            .then((querySnapshot) => {
                let contents = [];
                querySnapshot.forEach((doc) => {
                    var item = {
                        id: doc.id,
                        subjectName: doc.data().subjectName,
                        contentCoverUrl: doc.data().contentCoverUrl,
                        stat: doc.data().stat,
                        isDelete: doc.data().isDelete
                    };
                    contents.push(item);
                });

                console.log('contents', contents);

                this.setState({
                    contents: contents
                })
            });


        this.state = {
            contents: [],
            newContent: {},
            editContent: {},
            errors: '',
            editErrors: []
        }

    }

    renderContent(e, content) {

        this.setState({
            'editContent.subjectName': content.subjectName,
            'editContent.subjectId': content.id,
            'editContent.oldContentId': content.id,
            'editContent.stat': content.stat,
            'editContent.contentCoverUrl': content.contentCoverUrl,
        });

    }


    onChange(e) {
        const { name, value } = e.target;

        this.setState({
            [name]: value
        })
    }

    onDelete(e, content) {

        let self = this;

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this subject!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    db.collection(CollectionConfig.CONTENT).doc(content.id).update({isDelete: true})
                        .then(function(docRef) {
                            swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                            content.isDelete = true;

                            let contentIndex = self.getContentId(e, content);
                            console.log('contentIndex', contentIndex);

                            let items =  self.state.contents;
                            items[contentIndex] = content;

                            self.setState({
                                contents: items
                            });


                        })
                        .catch(function(error) {
                            swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                        });
                }
            });

    }

    onCreate(e) {
        e.preventDefault()
        this.setState({
            'newContent.subjectId': ''
        });


        this.onSubmit(e)
    }

    onSubmit(e) {
        e.preventDefault()
        var self = this;

        let content = {
            subjectName: this.state['newContent.subjectName'],
            subjectCode: this.state['newContent.subjectName'],
            isDelete: false
        };

        let contentId = this.state['editContent.oldContentId'];

        if (typeof(contentId) === 'undefined' || contentId === '') {
            content['created'] = (new Date()).getTime();
            content['stat'] = {
                totalChallenge: 0,
                totalChapter: 0,
                totalUser: 0,
            };


            var errors = [];

            if (typeof(content.subjectName) === 'undefined' || content.subjectName === '') {
                errors.push('subjectName is required.')
            }

            if (errors.length > 0) {
                this.setState({
                    'errors': errors,

                });
                return true;
            }

            if (typeof(content['contentCoverUrl']) === 'undefined') {
                delete content['contentCoverUrl'];
            }

            db.collection(CollectionConfig.CONTENT).doc(content.subjectCode).set(content)
                .then(function (docRef) {
                    swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                    content['id'] = content.subjectCode;


                    let contents = self.state.contents;
                    contents.push(content);

                    self.setState({
                        'newContent.subjectName': '',
                        'errors': [],
                        'contents': contents
                    });

                    var contentCover = self.state['newContent.contentCover'];
                    if (typeof(contentCover) !== 'undefined' && contentCover !== null) {
                        self.submitCover(contentCover, content['id'])
                    }
                })
                .catch(function (error) {
                    swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                    console.error("Error adding document: ", error);
                });

        } else {

            content['modified'] = (new Date()).getTime();

            content = {
                subjectName: this.state['editContent.subjectName'],
                subjectCode: this.state['editContent.subjectName'],
                isDelete: false
            };

            var errors = [];

            if (typeof(content.subjectName) === 'undefined' || content.subjectName === '') {
                errors.push('subjectName is required.')
            }

            if (errors.length > 0) {
                this.setState({
                    'editErrors': errors,

                });
                return true;
            }

            if (typeof(content['contentCoverUrl']) === 'undefined') {
                delete content['contentCoverUrl'];
            }


            db.collection(CollectionConfig.CONTENT).doc(contentId).update(content)
                .then(function (docRef) {
                    swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                    content['id'] = contentId;
                    content['stat'] = self.state['editContent.stat'];

                    let contentIndex = self.getContentId(e, content);
                    console.log('contentIndex', contentIndex);

                    let items =  self.state.contents;
                    items[contentIndex] = content;


                    self.setState({
                        'editContent.subjectName': '',
                        'errors': [],
                        'contents': items
                    });

                    var contentCover = self.state['editContent.contentCover'];
                    console.log('contentCover', contentCover);

                    if (typeof(contentCover) !== 'undefined' && contentCover !== null) {
                        self.submitCover(contentCover, content['id'])
                    }

                    $('#editSubject').modal('hide');
                })
                .catch(function (error) {
                    swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                    console.error("Error adding document: ", error);
                });
        }
        return true
    }

    getContentId(e, content) {
        let index = -1;
        this.state.contents.forEach(function (item, i) {
            console.log(item, content.id)
            if (item.id === content.id) {
                index = i
            }
        });

        return index;
    }

    changeNewCover() {
        const file = document.querySelector('#subjectCover').files[0];
        console.log('file', file)

        this.setState({
            'contentCoverName': file.name,
            'newContent.contentCover': file
        });
    }

    changeEditCover() {
        const file = document.querySelector('#subjectEditCover').files[0];
        console.log('file', file)

        this.setState({
            'contentEditCoverName': file.name,
            'editContent.contentCover': file
        });
    }

    submitCover(file, contentId) {
        console.log("submitDocument", file);

        var self = this;

        const ref = firebase.storage().ref();
        const name = (+new Date()) + '-' + file.name;


        const metadata = {
            contentType: file.type
        };
        const task = ref.child('subjectCover').child(name).put(file, metadata);
        task
            .then(snapshot => snapshot.ref.getDownloadURL())
            .then((url) => {

                db.collection(CollectionConfig.CONTENT)
                    .doc(contentId)
                    .update({contentCoverUrl: url})
                    .then(function (response) {

                        var contents = self.state.contents;
                        contents.forEach(function (content) {
                            if (content.id == contentId) {
                                content.contentCoverUrl = url;
                            }
                        })

                        self.setState({
                            'contents': contents,
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


        return (
            <div className="wrapper-cms">
                <Header user={this.state.user}/>
                <div className="container">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h2 className="card-title text-green ic-plus">Create Subject</h2>
                            <div className="row">
                                <div className="col-12">
                                    { this.state.errors.length > 0?  <ul className="alert alert-warning">
                                        {this.state.errors.map((error, i) => <li>{ error }</li>)}
                                    </ul>: <ul></ul>}
                                </div>
                                <div className="col-6">
                                    <div className="form-group">
                                        <label htmlFor="inputschool">Subject Name</label>
                                        <input type="text" className="form-control" id="inputschool" name="newContent.subjectName" onChange={(e) =>this.onChange(e)} value={this.state['newContent.subjectName']}  />
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="form-group">
                                        <label for="inputcover">Subject Cover</label>
                                        <div className="custom-file mb-3">
                                            <input type="file" className="custom-file-input" id="subjectCover" name="filename" onChange={(e) => this.changeNewCover(e)}/>
                                            <label className="custom-file-label" htmlFor="customFile">{typeof(this.state.contentCoverName) == 'undefined'? 'Attach file': this.state.contentCoverName}</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <a href="#" className="btn btn-green"  onClick={(e) => this.onCreate(e)}>Create</a>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                <th scope="col"></th>
                                <th scope="col" className="w-50">Subject Name</th>
                                <th scope="col">Users</th>
                                <th scope="col">Chapters</th>
                                <th scope="col">Challenges</th>
                                <th scope="col" className="w-25"></th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.contents.map((content, i) =>
                                    !content.isDelete?
                                    <tr>
                                        <td>
                                            <div className="img-thumb">
                                                <img
                                                width="44"
                                                src={typeof(content.contentCoverUrl) === 'undefined'|| content.contentCoverUrl.indexOf('https') === -1 ? "/static/images/default-chapter.png": content.contentCoverUrl}
                                                alt={content.subjectName} />
                                                </div>
                                        </td>

                                        <td>{content.subjectName}</td>
                                        <td className="text-center">{content.stat.totalUser}</td>
                                        <td className="text-center">{content.stat.totalChapter}</td>
                                        <td className="text-center">{content.stat.totalChallenge}</td>
                                        <td className="text-center">
                                          <a href="#" className="btn btn-outline btn-sm" data-toggle="modal" data-target="#editSubject" onClick={(e) => this.renderContent(e, content)}>แก้ไข</a>
                                          <a href="#" className="btn btn-danger btn-sm ml-2" data-toggle="modal" data-target="#confirm-delete" onClick={(e) => this.onDelete(e, content)}>ลบ</a></td>
                                    </tr>: <tr></tr>
                                )
                            }
                            </tbody>
                        </table>
                    </div>

                    <div className="modal fade" id="editSubject">
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h2 className="card-title text-primary ic-edit mb-0">Edit Subject</h2>
                                    <button type="button" className="close" data-dismiss="modal">×</button>
                                </div>
                                <div className="modal-body">
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-12">
                                                { this.state.editErrors.length > 0?  <ul className="alert alert-warning">
                                                    {this.state.editErrors.map((error, i) => <li>{ error }</li>)}
                                                </ul>: <ul></ul>}
                                            </div>
                                        <div className="col-6">
                                    <div className="form-group">
                                        <label htmlFor="inputschool">Subject Name</label>
                                        <input type="text" className="form-control" id="inputschool" name="editContent.subjectName" value={this.state['editContent.subjectName']} onChange={(e) => this.onChange(e)} />
                                    </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label for="inputcover">Subject Cover</label>
                                            <div className="custom-file mb-3">
                                                <input type="file" className="custom-file-input" id="subjectEditCover" name="filename" onChange={(e) => this.changeEditCover(e)}/>
                                                <label className="custom-file-label" htmlFor="customFile">{typeof(this.state.contentEditCoverName) == 'undefined'? 'Attach file': this.state.contentEditCoverName}</label>
                                                {typeof(this.state['editContent.contentCoverUrl']) === 'undefined'?<small></small>:<small><a href={this.state['editContent.contentCoverUrl']} target="_blank">{this.state['editContent.contentCoverUrl']}</a></small>}
                                            </div>
                                        </div>
                                    </div>
                                        </div>
                                        <button type="submit" className="btn btn-primary" onClick={(e) => this.onSubmit(e)}>บันทึก</button>
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

export default Subject;
