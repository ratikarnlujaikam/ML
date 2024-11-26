import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import MLJapan from "./MLJapan";
import ML from "./ML";
import Home from "./components/home/home";
import Header from "./components/header";

import SPC_DYNAMIC from "./SPC_DYNAMIC";
import SPC_hr from "./SPC_hr";
import DataAnalysis_PFH from "./DataAnalysis_PFH";
import DataAnalysis_aipress_line from "./DataAnalysis_aipress_line";
import ML_ewms from "./ML_ewms";


const App = () => {
  return (
    <Router>
      <Header />

      <Switch>
        <Route path="/MLJapan"><MLJapan /></Route>
        <Route path="/SPC_hr"><SPC_hr /></Route>
        <Route path="/ML"><ML /></Route>
        {/* <Route path="/SPC_DYNAMIC"><SPC_DYNAMIC /></Route> */}
        <Route path="/Boxes_plot_for_PFH"><DataAnalysis_PFH /></Route>
        <Route path="/PFH_by_line"><DataAnalysis_aipress_line /></Route>
        <Route path="/ML_ewms"><ML_ewms /></Route>
    
        <Route exact path="/"><Home /></Route>
        <Route><Home /></Route> {/* ใส่ Route ที่ไม่มี path เพื่อเป็นหน้า fallback */}
      </Switch>

    </Router>
  );
};

export default App;
