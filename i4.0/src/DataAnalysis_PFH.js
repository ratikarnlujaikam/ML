import React, { useState, useEffect } from "react";
import { data1, model1, line1, machine1 } from "./api";
import Select from "react-select";
import Swal from "sweetalert2";

function App() {
  const [imageURL, setImageURL] = useState("");

  const [model, setModel] = useState(""); // New state for model selection
  const [modelOptions, setModelOptions] = useState([]);
  const [MC, setMC] = useState(""); // New state for model selection
  const [MCOptions, setMCOptions] = useState([]);

  const [line, setline] = useState(""); // New state for model selection
  const [lineOptions, setlineOptions] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false); // เพิ่ม state เพื่อติดตามสถานะการโหลด

  const formattedStartDate = startDate.replace("T", " ");
  const formattedEndDate = endDate.replace("T", " ");

  const handleSubmit = async () => {
    setIsLoading(true);
    setImageURL(null);
    try {
      // Clear old image URL if it exists
      if (imageURL) {
        URL.revokeObjectURL(imageURL);
      }
  
      // Validate input fields
      if (model === "") {
        await Swal.fire({
          icon: "warning",
          title: "Please select model",
          text: "Please select model before fetching data.",
        });
        return;
      }
      if (MC === "Select Machines no.") {
        await Swal.fire({
          icon: "warning",
          title: "Please select Machines No.",
          text: "Please select Machines No. before fetching data.",
        });
        return;
      }
      if (line === "") {
        await Swal.fire({
          icon: "warning",
          title: "Please select line",
          text: "Please select line before fetching data.",
        });
        return;
      }
  
      // Fetch data
      const url = await data1(
        model,
        line,
        MC,
        formattedStartDate,
        formattedEndDate
      );
  
      // Fetch the image
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImageURL(imageUrl);
      console.log("imageUrl", imageUrl);
      console.log("url", url);
    } catch (error) {
      console.error("Error:", error);
  
      // Show SweetAlert2 on error
      await Swal.fire({
        icon: "error",
        title: "No Run",
        text: "Please select a new parameter.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const handleDownloadImage = () => {
    if (imageURL) {
      const link = document.createElement("a");
      link.href = imageURL;
      link.download = "Data analysis.png";
      link.click();
    }
  };

  const model_option = async () => {
    try {
      const options = await model1(formattedStartDate,formattedEndDate); // เรียกใช้งาน API หรือฟังก์ชันเพื่อรับข้อมูล Model
      setModelOptions(options); // ตั้งค่า modelOptions ด้วยข้อมูลที่รับมา
     
      await line_option(options, formattedStartDate, formattedEndDate);
    } catch (error) {
      console.error("Error getting model options:", error);
    }
  };
  const line_option = async () => {
    try {

      setMCOptions([])
      setMC("")
      const options = await line1(model,formattedStartDate,formattedEndDate); // เรียกใช้งาน API หรือฟังก์ชันเพื่อรับข้อมูล Model
      console.log("options LINE",options);
      setlineOptions(options); // ตั้งค่า modelOptions ด้วยข้อมูลที่รับมา
      await MC_option(line, model, formattedStartDate, formattedEndDate);
    } catch (error) {
      console.error("Error getting model options:", error);
    }
  };
  const MC_option = async () => {
    try {
      const options = await machine1(line,model,formattedStartDate,formattedEndDate); // เรียกใช้งาน API หรือฟังก์ชันเพื่อรับข้อมูล Model
      console.log("options MC_option",options);
      setMCOptions(options); // ตั้งค่า modelOptions ด้วยข้อมูลที่รับมา
    } catch (error) {
      console.error("Error getting model options:", error);
    }
  };
  useEffect(() => {
    async function fetchData() {
      try {

        await model_option(startDate,endDate);

      } catch (error) {
        console.error("Error Get data:", error);
      }
    }

    fetchData();
  }, [model, line, formattedStartDate, formattedEndDate]);

  return (
    <div className="container" style={{ paddingTop: 10 }}>
      <div className="col-sm-12">
        <ol className="breadcrumb float-sm-right">
          <li className="breadcrumb-item">
            <a href="http://192.168.101.120:2027/Home">Home</a>
          </li>
          <li className="breadcrumb-item active">Data Analysis for Rotor to base</li>
        </ol>
      </div>
      <h1 className="text-center mt-4 mb-5">Data Analysis for Rotor to base</h1>

      <div className="card card-primary card-outline">
        <div className="card-header">
        <div className="form-group row">
            <label htmlFor="startDate" className="col-sm-2 col-form-label">
              Start Date:
            </label>
            <div className="col-sm-4">
              <input
                id="startDate"
                type="datetime-local"
                className="form-control"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="endDate" className="col-sm-2 col-form-label">
              End Date:
            </label>
            <div className="col-sm-4">
              <input
                id="endDate"
                type="datetime-local"
                className="form-control"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
          <div className="row">
            
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
                    setline("Select Line")
                    setlineOptions([])
              
                  }}
                  placeholder="Select Model"
                />
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="form-group">
                <label htmlFor="model" className="col-form-label">
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
                      : null // Set to null when there is no selected option
                  }
                  onChange={(selectedOption) => {
                    setline(selectedOption?.value || "");
                    setMC("Select Machines"); // Reset machine options when line changes
                    setMCOptions([]); // Reset machine options when line changes
                  }}
                  placeholder="Select Line"
                />
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="form-group">
                <label htmlFor="model" className="col-form-label">
                  Machines:
                </label>
                <Select
                  options={MCOptions.map((option) => ({
                    value: option.value,
                    label: option.text,
                  }))}
                  value={
                    line
                      ? {
                          value: MC,
                          label: MC,
                        }
                      : null // Set to null when there is no selected option
                  }
                  onChange={(selectedOption) => {
                    setMC(selectedOption?.value || "");
                  }}
                  placeholder="Select Machine no."
                />
              </div>
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
            {imageURL && (
    <div className="image-container text-center mt-5">
        <div className="image-frame">
            <img
                src={imageURL}
                alt="Tilt Plot"
                className="img-fluid large-image"
            />
        </div>
    </div>
)}
          </div>
        </div>
      </div>
     



    </div>
  );
}

export default App;
