import React from "react";
import Header from "./Header";

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

import firebase from "../../firebase";
let db = firebase.firestore();

import swal from "sweetalert";
import ChapterForm from "../form/ChapterForm";
import ChallengeForm from "../form/ChallengeForm";
import BaseAdminPage from "../common/BaseAdminPage";

const CollectionConfig = require('../../config/collection.json');

class ChapterDetail extends BaseAdminPage {
    constructor(props) {
        super(props);

        var self = this;
        let chapterId = this.props.params.chapterId;

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
                        stat: doc.data().stat,
                        isDelete: doc.data().isDelete
                    };
                    contents.push(item);
                });

                this.setState({
                    contents: contents
                })
            });

        db.collection(CollectionConfig.CHAPTER)
            .doc(chapterId)
            .get()
            .then((doc) => {
                let chapter  = {
                    id: doc.id,
                    subjectId: doc.data().subjectId,
                    subjectName: doc.data().subjectName || doc.data().subjectId,
                    chapterCode: doc.data().chapterCode,
                    chapterName: doc.data().chapterName,
                    chapterLevel: doc.data().chapterLevel,
                    chapterScore: doc.data().chapterScore,
                    chapterQuiz: doc.data().chapterQuiz,
                    chapterObjective: doc.data().chapterObjective,
                    chapterAssessment: doc.data().chapterAssessment,
                    chapterCoverUrl: doc.data().chapterCoverUrl || "",
                    stat: doc.data().stat,
                    isDelete: doc.data().isDelete
                };

                db.collection(CollectionConfig.CONTENT)
                    .doc(doc.data().subjectId)
                    .get()
                    .then((doc) => {
                        let content  = {
                            id: doc.id,
                            subjectCode: doc.data().subjectCode,
                            subjectName: doc.data().subjectName,
                            stat: doc.data().stat,
                            isDelete: doc.data().isDelete
                        };

                        this.setState({
                            content: content
                        })
                    });

                self.setState({
                    'newChapter': chapter,
                    chapter: chapter
                })
            });


        db.collection(CollectionConfig.CHAPTER)
            .doc(chapterId)
            .collection(CollectionConfig.CHALLENGE)
            .get()
            .then((querySnapshot) => {
                let challenges = [];
                console.log(querySnapshot)
                querySnapshot.forEach((doc) => {
                    var item = {
                        id: doc.id,
                        chapterId: doc.data().chapterId,
                        subjectId: doc.data().subjectId,
                        challengeCode: doc.data().challengeCode,
                        challengeName: doc.data().challengeName,
                        challengeLevel: doc.data().challengeLevel,
                        challengeScore: doc.data().challengeScore,
                        challengeQuiz: doc.data().challengeQuiz,
                        challengeObjective: doc.data().challengeObjective,
                        challengeAssessment: doc.data().challengeAssessment,
                        challengeCoverUrl: doc.data().challengeCoverUrl,
                        stat: doc.data().stat,
                        isDelete: doc.data().isDelete
                    };

                    challenges.push(item);
                });

                console.log('challenges', challenges)

                this.setState({
                    challenges: challenges
                })
            });



        this.state = {
            chapterId: chapterId,
            chapter: {},
            contents: [],
            newChapter: {},
            newChallenge: {},
            challenges: [],
            errors: '',
            challengeErrors: []
        }
    }

    onChange(e) {
        const { name, value } = e.target

        this.setState({
            [name]: value
        })
    }

    onSubmitChapter(e , chapter, chapterCover) {
        e.preventDefault()

        if (typeof(chapter['chapterCoverUrl']) === 'undefined') {
            delete chapter['chapterCoverUrl'];
        }

        var self = this;
        db.collection(CollectionConfig.CHAPTER).doc(chapter.chapterCode).update(chapter)
            .then(function(docRef) {
                swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                chapter['id'] = chapter.chapterCode;
                if (typeof(chapterCover) !== 'undefined' && chapterCover !== null) {
                    self.submitCover(chapterCover, chapter['id'])
                }

                self.setState({
                    'errors': [],
                    'newChapter': chapter
                });
            })
            .catch(function(error) {
                swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                console.error("Error adding document: ", error);
            });

        return true
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

                        var chapter = self.state.chapter;
                        chapter.chapterCoverUrl = url;

                        self.setState({
                            'chapter': chapter,
                            'newChapter': chapter
                        });
                    })
                    .catch(function (error) {
                    });

            })
            .catch(console.error);

    }

    onSubmitChallenge(e, challenge, challengeCover) {
        e.preventDefault()

        var self = this;
        challenge['chapterId'] = this.state.chapterId;
        challenge['subjectId'] = this.state.chapter.subjectId;
        challenge['stat'] = {
            totalUser: 0
        };
        challenge['created'] = (new Date()).getTime();

        if (typeof(challenge['challengeCoverUrl']) === 'undefined') {
            delete challenge['challengeCoverUrl'];
        }

        db.collection(CollectionConfig.CHAPTER)
            .doc(this.state.chapterId)
            .collection(CollectionConfig.CHALLENGE)
            .doc(challenge.challengeCode)
            .set(challenge)
            .then(function(docRef) {
                swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                challenge['id'] = challenge.challengeCode;

                var challenges = self.state.challenges;
                challenges.push(challenge);

                self.setState({
                    'newChallenge': {},
                    'challenges': challenges,
                    'errors': [],
                });

                if (typeof(challengeCover) !== 'undefined' && challengeCover !== null) {
                    self.submitChallengeCover(challengeCover, self.state.chapterId, challenge['id'])
                }

                db.collection(CollectionConfig.CHAPTER)
                    .doc(self.state.chapter.chapterCode)
                    .get().then(function(doc) {
                    var totalChallenge = 1;

                    if (typeof(doc.data()) !== 'undefined' &&
                        typeof(doc.data().stat) !== 'undefined' &&
                        typeof(doc.data().stat.totalChallenge) !== 'undefined') {
                        totalChallenge = self.state.chapter.stat.totalChallenge + 1;
                    }

                    self.state.chapter.stat.totalChallenge = totalChallenge;
                    db.collection(CollectionConfig.CHAPTER)
                        .doc(self.state.chapter.chapterCode)
                        .set(self.state.chapter).then(function(docRef) {});
                });

                db.collection(CollectionConfig.CONTENT)
                    .doc(self.state.chapter.subjectId)
                    .get().then(function(doc) {
                        var totalChallenge = 1;

                    if (typeof(doc.data()) !== 'undefined' &&
                        typeof(doc.data().stat) !== 'undefined' &&
                        typeof(doc.data().stat.totalChallenge) !== 'undefined') {
                        totalChallenge = self.state.content.stat.totalChallenge + 1;
                    }


                    self.state.content.stat.totalChallenge = totalChallenge;
                    db.collection(CollectionConfig.CONTENT)
                        .doc(self.state.chapter.subjectId)
                        .set(self.state.content).then(function(docRef) {});
                });



                $('#editChallenge').modal('hide');
            })
            .catch(function(error) {
                swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                console.error("Error adding document: ", error);
            });

        return true
    }

    renderChallenge(e, challenge) {

        this.setState({
            'newChallenge': challenge,
            'newChallenge.id': challenge.id
        });

    }

    removeChallenge(e, challenge) {

        let self = this;

        let chapterId = this.props.params.chapterId;

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this challenge!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    db.collection(CollectionConfig.CHAPTER).doc(chapterId).collection(CollectionConfig.CHALLENGE).doc(challenge.id).update({isDelete: true})
                        .then(function(docRef) {
                            swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                            challenge.isDelete = true;

                            let challengeIndex = self.getChallengeId(e, challenge);
                            console.log('challengeIndex', challengeIndex);

                            let items =  self.state.challenges;
                            items[challengeIndex] = challenge;

                            self.setState({
                                challenges: items
                            });

                            self.state.chapter.stat.totalChallenge = self.state.chapter.stat.totalChallenge - 1;
                            console.log('self.state.chapter.stat.totalChallenge ', self.state.chapter.stat.totalChallenge );
                            db.collection(CollectionConfig.CHAPTER)
                                .doc(self.state.chapter.chapterCode)
                                .set(self.state.chapter).then(function(docRef) {});

                            self.state.content.stat.totalChallenge = self.state.content.stat.totalChallenge - 1;
                            db.collection(CollectionConfig.CONTENT)
                                .doc(self.state.chapter.subjectId)
                                .set(self.state.content).then(function(docRef) {});

                        })
                        .catch(function(error) {
                            swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                        });
                }
            });


    }

    getChallengeId(e, challenge) {
        let index = -1;
        this.state.challenges.forEach(function (item, i) {
            console.log(item, challenge.id)
            if (item.id === challenge.id) {
                index = i
            }
        });

        return index;
    }

    submitChallengeCover(file, chapterId, challengeId) {
        var self = this;

        const ref = firebase.storage().ref();
        const name = (+new Date()) + '-' + file.name;

        console.log("submitDocument", file);

        const metadata = {
            contentType: file.type
        };
        const task = ref.child('challengeCover').child(name).put(file, metadata);
        task
            .then(snapshot => snapshot.ref.getDownloadURL())
            .then((url) => {

                db.collection(CollectionConfig.CHAPTER)
                    .doc(chapterId)
                    .collection(CollectionConfig.CHALLENGE)
                    .doc(challengeId)
                    .update({challengeCoverUrl: url})
                    .then(function (response) {

                        var challenges = self.state.challenges;
                        challenges.forEach(function (challenge) {
                            if (challenge.id == challengeId) {
                                challenge.challengeCoverUrl = url;
                            }

                        });

                        self.setState({
                            'challenges': challenges,
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
                    <div className="card mb-5">
                        <div className="card-body">
                            <ChapterForm contents={this.state.contents}
                                         newChapter={this.state.newChapter}
                                         onSubmitChapter={this.onSubmitChapter.bind(this)}
                                         isCreated={true}/>
                        </div>
                    </div>
                    {/* /.card */}
                    <div className="table-responsive">
                        <div class="d-flex justify-content-between align-items-center">
                            <h2 class="card-title text-primary ic-edit mb-0">Edit Challenge</h2>
                            <div class="">
                                <button type="submit" class="btn btn-green ml-3" data-toggle="modal" data-target="#editChallenge">+ Add Challenge</button>
                            </div>
                        </div>

                        <table className="table table-hover">
                            <thead>
                                <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Logo</th>
                                <th scope="col" className="w-50">Chapter Name</th>
                                <th scope="col">Level</th>
                                <th scope="col">Quiz No.</th>
                                <th scope="col">Users</th>
                                <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.challenges.map((challenge, i) =>
                                    !challenge.isDelete? <tr>
                                        <th scope="row">{ challenge.challengeCode }</th>
                                        <td><div className="img-thumb"><img
                                            width="44"
                                            src={typeof(challenge.challengeCoverUrl) === 'undefined' || challenge.challengeCoverUrl.indexOf('https') === -1 ? "/static/images/default-chapter.png": challenge.challengeCoverUrl}
                                            alt={challenge.challengeName} /></div></td>
                                        <td>{ challenge.challengeName }</td>
                                        <td className="text-center">{ challenge.challengeLevel }</td>
                                        <td className="text-center">{ challenge.challengeQuiz }</td>
                                        <td className="text-center">{ challenge.stat.totalUser }</td>
                                        <td className="text-center">
                                            <Link to={`/admin/chapter/${this.state.chapterId}/challenge/${challenge.id}/detail`} className="btn btn-outline btn-sm">แก้ไข</Link>
                                            <a href="#" className="btn btn-danger btn-sm ml-2" onClick={(e) => this.removeChallenge(e, challenge)}>ลบ</a>
                                        </td>
                                    </tr>: <tr></tr>
                                )
                            }
                            </tbody>
                        </table>

                        <div className="modal fade" id="editChallenge">
                            <div className="modal-dialog modal-lg modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h2 className="card-title text-green ic-plus mb-0">Challenge</h2>
                                        <button type="button" className="close" data-dismiss="modal">×</button>
                                    </div>
                                    <div className="modal-body">
                                        <ChallengeForm
                                             isCreated={false}
                                             newChallenge={this.state.newChallenge}
                                             onSubmitChallenge={this.onSubmitChallenge.bind(this)}/>
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

export default ChapterDetail;
