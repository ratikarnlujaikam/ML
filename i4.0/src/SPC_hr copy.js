import React, { useState, useEffect } from "react";

import { getModelOptions } from "./api";
import { getlineOptions } from "./api";
import { getParameterOptions_SPC } from "./api";
import { get_process } from "./api";
import { fetchSPC } from "./api";
import Select from "react-select";

function App() {
  const [imageURL, setImageURL] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false); // เพิ่ม state เพื่อติดตามสถานะการโหลด
  const [model, setModel] = useState(""); // New state for model selection
  const [line, setLine] = useState(""); // New state for line selection
  const [process, setprocess] = useState(""); // New state for line selection
  const [parameter, setparameter] = useState(""); // New state for line selection
 
  const [modelOptions, setModelOptions] = useState([]);
  const [lineOptions, setlineOptions] = useState([]);

  const [parameterOptions, setParameterOptions] = useState([]); // State for parameter options
  const [processOptions, setProcessOptions] = useState([]); // State for parameter options


  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const url = await fetchSPC(
        process,model,line,startDate,parameter);

        
      const response = await fetch(url);
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImageURL(imageUrl);
      console.log("imageUrl",imageUrl);
      console.log("url",url);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleDownloadImage = () => {
    if (imageURL) {
      const link = document.createElement("a");
      link.href = imageURL;
      link.download = "Xbar_SPC.png";
      link.click();
    }
  };

  const fetchModelOptions = async () => {
    try {
      const options = await getModelOptions(); // เรียกใช้งาน API หรือฟังก์ชันเพื่อรับข้อมูล Model
      setModelOptions(options); // ตั้งค่า modelOptions ด้วยข้อมูลที่รับมา
    } catch (error) {
      console.error("Error fetching model options:", error);
    }
  };
  const fetchLineOptions = async (model) => {
    // Accept 'selectedModel' as a parameter
    try {
      const options = await getlineOptions(model); // Use 'selectedModel' in the API request
      setlineOptions(options);
    } catch (error) {
      console.error("Error fetching line options:", error);
    }
  };

  const getParameterOptions_SPC_SPC = async () => {
    try {
      const options = await getParameterOptions_SPC(process); // Replace with your API call
      setParameterOptions(options);
    } catch (error) {
      console.error("Error fetching parameter options:", error);
    }
  };
  const fetchProcessOptions = async () => {
    try {
      const options = await get_process(); // Replace with your API call
      setProcessOptions(options);
    } catch (error) {
      console.error("Error fetching parameter options:", error);
    }
  };
  useEffect(() => {
    async function fetchData() {
      try {
       
        const selectedModel = await fetchModelOptions();
        console.log("Selected Model:", selectedModel);
        await fetchLineOptions(model); // Pass the selected model to fetchLineOptions
        await getParameterOptions_SPC_SPC(process); // Fetch parameter options independently
         await fetchProcessOptions(); // Fetch parameter options independently
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }



    fetchData();
  }, [model]);

  return (
    <div className="container" style={{ paddingTop: 80 }}>
      <div className="col-sm-12">
        <ol className="breadcrumb float-sm-right">
          <li className="breadcrumb-item">
            <a href="http://10.120.122.10:2013/Home">Home</a>
          </li>
        
        </ol>
      </div>
      <div className="col-md-3 mb-3">
        <div className="form-group">
          <label htmlFor="model" className="col-form-label">
            process:
          </label>
          <Select
            options={processOptions.map((option) => ({
              value: option.value,
              label: option.text,
            }))}
            value={
              process
                ? {
                    value: process,
                    label: process,
                  }
                : null // Set to null when there is no selected option
            }
            onChange={(selectedOption) => {
              setprocess(selectedOption?.value || "");
            }}
            placeholder="Select process"
          />
        </div>
      </div>
      <div className="col-md-4">
      <div className="form-group row">
        <label htmlFor="startDate" className="col-sm-4 col-form-label">
          Start Date
        </label>
        <div className="col-sm-9">
          <input
            id="startDate"
            type="date"
            className="form-control"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
      </div>
      </div>
      <div className="col-md-3 mb-3">
        <div className="form-group">
          <label htmlFor="model" className="col-form-label">
            Model:
          </label>
          <Select
            options={modelOptions.map((option) => ({
              value: option.value,
              label: option.text,
            }))}
            value={
              model
                ? {
                    value: model,
                    label: model,
                  }
                : null // Set to null when there is no selected option
            }
            onChange={(selectedOption) => {
              setModel(selectedOption?.value || "");
            }}
            placeholder="Select Model"
          />
        </div>
      </div>
      <div className="col-md-3 mb-3">
        <div className="form-group">
          <label htmlFor="line" className="col-form-label">
            Line:
          </label>
          <Select
            options={lineOptions.map((option) => ({
              value: option.value,
              label: option.text,
            }))}
            value={
              model
                ? {
                    value: line,
                    label: line,
                  }
                : null
            }
            onChange={(selectedOption) => {
              setLine(selectedOption ? selectedOption.value : ""); // Update the state only when a valid option is selected
            }}
            placeholder={model ? "Select Line" : "Select Model first"} // Conditional placeholder
          />
        </div>
      </div>
      <div className="col-md-3 mb-3">
        <div className="form-group">
          <label htmlFor="parameter" className="col-form-label">
          parameter:
          </label>
          <Select
            options={parameterOptions.map((option) => ({
              value: option.value,
              label: option.text,
            }))}
            value={
              parameter
                ? {
                    value: parameter,
                    label: parameter,
                  }
                : null
            }
            onChange={(selectedOption) => {
              setparameter(selectedOption ? selectedOption.value : ""); // Update the state only when a valid option is selected
            }}
          
          />
        </div>
      </div>
     

      <div className="text-center">
        <div className="col-sm-7">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit
          </button>
          {isLoading ? (
            <span className="ml-2">Loading...</span> // แสดงข้อความ "กำลังโหลด" เมื่อ isLoading เป็น true
          ) : (
            imageURL && (
              <button
                className="btn btn-success ml-2"
                onClick={handleDownloadImage}
              >
                Download Image
              </button>
            )
          )}
        </div>
      </div>
      {imageURL && (
        <div className="image-container text-center mt-5">
          <img
            src={imageURL}
            alt="Tilt Plot"
            className="img-fluid"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
