import React, { useState, useEffect } from "react";

import { getModelOptions_spc } from "./api";
import { getlineOptions_SPC } from "./api";
import { getParameterOptions_SPC } from "./api";
import { get_process } from "./api";
import { fetchSPC } from "./api";
import Select from "react-select";
import Swal from "sweetalert2";
import { format } from "date-fns"; // Import the format function

import Chart from "react-apexcharts";

function App() {
  const [imageURL, setImageURL] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false); // เพิ่ม state เพื่อติดตามสถานะการโหลด
  const [model, setModel] = useState(""); // New state for model selection
  const [line, setLine] = useState(""); // New state for line selection
  const [process, setprocess] = useState(""); // New state for line selection
  const [parameter, setparameter] = useState(null); // New state for line selection

  const [modelOptions, setModelOptions] = useState([]);
  const [lineOptions, setlineOptions] = useState([]);

  const [parameterOptions, setParameterOptions] = useState([]); // State for parameter options
  const [processOptions, setProcessOptions] = useState([]); // State for parameter options
  const [tableData, setTableData] = useState([]);
  const [data, setData] = useState(null);
  const [data_month, setData_month] = useState([]);
  const clearData = () => {
    setData(null);
    setData_month([]);
  };


  const handleSubmit = async () => {
    setIsLoading(true);
    try {

      clearData();

      if (!process) {
        await Swal.fire({
          icon: "warning",
          title: "Please select process Options",
          text: "Please select process Options before fetching data.",
        });
        return;
      } else if (parameter === null) {
        await Swal.fire({
          icon: "warning",
          title: "Please select parameter",
          text: "Please select parameter before fetching data.",
        });
        return;
      } else if (!model) {
        await Swal.fire({
          icon: "warning",
          title: "Please select Model",
          text: "Please select Model before fetching data.",
        });
        return;
      } else if (!line) {
        await Swal.fire({
          icon: "warning",
          title: "Please select Line",
          text: "Please select Line before fetching data.",
        });
        return;
      }

      // กระบวนการ fetch ข้อมูล
      const result = await fetchSPC(process, model, line, startDate, parameter);

      if (result.json_data.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Data",
          text: "The fetched data is empty.",
        });
      } else {
        setData(result.json_data);
        setData_month(result.json_data_month);
      }
    } catch (error) {
      console.error("Error:", error);

      // ตรวจสอบว่าข้อผิดพลาดที่เกิดขึ้นเป็น SyntaxError และเกิดจาก Unexpected token 'N'
      if (
        error instanceof SyntaxError &&
        error.message.includes("Unexpected token 'N'")
      ) {
        // ถ้าเป็นกรณีนี้ แสดง SweetAlert ด้วยข้อความ "No Spec UCL LCL"
        Swal.fire({
          icon: "error",
          title: "No Spec UCL LCL",
          text: "Error: SyntaxError - Unexpected token 'N'",
        });
      } else {
        // กรณีข้อผิดพลาดอื่น ๆ ที่ไม่ใช่ SyntaxError: Unexpected token 'N'
        // แสดง SweetAlert ด้วยข้อความ "Swit"
        Swal.fire({
          icon: "error",
          title: "Swit",
          text: "Error: " + error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const predefinedColors = ["#6666FF", "#55AA55", "#A040A0"];

  const getRandomColor = (index) => {
    return predefinedColors[index % predefinedColors.length];
  };

  const renderChart = () => {
    if (data) {
      const xAxisCategories = data.map((item) => item.Time);
      const uniqueMachines = [...new Set(data.map((item) => item.Machine))];
      const colors = Array.from({ length: uniqueMachines.length }, (_, index) =>
        getRandomColor(index)
      );

      const series = [
        {
          name: "USL",
          type: "line",
          data: data.map((item) => item.USL),
          color: "#C62828",
          lineWidth: 6, // Increase the line width as needed
          dashStyle: "Solid",
        },
        {
          name: "LSL",
          type: "line",
          data: data.map((item) => item.LSL),
          color: "#C62828",
          lineWidth: 4, // Increase the line width as needed
          dashStyle: "Solid",
        },
        {
          name: "CL",
          type: "line",
          data: data.map((item) => item.CL),
          color: "#78909C",
          lineWidth: 4, // Increase the line width as needed
          dashStyle: "Solid",
        },
        {
          name: "UCL",
          type: "line",
          data: data.map((item) => item.UCL),
          color: "#FF5722",
          lineWidth: 4, // Increase the line width as needed
          dashStyle: "Solid",
        },
        {
          name: "LCL",
          type: "line",
          data: data.map((item) => item.LCL),
          color: "#FF5722",
          lineWidth: 4, // Increase the line width as needed
          dashStyle: "Solid",
        },
        ...uniqueMachines.map((machine, index) => {
          const machineAVG = data
            .filter((item) => item.Machine === machine)
            .map((item) => item.AVG);

          return {
            name: machine,
            type: "line",
            data: machineAVG,

            color: colors[index % colors.length],
          };
        }),
      ];

      const SPC_chart = {
        series: series,

        options: {
          chart: {
            height: 350,
            type: "line",
            responsive: true,
          },
          title: {
            text: `AVG ${parameter}`,
            align: "center",
          },
          xaxis: {
            categories: xAxisCategories,
            title: {
              text: "Time",
            },
          },
          markers: {
            size: [0, 0, 0, 0, 0, 5, 5, 5, 6],
          },
          stroke: {
            width: [2, 2, 2, 2, 2, 4, 4, 4, 2],
            dashArray: [0, 0, 6, 6, 6, 0, 0, 0, 0],
          },
          yaxis: [
            {
              labels: {
                style: {
                  colors: "#ff0000",
                },
              },
              formatter: function (value) {
                return value.toFixed(4); // แสดงทศนิยม 4 ตำแหน่ง
              },
              title: {
                text: "-----",
                style: {
                  color: "#ff0000",
                },
              },
            },
          ],
          tooltip: {
            fixed: {
              enabled: true,
              position: "topLeft",
              offsetY: 30,
              offsetX: 60,
            },
            y: {
              formatter: function (value) {
                return value.toFixed(4); // แสดงทศนิยม 4 ตำแหน่ง
              }
            }
          },
          legend: {
            horizontalAlign: "center",
            offsetX: 40,
          },
          dataLabels: {
            style: {
              colors: ["green"],
            },
          },
          plotOptions: {
            line: {
              dashStyle: "shortdashdot", // Set the dashStyle for the line series
              marker: {
                enabled: false, // Disable markers for a cleaner appearance
              },
              lineWidth: 2, // You can adjust the line width as needed
              color: getRandomColor(),
            },
          },
        },
      };
      return SPC_chart;
    }
    return null;
  };
  const renderChart_STD = () => {
    if (data) {
      const xAxisCategories = data.map((item) => item.Time);
      const uniqueMachines = [...new Set(data.map((item) => item.Machine))];
      const colors = Array.from({ length: uniqueMachines.length }, (_, index) =>
        getRandomColor(index)
      );
      const series = [
        {
          name: "CL_STD",
          type: "line",
          data: data.map((item) => item.CL_STD),
          color: "#78909C",
          lineWidth: 4,
          dashStyle: "Solid",
        },

        {
          name: "UCL_STD",
          type: "line",
          data: data.map((item) => item.UCL_STD),
          color: "#FF5722",
          lineWidth: 4,
          dashStyle: "Solid",
        },
        {
          name: "LCL_STD",
          type: "line",
          data: data.map((item) => item.LCL_STD),
          color: "#FF5722",
          lineWidth: 4,
          dashStyle: "Solid",
        },
        ...uniqueMachines.map((machine, index) => {
          const machineSTD = data
            .filter((item) => item.Machine === machine)
            .map((item) => item.STD);

          return {
            name: `${machine}`,
            type: "line",
            data: machineSTD,
            color: colors[index % colors.length],
          };
        }),
      ];

      const SPC_chart = {
        series: series,

        options: {
          chart: {
            height: 350,
            type: "line",
            responsive: true,
          },
          title: {
            text: `STD ${parameter} `,
            align: "center",
          },
          xaxis: {
            categories: xAxisCategories,
            title: {
              text: "Time",
            },
          },
          markers: {
            size: [0, 0, 0, 5, 5, 5, 6],
          },
          stroke: {
            width: [2, 2, 2, 4, 4, 4, 2],
            dashArray: [6, 6, 6, 0, 0, 0, 0],
          },
          yaxis: [
            {
              labels: {
                style: {
                  colors: "#ff0000",
                },
              },
              title: {
                text: "-----",
                style: {
                  color: "#ff0000",
                },
              },
            },
          ],
          tooltip: {
            fixed: {
              enabled: true,
              position: "topLeft",
              offsetY: 30,
              offsetX: 60,
            },
          },
          legend: {
            horizontalAlign: "center",
            offsetX: 40,
          },
          dataLabels: {
            style: {
              colors: ["green"],
            },
          },
          plotOptions: {
            line: {
              dashStyle: "shortdashdot",
              marker: {
                enabled: false,
              },
              lineWidth: 2,
              color: getRandomColor(),
            },
          },
        },
      };
      return SPC_chart;
    }
    return null;
  };

  const renderChart_month = () => {
    if (data_month) {
      const xAxisCategories = data_month.map((item) => item.Date);
      const uniqueMachines = [
        ...new Set(data_month.map((item) => item.Machine)),
      ];
      const colors = Array.from({ length: uniqueMachines.length }, (_, index) =>
        getRandomColor(index)
      );
      const series = [
        {
          name: "USL",
          type: "line",
          data: data_month.map((item) => item.USL),
          color: "#C62828",
          lineWidth: 6, // Increase the line width as needed
          dashStyle: "Solid",
        },
        {
          name: "LSL",
          type: "line",
          data: data_month.map((item) => item.LSL),
          color: "#C62828",
          lineWidth: 4, // Increase the line width as needed
          dashStyle: "Solid",
        },
        {
          name: "CL",
          type: "line",
          data: data_month.map((item) => item.CL),
          color: "#78909C",
          lineWidth: 4, // Increase the line width as needed
          dashStyle: "Solid",
        },
        {
          name: "UCL",
          type: "line",
          data: data_month.map((item) => item.UCL),
          color: "#FF5722",
          lineWidth: 4, // Increase the line width as needed
          dashStyle: "Solid",
        },
        {
          name: "LCL",
          type: "line",
          data: data_month.map((item) => item.LCL),
          color: "#FF5722",
          lineWidth: 4, // Increase the line width as needed
          dashStyle: "Solid",
        },
        ...uniqueMachines.map((machine, index) => {
          const machineAVG = data_month
            .filter((item) => item.Machine === machine)
            .map((item) => item.AVG);

          return {
            name: machine,
            type: "line",
            data: machineAVG,
            color: colors[index % colors.length],
          };
        }),
      ];

      const SPC_chart = {
        series: series,

        options: {
          chart: {
            height: 350,
            type: "line",
            responsive: true,
          },
          title: {
            text: `AVG ${parameter}`,
            align: "center",
          },
          xaxis: {
            categories: xAxisCategories,
            title: {
              text: "Date",
            },
          },
          markers: {
            size: [0, 0, 0, 0, 0, 5, 5, 5, 6],
          },
          stroke: {
            width: [2, 2, 2, 2, 2, 4, 4, 4, 2],
            dashArray: [0, 0, 6, 6, 6, 0, 0, 0, 0],
          },
          yaxis: [
            {
              labels: {
                style: {
                  colors: "#ff0000",
                },
              },
              title: {
                text: "-----",
                style: {
                  color: "#ff0000",
                },
              },
            },
          ],
          tooltip: {
            fixed: {
              enabled: true,
              position: "topLeft",
              offsetY: 30,
              offsetX: 60,
            },
          },
          legend: {
            horizontalAlign: "center",
            offsetX: 40,
          },
          dataLabels: {
            style: {
              colors: ["green"],
            },
          },
          plotOptions: {
            line: {
              dashStyle: "shortdashdot", // Set the dashStyle for the line series
              marker: {
                enabled: false, // Disable markers for a cleaner appearance
              },
              lineWidth: 2, // You can adjust the line width as needed
              color: getRandomColor(),
            },
          },
        },
      };
      return SPC_chart;
    }
    return null;
  };
  const renderChart_STD_month = () => {
    if (data_month) {
      const xAxisCategories = data_month.map((item) => item.Date);
      const uniqueMachines = [
        ...new Set(data_month.map((item) => item.Machine)),
      ];
      const colors = Array.from({ length: uniqueMachines.length }, (_, index) =>
        getRandomColor(index)
      );
      const series = [
        {
          name: "CL_STD",
          type: "line",
          data: data_month.map((item) => item.CL_STD),
          color: "#78909C",
          lineWidth: 4,
          dashStyle: "Solid",
        },
        {
          name: "UCL_STD",
          type: "line",
          data: data_month.map((item) => item.UCL_STD),
          color: "#FF5722",
          lineWidth: 4,
          dashStyle: "Solid",
        },
        {
          name: "LCL_STD",
          type: "line",
          data: data_month.map((item) => item.LCL_STD),
          color: "#FF5722",
          lineWidth: 4,
          dashStyle: "Solid",
        },
        ...uniqueMachines.map((machine, index) => {
          const machineSTD = data_month
            .filter((item) => item.Machine === machine)
            .map((item) => item.STD);

          return {
            name: `${machine}`,
            type: "line",
            data: machineSTD,
            color: colors[index % colors.length],
          };
        }),
      ];

      const SPC_chart = {
        series: series,

        options: {
          chart: {
            height: 350,
            type: "line",
            responsive: true,
          },
          title: {
            text: `STD ${parameter}`,
            align: "center",
          },
          xaxis: {
            categories: xAxisCategories,
            title: {
              text: "Date",
            },
          },
          markers: {
            size: [0, 0, 0, 5, 5, 5, 6],
          },
          stroke: {
            width: [2, 2, 2, 4, 4, 4, 2],
            dashArray: [6, 6, 6, 0, 0, 0, 0],
          },
          yaxis: [
            {
              labels: {
                style: {
                  colors: "#ff0000",
                },
              },
              title: {
                text: "-----",
                style: {
                  color: "#ff0000",
                },
              },
            },
          ],
          tooltip: {
            fixed: {
              enabled: true,
              position: "topLeft",
              offsetY: 30,
              offsetX: 60,
            },
          },
          legend: {
            horizontalAlign: "center",
            offsetX: 40,
          },
          dataLabels: {
            style: {
              colors: ["green"],
            },
          },
          plotOptions: {
            line: {
              dashStyle: "shortdashdot",
              marker: {
                enabled: false,
              },
              lineWidth: 2,
            },
          },
        },
      };
      return SPC_chart;
    }
    return null;
  };

  const getRandomColor_month = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const fetchModelOptions = async (startDate) => {
    try {
      const options = await getModelOptions_spc(process, startDate);

      setModelOptions(options); // ตั้งค่า modelOptions ด้วยข้อมูลที่รับมา
    } catch (error) {
      console.error("Error fetching model options:", error);
    }
  };
  const fetchLineOptions = async (model) => {
    // Accept 'selectedModel' as a parameter
    try {
      const options = await getlineOptions_SPC(model, process, startDate); // Use 'selectedModel' in the API request
      setlineOptions(options);
    } catch (error) {
      console.error("Error fetching line options:", error);
    }
  };

  const getParameterOptions_SPC_SPC = async () => {
    try {
      const options = await getParameterOptions_SPC(process);
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
    const fetchData = async () => {
      try {
        await fetchModelOptions(startDate);
        await fetchProcessOptions();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    // เพิ่มขั้นตอนล้างค่า model ก่อนการเรียก fetchData()
    setLine(""); 
  
    fetchData();
    getParameterOptions_SPC_SPC();
    fetchLineOptions(model);
  }, [model, process, startDate]);
  
  
  
  console.log("model", model);
  console.log("process", process);
  console.log("parameter", parameter);
  console.log("startDate", startDate);
  return (
    <div
      className="container"
      style={{ border: "1px solid #ccc", borderRadius: "5px" }}
    >
      <div className="col-sm-12">
        <ol className="breadcrumb float-sm-right">
          <li className="breadcrumb-item">
            <a href="http://10.120.122.28:2017/Home">Home</a>
          </li>
        </ol>
      </div>

      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="form-group">
            <label htmlFor="model" className="col-form-label">
              Process:
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
                  : null
              }
              onChange={(selectedOption) => {
                setprocess(selectedOption?.value || "");
                setparameter(null); // Reset parameter when process changes
                setModel("");
                setLine("");
                clearData(); // Clear data when process changes
              }}
              placeholder="Select process"
            />
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="form-group">
            <label htmlFor="parameter" className="col-form-label">
              Parameter:
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
                clearData(); // Clear data when parameter changes
              }}
            />
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group row">
            <label htmlFor="startDate" className="col-sm-6 col-form-label">
              Select Date
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
                setLine("");
                clearData();
                
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
                // เช็คว่ามีค่า model หรือไม่ และมีค่าที่ถูกเลือกใน dropdown หรือไม่
                if (model && selectedOption) {
                  setLine(selectedOption.value);
                }
              }}
              placeholder={model ? "Select Line" : "Select Model first"}
            />
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Submit"}
          </button>
        </div>
      </div>

      <div>
        <div>
          <div className="row">
            <div
              className="col-6 mb-1"
              style={{
                height: 500,
                zIndex: "3",
                position: "relative",
                zIndex: "0",
              }}
            >
              {" "}
              {/* เพิ่ม margin-bottom ที่นี่ */}
              {data && data.length > 0 ? (
                <div style={{ border: "1px solid green", padding: "10px" }}>
                  <label>X bar Chart</label>
                  {console.log("Chart Data:", renderChart().series)}
                  <Chart
                    options={renderChart().options}
                    series={renderChart().series}
                    type="line"
                    height={400}
                  />
                </div>
              ) : (
                <div style={{ border: "1px solid red", padding: "10px" }}>
                  No Data hour
                </div>
              )}
            </div>
            <div className="col-6 mb-1">
              {" "}
              {/* เพิ่ม margin-bottom ที่นี่ */}
              {data && data.length > 0 ? (
                <div style={{ border: "1px solid green", padding: "10px" }}>
                  <label>Xbar S Chart</label>
                  {console.log("Chart STD Data:", renderChart_STD().series)}
                  <Chart
                    options={renderChart_STD().options}
                    series={renderChart_STD().series}
                    type="line"
                    height={400}
                  />
                </div>
              ) : (
                <div style={{ border: "1px solid red", padding: "10px" }}>
                  No Data hour
                </div>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-6 mb-4">
              {" "}
              {/* เพิ่ม margin-bottom ที่นี่ */}
              {data_month && data_month.length > 0 ? (
                <div style={{ border: "1px solid green", padding: "10px" }}>
                  {console.log("Chart Month Data:", renderChart_month().series)}
                  <label>X bar Chart</label>
                  <Chart
                    options={renderChart_month().options}
                    series={renderChart_month().series}
                    type="line"
                    height={400}
                  />
                </div>
              ) : (
                <div style={{ border: "1px solid red", padding: "10px" }}>
                  No Data daily
                </div>
              )}
            </div>
            <div className="col-6 mb-4">
              {data_month && data_month.length > 0 ? (
                <div style={{ border: "1px solid green", padding: "10px" }}>
                  <label>Xbar S Chart</label>

                  {console.log(
                    "Chart STD Month Data:",
                    renderChart_STD_month().series
                  )}
                  <Chart
                    options={renderChart_STD_month().options}
                    series={renderChart_STD_month().series}
                    type="line"
                    height={400}
                  />
                </div>
              ) : (
                <div style={{ border: "1px solid red", padding: "10px" }}>
                  No Data daily
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
