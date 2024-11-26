import React, { Component } from "react";
import { server } from "../../constants";
import { httpClient } from "../../utils/HttpClient";
import moment from "moment";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      xAxis: [],
      yAxis: [],
      yAxis2: [],
      //filter
      startDate: moment().add("days", -30).format("yyyy-MM-DD"),
      finishDate: moment().format("yyyy-MM-DD"),
    };
  }

  doGetData = async () => {
    console.log(this.state.startDate);
    console.log(this.state.finishDate);
    let result = await httpClient.get(
      server.YIELD_URL +
        "/" +
        this.state.startDate +
        "&" +
        this.state.finishDate
    );
    console.log(result.data.result);
    let xAxis = [];
    let yAxis = [];
    let yAxis2 = [];

    for (let index = 0; index < result.data.result.length; index++) {
      const item = result.data.result[index];
      await xAxis.push(item.Date);
      await yAxis.push(item["%Yield"]);
      await yAxis2.push(90);
    }

    this.setState({ data: result.data.result, xAxis, yAxis, yAxis2 });
  };

  componentDidMount = async () => {
    console.log(this.state.startDate);
    console.log(this.state.finishDate);
    let result = await httpClient.get(
      server.YIELD_URL +
        "/" +
        this.state.startDate +
        "&" +
        this.state.finishDate
    );
    console.log(result.data.result);
    let xAxis = [];
    let yAxis = [];
    let yAxis2 = [];

    for (let index = 0; index < result.data.result.length; index++) {
      const item = result.data.result[index];
      await xAxis.push(item.Date);
      await yAxis.push(item["%Yield"]);
      await yAxis2.push(90);
    }

    this.setState({ data: result.data.result, xAxis, yAxis, yAxis2 });
  };

  renderTableRow = () => {
    return this.state.data.map((item) => (
      <tr>
        <td>{item.Date}</td>
        <td>{item["%Yield"]}</td>
      </tr>
    ));
  };

  render() {
    return (
      <div className="content-wrapper">
      <div className="content" style={{ paddingTop: 60 }}>
        <div className="row">
          <div className="border-full-bottom">
            <div className="D-3 M-12 D-right-9 M-left-0 no-gap">
              <div className="title-section title-inside"></div>
            </div>
          </div>
        </div>
        <h2>Engineer</h2>
    
        <div className="row">
          <div className="col-md-6">
            <div className="card card-primary card-outline" style={{ width: "100%", height: "100%" }}>
              <div className="card-header">
                <h3 className="card-title">
                  <h4>Master</h4>
                  <li className="breadcrumb-item">
                    <a href="MasterItemNO">Item No.Master</a>
                    <li className="breadcrumb-item">
                      <a href="MasterSupplier">Supplier data Master</a>
                      <li className="breadcrumb-item">
                        <a href="MasterLine">Line Master</a>
                      </li>
                    </li>
                  </li>
                </h3>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card card-primary card-outline" style={{ width: "100%", height: "100%" }}>
              <div className="card-header">
                <h3 className="card-title">
                  <h4>Monitoring</h4>
                  <li className="breadcrumb-item">
                    <a href="MasterItemNO">Item No.Master</a>
                    <li className="breadcrumb-item">
                      <a href="MasterSupplier">Supplier data Master</a>
                      <li className="breadcrumb-item">
                        <a href="MasterLine">Line Master</a>
                      </li>
                    </li>
                  </li>
                </h3>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    
    );
  }
}

export default Home;
