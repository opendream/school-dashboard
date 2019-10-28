import React from "react";
import Header from "./Header";

import ChallengeForm from "../form/ChallengeForm";
import swal from "sweetalert";


import firebase from "../../firebase";
import QuizForm from "../form/QuizForm";
import BaseAdminPage from "../common/BaseAdminPage";
let db = firebase.firestore();

const CollectionConfig = require('../../config/collection.json');


class ChallengeDetail extends BaseAdminPage {
    constructor(props) {
        super(props);


        var self = this;
        let chapterId = this.props.params.chapterId;
        let challengeId = this.props.params.challengeId;

        db.collection(CollectionConfig.CHAPTER)
            .doc(chapterId)
            .collection(CollectionConfig.CHALLENGE)
            .doc(challengeId)
            .get()
            .then((doc) => {
                let challenge  = {
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
                    isDelete: doc.data().isDelete
                };

                self.setState({
                    'newChallenge': challenge,
                    'challenge': challenge
                })
            });


        db.collection(CollectionConfig.CHAPTER)
            .doc(chapterId)
            .collection(CollectionConfig.CHALLENGE)
            .doc(challengeId)
            .collection(CollectionConfig.QUIZ)
            .get()
            .then((querySnapshot) => {
                let questions = [];
                querySnapshot.forEach((doc) => {
                    var item = {
                        id: doc.id,
                        chapterId: doc.data().chapterId,
                        subjectId: doc.data().subjectId,
                        challengeId: challengeId,

                        quizId: doc.data().quizId,
                        quizQuestion: doc.data().quizQuestion,
                        isDelete: doc.data().isDelete
                    };

                    questions.push(item);
                });

                this.setState({
                    quiz: questions
                })
            });



        this.state = {
            challengeId:challengeId,
            chapterId: chapterId,
            challenge: {},
            newQuiz: {},
            newChallenge: {},
            quiz: [],
            oldChoices: [],
            errors: '',
        }
    }


    onSubmitChallenge(e, challenge, challengeCover) {
        e.preventDefault();

        var self = this;

        if (typeof(challenge['challengeCoverUrl']) === 'undefined') {
            delete challenge['challengeCoverUrl'];
        }

        db.collection(CollectionConfig.CHAPTER)
            .doc(this.state.chapterId)
            .collection(CollectionConfig.CHALLENGE)
            .doc(challenge.challengeCode)
            .update(challenge)
            .then(function(docRef) {
                swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                challenge['id'] = challenge.challengeCode;

                self.setState({
                    'newChallenge': challenge,
                    'errors': [],
                });

                if (typeof(challengeCover) !== 'undefined' && challengeCover !== null) {
                    self.submitChallengeCover(challengeCover, self.state.chapterId, challenge['id'])
                }

                $('#editChallenge').modal('hide');

            })
            .catch(function(error) {
                swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                console.error("Error adding document: ", error);
            });

        return true
    }


    submitChallengeCover(file, chapterId, challengeId) {
        var self = this;

        const ref = firebase.storage().ref();
        const name = (+new Date()) + '-' + file.name;


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

                        var challenge = self.state.challenge;
                        challenge.challengeCoverUrl = url;

                        self.setState({
                            'challenge': challenge,
                            'newChallenge': challenge
                        });
                    })
                    .catch(function (error) {
                    });

            })
            .catch(console.error);

    }


    onSubmitQuiz(e, quiz) {
        var self = this;

        var quizId =  this.state['newQuiz.id'];

        var choices = quiz.choices;

        if (typeof(quizId) === 'undefined' || quizId === '') {
            db.collection(CollectionConfig.CHAPTER)
                .doc(this.state.chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(this.state.challengeId)
                .collection(CollectionConfig.QUIZ)
                .doc(quiz.quizId)
                .set(quiz)
                .then(function (docRef) {
                    swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                    var quizList = self.state.quiz;
                    if (typeof(quiz['id']) === 'undefined') {
                        quiz['id'] = quiz.quizId;
                        quizList.push(quiz);
                    }

                    self.onSubmitChoice(e, quiz.quizId, choices);

                    console.log('quizList', quizList);
                    self.setState({
                        'quiz': quizList,
                        'errors': [],
                    });

                    $('#editQuiz').modal('hide');
                })
                .catch(function (error) {
                    swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                    console.error("Error adding document: ", error);
                });
        } else {

            delete quiz.choices;

            db.collection(CollectionConfig.CHAPTER)
                .doc(this.state.chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(this.state.challengeId)
                .collection(CollectionConfig.QUIZ)
                .doc(quiz.quizId)
                .update(quiz)
                .then(function (docRef) {
                    swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                    self.onSubmitChoice(e, quiz.quizId, choices);

                    quiz.id = quiz.quizId;

                    let quizIndex = self.getQuizId(e, quiz);

                    let items =  self.state.quiz;
                    items[quizIndex] = quiz;

                    self.setState({
                        quiz: items
                    });

                    $('#editQuiz').modal('hide');
                })
                .catch(function (error) {
                    swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                    console.error("Error adding document: ", error);
                });

        }
    }

    onSubmitChoice(e, quizId, choices) {

        var oldChoices = this.state.oldChoices;
        for (var i= 0; i < oldChoices.length; i ++){
            if (typeof(oldChoices[i].id) === 'undefined') continue;

            db.collection(CollectionConfig.CHAPTER)
                .doc(this.state.chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(this.state.challengeId)
                .collection(CollectionConfig.QUIZ)
                .doc(quizId)
                .collection(CollectionConfig.CHOICE)
                .doc(oldChoices[i].id)
                .delete()
        }

        for (var i= 0; i < choices.length; i ++){
            if (typeof(choices[i].id) === 'undefined') continue;

            db.collection(CollectionConfig.CHAPTER)
                .doc(this.state.chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(this.state.challengeId)
                .collection(CollectionConfig.QUIZ)
                .doc(quizId)
                .collection(CollectionConfig.CHOICE)
                .doc(choices[i].id)
                .set(choices[i])
                .then(function (docRef) {
                })
                .catch(function (error) {
                });
        }

        return true;
    }

    renderQuiz(e, quiz) {
        var self = this;

        if ((typeof(quiz.quizId) === "undefined" || quiz.quizId == '')) {
            quiz.choices = [{choiceId: "", choice: "", isCorrect: false, score: ""}]
        } else {
            db.collection(CollectionConfig.CHAPTER)
                .doc(this.state.chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(this.state.challengeId)
                .collection(CollectionConfig.QUIZ)
                .doc(quiz.quizId)
                .collection(CollectionConfig.CHOICE)
                .get()
                .then((querySnapshot) => {
                    let choices = [];
                    querySnapshot.forEach((doc) => {
                        var item = {
                            id: doc.id,
                            choiceId: doc.id,
                            choice: doc.data().choice || "",
                            isCorrect: doc.data().isCorrect || false,
                            score:  doc.data().score || "",
                        };

                        choices.push(item);
                    });

                    quiz.choices = choices;
                    if (choices.length == 0) {
                        quiz.choices = [{}]
                    }

                    this.setState({
                        'oldChoices': choices,
                        'newQuiz': quiz,
                    })
                });
        }

        this.setState({
            'newQuiz': quiz,
            'newQuiz.id': quiz.id
        });

    }


    removeQuiz(e, quiz) {

        let self = this

        let chapterId = this.props.params.chapterId;
        let challengeId = this.props.params.challengeId;

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this quiz!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    db.collection(CollectionConfig.CHAPTER).doc(chapterId)
                        .collection(CollectionConfig.CHALLENGE).doc(challengeId)
                        .collection(CollectionConfig.QUIZ).doc(quiz.id)
                        .update({isDelete: true})
                        .then(function(docRef) {
                            swal("สำเร็จ", "ทำรายการสำเร็จ", "success");

                            quiz.isDelete = true

                            let quizIndex = self.getQuizId(e, quiz);

                            let items =  self.state.quiz;
                            items[quizIndex] = quiz;

                            self.setState({
                                quiz: items
                            });

                        })
                        .catch(function(error) {
                            swal("ไม่สำเร็จ", "พบข้อผิดพลาด", "error", error);
                        });
                }
            });


    }

    getQuizId(e, quiz) {
        let index = -1;
        this.state.quiz.forEach(function (item, i) {
            if (item.id === quiz.id) {
                index = i
            }
        });

        return index;
    }


    render() {
        if (this.state.user == null || typeof(this.state.user) === "undefined") {
            return  super.render()
        }


        var isCreated = !(typeof(this.state.newQuiz.id) === "undefined" || this.state.newQuiz.id == '');
        return (
            <div className="wrapper-cms">
                <Header user={this.state.user}/>
                <div className="container">
                    <div className="card mb-5">
                        <div className="card-body">
                            <ChallengeForm
                                isCreated={true}
                                newChallenge={this.state.newChallenge}
                                onSubmitChallenge={this.onSubmitChallenge.bind(this)}/>
                        </div>
                    </div>
                    {/* /.card */}
                    <div className="table-responsive">
                        <div className="d-flex justify-content-between align-items-center">
                            <h2 className="card-title text-primary ic-edit mb-0">Edit Quiz</h2>
                            <div className="">
                                <button type="submit" className="btn btn-green ml-3" data-toggle="modal" data-target="#editQuiz" onClick={(e)=> this.renderQuiz(e, {choices:[]})}>+ Add Quiz</button>
                            </div>
                        </div>

                        <table className="table table-hover">
                            <thead>
                                <tr>
                                <th scope="col">Quiz ID</th>
                                <th scope="col" className="w-75">Quiz Question</th>
                                <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.quiz.map((question, i) =>
                                    !question.isDelete?
                                    <tr>
                                        <th scope="row">{ question.quizId }</th>
                                        <td>{ question.quizQuestion }</td>
                                        <td className="text-center">
                                          <a href="#" className="btn btn-outline btn-sm" data-toggle="modal" data-target="#editQuiz" onClick={(e)=> this.renderQuiz(e, question)}>แก้ไข</a>
                                          <a href="#" className="btn btn-danger btn-sm ml-2" data-toggle="modal" data-target="#confirm-delete" onClick={(e) => this.removeQuiz(e, question)}>ลบ</a></td>
                                    </tr>: <tr></tr>)
                            }
                            </tbody>
                        </table>

                        <div className="modal fade" id="editQuiz">
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h2 className="card-title text-primary ic-edit mb-0">Quiz</h2>
                                    <button type="button" className="close" data-dismiss="modal">×</button>
                                </div>
                                <div className="modal-body">
                                     <QuizForm isCreated={isCreated}
                                               newQuiz={this.state.newQuiz}
                                               onSubmitQuiz={this.onSubmitQuiz.bind(this)} />
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

export default ChallengeDetail;
