import React from "react";


import {Bar, Doughnut} from 'react-chartjs-2';
import BeatLoader from 'react-spinners/BeatLoader';

class ScoreDoughnutChart extends React.Component {
    constructor(props) {
        super(props);

        const data = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#71C285',
                    '#EEEEEE',
                ],
                hoverBackgroundColor: [
                    '#71C285',
                    '#EEEEEE',
                ]
            }]
        };

        const legendOpts = {
            display: false
        };

        const options = {
            responsive: true,
            tooltips: {
                enabled: false,
            }
        };

        this.state = {
            data: data,
            legend: legendOpts,
            options: options,
            scoreAvg: 0,
            isLoading: true,
            isShow: false
        }
    }

    componentDidUpdate() {
        if (typeof(this.props.data.labels) == 'undefined'
            || this.props.data.labels.length == 0
            || this.state.isUpdate) {

            if (this.props.data.labels.length == 0 && this.state.isLoading) {
                this.setState({
                    isLoading: false,
                });
            }
            return;
        }


        console.log('data', this.props.data.data)
        var newData = [];
        newData[0] = this.props.data.data[0];
        newData[1] = 100 - newData[0];

        var data =  {
            labels: ['score', ''],
            datasets: [{
                data: newData,
                backgroundColor: [
                    '#71C285',
                    '#EEEEEE',
                ],
                hoverBackgroundColor: [
                    '#71C285',
                    '#EEEEEE',
                ]
            }]
        };


        this.setState({
            data: data,
            isUpdate: true,
            scoreAvg: newData[0],
            isLoading: false,
            isShow: this.props.data.data.length > 0
        });

    }

    render() {
        return (
            <div className=" align-items-center">
                <div className=" align-items-center">
                    {
                        this.state.isLoading ?
                            <div className="text-center" style={{'margin': '150px'}}>
                                <BeatLoader
                                    sizeUnit={"px"}
                                    size={30}
                                    color={'#6c6c6d'}
                                    loading={this.state.loading}
                                />
                            </div> : <div>{this.state.isShow ?       <div className="percent-center">
                                <Doughnut data={this.state.data} legend={this.state.legend} options={this.state.options}/>
                                <div className="percent-center-detail text-success">
                                    <h2>{this.state.scoreAvg.toFixed(1)}%</h2>
                                    <strong className="text-bold">Average</strong>
                                </div>
                                
                                <div className="_remark mt-3">โดยเฉลี่ย นักเรียนมีผลการเรียนอยู่ที่ระดับ {this.state.scoreAvg.toFixed(1)}%</div>
                            </div> :<div>ยังไม่มีข้อมูล</div>}</div>
                    }
                </div>

            </div>
        );
    }
}

export default ScoreDoughnutChart;