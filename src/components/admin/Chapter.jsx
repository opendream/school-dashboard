import React from "react";
import Header from "./Header";

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

import firebase from "../../firebase";
let db = firebase.firestore();

import swal from "sweetalert";

import ChapterForm from "../form/ChapterForm";
import BaseAdminPage from "../common/BaseAdminPage";

const CollectionConfig = require('../../config/collection.json');

class Chapter extends BaseAdminPage {
    constructor(props) {
        super(props);

        db.collection(CollectionConfig.CONTENT)
            .where("isDelete", "==", false)
            .get()
            .then((querySnapshot) => {
                let contents = [];
                querySnapshot.forEach((doc) => {
                    var item = {
                        id: doc.id,
                        subjectCode: doc.data().subjectCode,
                        subjectName: doc.data().subjectName,
                        isDelete: doc.data().isDelete
                    };
                    contents.push(item);
                });

                this.setState({
                    contents: contents
                })
            });

        db.collection(CollectionConfig.CHAPTER)
            .where("isDelete", "==", false)
            .get()
            .then((querySnapshot) => {
                let chapters = [];
                querySnapshot.forEach((doc) => {
                    var item = {
                        id: doc.id,
                        subjectId: doc.data().subjectId,
                        subjectName: doc.data().subjectName || doc.data().subjectId,
                        chapterCode: doc.data().chapterCode,
                        chapterName: doc.data().chapterName,
                        chapterLevel: doc.data().chapterLevel,
                        chapterQuiz: doc.data().chapterQuiz,
                        chapterCoverUrl: doc.data().chapterCoverUrl,
                        stat: doc.data().stat,
                        isDelete: doc.data().isDelete
                    };
                    chapters.push(item);
                });

                this.setState({
                    chapters: chapters
                })
            });


        this.state = {
            contents: [],
            chapters: [],
            newChapter: {},
            errors: ''
        }


    }

    onChange(e) {
        const { name, value } = e.target

        this.setState({
            [name]: value
        })
    }

    onDelete(e, chapter) {

        let self = this;

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this chapter!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    db.collection(CollectionConfig.CHAPTER).doc(chapter.id).update({isDelete: true})
                        .then(function(docRef) {
                            swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                            chapter.isDelete = true;

                            let chapterIndex = self.getChapterId(e, chapter);
                            console.log('chapterIndex', chapterIndex);

                            let items =  self.state.chapters;
                            items[chapterIndex] = chapter;

                            self.setState({
                                chapters: items
                            });

                            db.collection(CollectionConfig.CONTENT)
                                .doc(chapter.subjectId)
                                .get()
                                .then((doc) => {
                                    let content  = {
                                        id: doc.id,
                                        subjectCode: doc.data().subjectCode,
                                        subjectName: doc.data().subjectName,
                                        stat: doc.data().stat,
                                        isDelete: doc.data().isDelete
                                    };

                                    content.stat.totalChapter = content.stat.totalChapter - 1;
                                    db.collection(CollectionConfig.CONTENT)
                                        .doc(chapter.subjectId)
                                        .set(content).then(function(docRef) {});
                                });



                        })
                        .catch(function(error) {
                            swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                        });
                }
            });

    }

    onSubmit(e, chapter, chapterCover) {
        e.preventDefault();

        var self = this;

        chapter['created'] = (new Date()).getTime();
        chapter['stat'] = {
            totalChallenge: 0,
            totalUser: 0
        };

        if (typeof(chapter['chapterCoverUrl']) === 'undefined') {
            delete chapter['chapterCoverUrl'];
        }

        db.collection(CollectionConfig.CHAPTER).doc(chapter.chapterCode).set(chapter)
            .then(function(docRef) {
                swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                chapter['id'] = chapter.chapterCode;

                if (typeof(chapterCover) !== 'undefined' && chapterCover !== null) {
                    self.submitCover(chapterCover, chapter['id'])
                }

                let chapters = self.state.chapters;
                chapters.push(chapter);

                self.setState({
                    'newChapter.chapterName': '',
                    'newChapter.chapterCode': '',
                    'newChapter.chapterLevel': '',
                    'newChapter.chapterScore': '',
                    'newChapter.chapterQuiz': '',
                    'newChapter.chapterObjective': '',
                    'newChapter.chapterAssessment': '',
                    'newChapter.subjectId': '',
                    'errors': [],
                    'newChapter': {},
                    'chapters': chapters
                });


                db.collection(CollectionConfig.CONTENT)
                    .doc(chapter.subjectId)
                    .get()
                    .then((doc) => {
                        let content  = {
                            id: doc.id,
                            subjectCode: doc.data().subjectCode,
                            subjectName: doc.data().subjectName,
                            stat: doc.data().stat,
                            isDelete: doc.data().isDelete
                        };

                        content.stat.totalChapter = content.stat.totalChapter + 1;
                        db.collection(CollectionConfig.CONTENT)
                            .doc(chapter.subjectId)
                            .set(content).then(function(docRef) {});
                    });



            })
            .catch(function(error) {
                swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                console.error("Error adding document: ", error);
            });

        return true
    }

    getChapterId(e, chapter) {
        let index = -1;
        this.state.chapters.forEach(function (item, i) {
            console.log(item, chapter.id)
            if (item.id === chapter.id) {
                index = i
            }
        });

        return index;
    }


    submitCover(file, chapterId) {
        var self = this;

        const ref = firebase.storage().ref();
        const name = (+new Date()) + '-' + file.name;

        console.log("submitDocument", file);

        const metadata = {
            contentType: file.type
        };
        const task = ref.child('chapterCover').child(name).put(file, metadata);
        task
            .then(snapshot => snapshot.ref.getDownloadURL())
            .then((url) => {

                db.collection(CollectionConfig.CHAPTER)
                    .doc(chapterId)
                    .update({chapterCoverUrl: url})
                    .then(function (response) {

                        var chapters = self.state.chapters;
                        chapters.forEach(function (chapter) {
                            if (chapter.id == chapterId) {
                                chapter.chapterCoverUrl = url;
                            }

                        });

                        self.setState({
                            'chapters': chapters,
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
                            <ChapterForm contents={this.state.contents}
                                         newChapter={this.state.newChapter}
                                         onSubmitChapter={this.onSubmit.bind(this)}
                                         isCreated={false} />
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Logo</th>
                                <th scope="col" className="w-25">Chapter Name</th>
                                <th scope="col">Subject</th>
                                <th scope="col">Challenges</th>
                                <th scope="col">Level</th>
                                <th scope="col">Quiz No.</th>
                                <th scope="col">Users</th>
                                <th scope="col" className="w-25"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.chapters.map((chapter, i) =>
                                        !chapter.isDelete?
                                        <tr>
                                            <th scope="row">{ chapter.chapterCode }</th>
                                            <td><div className="img-thumb"><img
                                                width="44"
                                                src={typeof(chapter.chapterCoverUrl) === 'undefined' || chapter.chapterCoverUrl.indexOf('https') === -1? "/static/images/default-chapter.png": chapter.chapterCoverUrl}
                                                alt={chapter.chapterName} /></div></td>
                                            <td>{ chapter.chapterName }</td>
                                            <td>{ chapter.subjectName }</td>
                                            <td className="text-center">{ chapter.stat.totalChallenge }</td>
                                            <td className="text-center">{ chapter.chapterLevel }</td>
                                            <td className="text-center">{ chapter.chapterQuiz }</td>
                                            <td className="text-center">{ chapter.stat.totalUser }</td>
                                            <td className="text-center">
                                                <Link to={`/admin/chapter/${chapter.id}/detail`} className="btn btn-outline btn-sm">แก้ไข</Link>
                                                <a href="#" onClick={(e) => this.onDelete(e, chapter)} className="btn btn-danger btn-sm ml-2">ลบ</a></td>
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

export default Chapter;
