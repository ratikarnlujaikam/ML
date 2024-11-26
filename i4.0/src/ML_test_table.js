import React, { useState, useEffect } from "react";
import { PythonAPI } from "./api";
import { pairplot } from "./api"; // Adjust the path accordingly
import { summary_describe } from "./api";
import { Parameter } from "./api";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css"; // นำเข้า CSS ของ Bootstrap
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { getModelOptions } from "./api";
import { getlineOptions } from "./api";
import { getParameterOptions } from "./api";
import { BinKPOV_Auto } from "./api";
import { BIN_KPOV } from "./api";
import { BIN_KPIV } from "./api";
import { api_data_bin } from "./api";
import ReactApexChart from "react-apexcharts";
import Swal from "sweetalert2";
import CheckboxGroup from "react-checkbox-group";

function App() {
  const [imageURL, setImageURL] = useState("");
  const [start, setstart] = useState("");
  const [end, setend] = useState("");
  const [model, setModel] = useState(""); // New state for model selection
  const [line, setLine] = useState(""); // New state for line selection
  const [pythonApiImageURL, setPythonApiImageURL] = useState("");
  const [pairplotImageURL, setPairplotImageURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selecteKPIV, setselecteKPIV] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [modelOptions, setModelOptions] = useState([]);
  const [lineOptions, setlineOptions] = useState([]);
  const [parameterOptions, setParameterOptions] = useState([]); // State for parameter options
  const [selecteKPOV, setSelecteKPOV] = useState("");
  const [selectAll, setSelectAll] = useState(false); // เก็บสถานะการเลือกทั้งหมด
  const [showDescriptions, setShowDescriptions] = useState({
    Parameter: false,
    Count: false,
    Mean: false,
    Std: false,
    Min: false,
    "25%": false,
    "50%": false,
    "75%": false,
    Max: false,
  });
  const [minKPOV, setMinKPOV] = useState("");
  const [maxKPOV, setMaxKPOV] = useState("");
  // const [support, setsupport] = useState(""); // ตั้งค่าเริ่มต้นเป็นว่าง
  // const [confidence, setConfidence] = useState(""); // ตั้งค่าเริ่มต้นเป็นว่าง
  const [countResult, setCountResult] = useState({});
  const [countBeforeSMOTE, setCountBeforeSMOTE] = useState(null);
  const [countAfterSMOTE, setCountAfterSMOTE] = useState(null);
  const [classification, setclassification] = useState(null);
  const [json_data_cba, setjson_data_cba] = useState(null);

  const [tableData, setTableData] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const [passChartData, setPassChartData] = useState(/* initial data */);
  const [failChartData, setFailChartData] = useState(/* initial data */);

  const [supportValue, setSupportValue] = useState(""); // สร้าง state สำหรับ supportValue และใช้ setSupportValue ในการเปลี่ยนค่า
  const [confidenceValue, setConfidenceValue] = useState(""); // สร้าง state สำหรับ confidenceValue และใช้ setConfidenceValue ในการเปลี่ยนค่า
  const [passChartSupData, setPassChartSupData] = useState(null);
  const [failChartSupData, setFailChartSupData] = useState(null);
  const [passChartIndexData, setPassChartIndexData] = useState(null);
  const [failChartIndexData, setFailChartIndexData] = useState(null);

  const [passChartSup_conf, setPassChartSup_conf] = useState(null);
  const [failChartSup_conf, setFailChartSup_conf] = useState(null);

  const [tableData_KPOV, setTableData_KPOV] = useState([]); // State to store the table data

  const [selectedKPIV, setSelectedKPIV] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [chartData, setChartData] = useState({
    series: [
      {
        name: "selecteKPIV",
        type: "scatter",
        data: [], // Put your data here
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
        toolbar: {
          show: false,
        },
      },
      // Define your chart options here
      // ...
    },
  });

  // Function to update chart data
  // Function to update chart data with multiple series
  const updateChartData = (data, xAxis) => {
    if (!data || !xAxis || data.length !== xAxis.length) {
      console.error("Invalid data or xAxis provided.");
      return; // Don't proceed with updating the chart
    }

    // Create an array to hold multiple series
    const series = selecteKPIV.map((kpiv, index) => {
      return {
        name: kpiv,
        type: "scatter",
        data: data.map((item, dataIndex) => {
          // Check if the selected KPIV property exists and handle null/undefined values
          if (item && item[index] !== null && item[index] !== undefined) {
            return { x: xAxis[dataIndex], y: item[index] };
          } else {
            return { x: xAxis[dataIndex], y: null }; // Modify this based on your requirements
          }
        }),
      };
    });

    // Update the chart data with multiple series
    setChartData({
      series,
      options: {
        chart: {
          height: 350,
          type: "scatter",
          toolbar: {
            show: false,
          },
        },
        // Define your chart options here
        // ...
      },
    });
  };

  const handleRadioChange = (e) => {
    setShowInput(e.target.value === "yes");
  };

  const toggleDescription = (columnName) => {
    setShowDescriptions((prevShowDescriptions) => ({
      ...prevShowDescriptions,
      [columnName]: !prevShowDescriptions[columnName],
    }));
  };

  const loadData = () => {
    // สำหรับตัวอย่างนี้เราจะใช้ข้อมูลจำลองแทน
    const mockData = [
      // ข้อมูลตาราง
    ];
    setTableData(mockData);
    setShowTable(true); // แสดงตาราง
  };

  useEffect(() => {
    const socket = new WebSocket("ws://your-backend-url"); // Replace with your actual WebSocket URL

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const progressData = JSON.parse(event.data);
      setProgressPercentage(progressData.percentage);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleFormSubmit = () => {
    // ตั้งค่าทุก State ให้เป็นค่าว่างเมื่อคลิก "Submit"

    setMinKPOV("");
    setMaxKPOV("");
    setCountResult({});
    setCountBeforeSMOTE(null);
    setCountAfterSMOTE(null);
    setclassification(null);
    setjson_data_cba(null);
    setTableData([]);
    setProgressPercentage(0);
    setShowTable(false);
    // setShowInput(false);
    setPassChartData(/* initial data */);
    setFailChartData(/* initial data */);
    setSupportValue("");
    setConfidenceValue("");
    setPassChartSupData(null);
    setFailChartSupData(null);
    setPassChartIndexData(null);
    setFailChartIndexData(null);
    setPassChartSup_conf(null);
    setFailChartSup_conf(null);
    setSummaryData(null);
  };

  const handleRadioChange_KPOV = async (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === "yes") {
      setIsReadOnly(true);
      try {
        const response = await BinKPOV_Auto(model, selecteKPOV);
        // Handle the response and set it to the state to display in a table
        console.log("response_KPOV", response);
        if (response.length > 0) {
          // Assuming response is an array of data, use the first item in the array
          const firstItem = response[0];
          setMinKPOV(firstItem.MinKPOV);
          setMaxKPOV(firstItem.MaxKPOV);
          setTableData_KPOV(response);
        } else {
          // If response is an empty array, show "No spec"
          setMinKPOV("No spec");
          setMaxKPOV("No spec");
          setTableData_KPOV([]);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No Spec. Please contact the administrator.",
            showConfirmButton: true,
          });
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      setMinKPOV(""); // Clear the input fields when the "no" radio button is selected
      setMaxKPOV("");
      setTableData_KPOV([]); // Clear the table data when the "no" radio button is selected
      setIsReadOnly(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    // Check if any of the parameters are empty
    if (!model || !line || !start || !end || !selecteKPOV || !selecteKPIV) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill in all the required parameters.",
        showConfirmButton: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      const pythonApiUrl = await PythonAPI(
        model,
        line,
        start,
        end,
        selecteKPOV,
        selecteKPIV
      );
      const pairplotUrl = await pairplot(
        model,
        line,
        start,
        end,
        selecteKPOV,
        selecteKPIV
      );

      const summaryData = await summary_describe(
        model,
        line,
        start,
        end,
        selecteKPOV,
        selecteKPIV
      );

      // Handle form submission
      handleFormSubmit();

      const updateProgress = (progress) => {
        setProgressPercentage(progress);
      };

      // เริ่มแถบความคืบหน้าที่ค่าเริ่มต้น 0%
      setProgressPercentage(0);

      // ร้องขอ API และรอรับ JSON data
      const pythonApiResponse = await fetch(pythonApiUrl);
      const pairplotResponse = await fetch(pairplotUrl);

      // ดึงข้อมูลรูปภาพ
      const pythonApiBlob = await pythonApiResponse.blob();
      const pairplotBlob = await pairplotResponse.blob();

      const pythonApiImageUrl = URL.createObjectURL(pythonApiBlob);
      const pairplotImageUrl = URL.createObjectURL(pairplotBlob);
      setSummaryData(summaryData);
      setPythonApiImageURL(pythonApiImageUrl);
      setPairplotImageURL(pairplotImageUrl);
      console.log("summaryData", summaryData);
      console.log("pythonApiImageUrl", pythonApiImageUrl);
      console.log("pairplotImageUrl", pairplotImageUrl);

      // อัปเดตความคืบหน้าเมื่อได้รับรูปภาพ
      updateProgress(25); // เช่น 25% เมื่อได้รับรูปภาพ

      // รอสำหรับการประมวลผลหรือการดึงข้อมูลเพิ่มเติมจาก backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 วินาที

      // อัปเดตความคืบหน้าเมื่อ backend เสร็จแล้วเป็น 50%
      updateProgress(50); // เช่น 50% เมื่อ backend เสร็จแล้ว

      // รอสำหรับการประมวลผลเพิ่มเติมหรือการดึงข้อมูลเพิ่มเติมจาก backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 วินาที

      // อัปเดตความคืบหน้าเมื่อ backend เสร็จแล้วเป็น 75%
      updateProgress(75); // เช่น 75% เมื่อ backend เสร็จแล้ว

      // รอสำหรับการประมวลผลเพิ่มเติมหรือการดึงข้อมูลเพิ่มเติมจาก backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 วินาที

      // อัปเดตความคืบหน้าเป็น 100% เมื่อได้รับข้อมูลทั้งหมด
      updateProgress(100);
      if (!summaryData) {
        console.error("Error: No data");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Prodution No Run",
          showConfirmButton: true,
        });
        setIsLoading(false);
        return;
      }
      //... (remaining code)
    } catch (error) {
      console.error("Error:", error);

      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No Data",
        showConfirmButton: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const SubmitButton_KPIV = async () => {
    setIsLoading(true);

    try {
      const result_KPIV = await BIN_KPIV(
        model,
        line,
        start,
        end,
        selecteKPOV,
        selecteKPIV,
        minKPOV,
        maxKPOV,
        supportValue,
        confidenceValue
      );

      const classification = JSON.parse(
        result_KPIV.classification_results_json
      );

      const json_data_cba = Array.isArray(result_KPIV.json_data)
        ? result_KPIV.json_data
        : [];

      setclassification(classification);
      setjson_data_cba(json_data_cba);
      console.log("json_data_cba", json_data_cba);

      const selecteKPIVFromJson = [];
      const selecteKPOVFromJson = [];

      const xAxis = Array.from(
        { length: json_data_cba.length },
        (_, index) => index
      );

      // Now, you can use the 'xAxis' array for the X-axis values in your chart data.

      selecteKPIV.forEach((kpiv) => {
        const dataForKPIV = json_data_cba.map((item) => {
          if (item && item.hasOwnProperty(kpiv) && item[kpiv] !== null) {
            return item[kpiv];
          } else {
            return null;
          }
        });

        selecteKPIVFromJson.push(dataForKPIV);
      });

      const selectesup = "sup"; // เปลี่ยนเป็น string ของคอลัมน์ที่คุณต้องการ
      const selecteKPOVArray = [selectesup];

      selecteKPOVArray.forEach((kpov) => {
        const dataForKPOV = json_data_cba.map((item) => {
          if (item && item.hasOwnProperty(kpov) && item[kpov] !== null) {
            return item[kpov];
          } else {
            return null;
          }
        });
        selecteKPOVFromJson.push(dataForKPOV);
        // ทำสิ่งที่คุณต้องการกับ dataForKPOV
      });

      // ... (previous code)

      const passDataSup = selecteKPOVArray.map((selectesup, kpivIndex) => {
        const seriesData = [];

        json_data_cba.forEach((item, index) => {
          const KPOVValue = item[selecteKPOV].toLowerCase(); // Use selecteKPOV here

          if (KPOVValue === "pass") {
            seriesData.push({
              x: index + 1, // X-axis is the index
              y: item.sup, // Y-axis is 'sup' column value
            });
          } else {
            seriesData.push({
              x: index + 1, // X-axis is the index
              y: null,
            });
          }
        });

        return {
          name: "sup",
          type: "bar",
          data: seriesData,
        };
      });
      const passDataconf = selecteKPOVArray.map((selectesup, kpivIndex) => {
        const seriesData = [];

        json_data_cba.forEach((item, index) => {
          const KPOVValue = item[selecteKPOV].toLowerCase(); // Use selecteKPOV here

          if (KPOVValue === "pass") {
            seriesData.push({
              x: index + 1, // X-axis is the index
              y: item.conf, // Y-axis is 'sup' column value
            });
          } else {
            seriesData.push({
              x: index + 1, // X-axis is the index
              y: null,
            });
          }
        });

        return {
          name: "conf",
          type: "bar",
          data: seriesData,
        };
      });

      const xAxisCategories = Array.from(
        { length: passDataSup[0].data.length },
        (_, i) => (i + 1).toString()
      );
      console.log("xAxisCategories", xAxisCategories);

      const passChartSup = {
        series: [
          {
            name: "Support_pass",
            type: "column",
            data: passDataSup[0].data,
            color: "#009900", // Set the color for the "Support_pass" series
          },
          {
            name: "Confidence_pass",
            type: "column",
            data: passDataconf[0].data,
            color: "#00e673", // Set the color for the "Confidence_pass" series
          },
        ],
        options: {
          chart: {
            height: 400,
            type: "column", // Use "bar" for a bar chart
            responsive: true,
          },
          title: {
            text: selecteKPOV + " Pass",
            align: "center",
          },
          xaxis: {
            categories: xAxisCategories,
            title: {
              text: "Rule",
            },
          },
          yaxis: [
            {
              min: 0,
              max: 0.3,
              labels: {
                style: {
                  colors: "#009900",
                },
              },
              title: {
                text: "Support",
                style: {
                  color: "#009900",
                },
              },
            },
            {
              min: 0,
              max: 1.0,
              opposite: true,
              labels: {
                style: {
                  colors: "#00e673",
                },
              },
              title: {
                text: "Confidence",
                style: {
                  color: "#00e673",
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
        },
      };

      const failDataSup = selecteKPOVArray.map((selectesup, kpivIndex) => {
        const seriesData = [];

        json_data_cba.forEach((item, index) => {
          const KPOVValue = item[selecteKPOV].toLowerCase(); // Use selecteKPOV here

          if (KPOVValue === "fail") {
            seriesData.push({
              x: index + 1, // X-axis is the index
              y: item.sup, // Y-axis is 'sup' column value
            });
          } else {
            seriesData.push({
              x: index + 1, // X-axis is the index
              y: null,
            });
          }
        });

        return {
          name: "sup",
          type: "bar",
          data: seriesData,
        };
      });

      const failDataconf = selecteKPOVArray.map((selectesup, kpivIndex) => {
        const seriesData = [];

        json_data_cba.forEach((item, index) => {
          const KPOVValue = item[selecteKPOV].toLowerCase(); // Use selecteKPOV here

          if (KPOVValue === "fail") {
            seriesData.push({
              x: index + 1, // X-axis is the index
              y: item.conf, // Y-axis is 'sup' column value
            });
          } else {
            seriesData.push({
              x: index + 1, // X-axis is the index
              y: null,
            });
          }
        });

        return {
          name: "conf",
          type: "bar",
          data: seriesData,
        };
      });
      console.log("failDatacof", failDataconf);

      const failChartSup = {
        series: [
          {
            name: "Support_pass",
            type: "column",
            data: failDataSup[0].data,
            color: "#ff0000", // Set the color for the "Support_pass" series
          },
          {
            name: "Confidence_pass",
            type: "column",
            data: failDataconf[0].data,
            color: "#ff6600", // Set the color for the "Confidence_pass" series
          },
        ],
        options: {
          chart: {
            height: 400,
            type: "column", // Use "bar" for a bar chart
            responsive: true,
          },
          title: {
            text: selecteKPOV + "Fail",
            align: "center",
          },
          xaxis: {
            categories: xAxisCategories,
            title: {
              text: "Rule",
            },
          },
          yaxis: [
            {
              min: 0,
              max: 0.3,
              labels: {
                style: {
                  colors: "#ff0000",
                },
              },
              title: {
                text: "Support",
                style: {
                  color: "#ff0000",
                },
              },
            },
            {
              min: 0,
              max: 1.0,
              opposite: true,
              labels: {
                style: {
                  colors: "#ff6600",
                },
              },
              title: {
                text: "Confidence",
                style: {
                  color: "#ff6600",
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
        },
      };

      console.log("tableData", tableData);

      const passDataIndex = selecteKPIV.map((kpiv, kpivIndex) => {
        const seriesData = [];

        json_data_cba.forEach((item, index) => {
          const KPOVValue = item[selecteKPOV].toLowerCase(); // Use selecteKPOV here

          if (
            KPOVValue === "pass" &&
            selecteKPIVFromJson[kpivIndex][index] !== null
          ) {
            seriesData.push({
              y: index + 1,
              x: selecteKPIVFromJson[kpivIndex][index],
            });
          } else {
            seriesData.push({
              y: index + 1,
              x: null,
            });
          }
        });

        return {
          name: kpiv,
          type: "scatter",
          data: seriesData,
        };
      });

      console.log("selecteKPIVFromJson[kpivIndex][index]", selecteKPIVFromJson);

      const failDataIndex = selecteKPIV.map((kpiv, kpivIndex) => {
        const seriesData = [];

        json_data_cba.forEach((item, index) => {
          const KPOVValue = item[selecteKPOV].toLowerCase(); // Use selecteKPOV here

          if (
            KPOVValue === "fail" &&
            selecteKPIVFromJson[kpivIndex][index] !== null
          ) {
            seriesData.push({
              y: index + 1,
              x: selecteKPIVFromJson[kpivIndex][index],
            });
          } else {
            seriesData.push({
              y: index + 1,
              x: null,
            });
          }
        });

        return {
          name: kpiv,
          type: "scatter",
          data: seriesData,
        };
      });

      const passChartIndex = {
        series: passDataIndex,
        options: {
          chart: {
            height: 350,
            type: "line",
            toolbar: {
              show: false,
            },
          },

          xaxis: {
            lines: {
              show: false,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
          title: {
            text: selecteKPOV + "Pass",
            align: "Conter",
          },
          xaxis: {
            lines: {
              show: true,
            },
          },

          yaxis: [
            {
              min: -4,
              max: 4,
              axisTicks: {
                show: true,
              },
              axisBorder: {
                show: true,
                color: "#009900",
              },
              labels: {
                style: {
                  colors: "#009900",
                },
              },

              title: {
                text: "Bin",
                style: {
                  color: "#009900",
                },
              },
            },
          ],
          colors: [
            "#1f77b4",
            "#ff7f0e",
            "#2ca02c",
            "#d62728",
            "#9467bd",
            "#8c564b",
            "#e377c2",
            "#7f7f7f",
            "#bcbd22",
            "#17becf",
            "#aec7e8",
            "#ffbb78",
            "#98df8a",
            "#ff9896",
            "#c5b0d5",
            "#c49c94",
            "#f7b6d2",
            "#c7c7c7",
            "#dbdb8d",
            "#9edae5",
            "#ff6600",
            "#339933",
            "#cc0000",
            "#993366",
            "#663300",
            "#ff66cc",
            "#666666",
            "#cccc00",
            "#00ccff",
            "#ff3300",
            "#66ff66",
            "#990000",
            "#996699",
            "#996633",
            "#ff99cc",
            "#999999",
            "#ffff00",
            "#0099ff",
          ],

          tooltip: {
            fixed: {
              enabled: true,
              position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
              offsetY: 30,
              offsetX: 60,
            },
          },
          legend: {
            horizontalAlign: "center",
            offsetX: 40,
          },
          markers: {
            size: 8, // ปรับขนาดของตัวเลขหรือจุดที่แสดงในกราฟ
          },
        },
      };

      const failChartIndex = {
        series: failDataIndex,
        options: {
          chart: {
            height: 350,
            type: "line",
            toolbar: {
              show: false,
            },
          },

          xaxis: {
            lines: {
              show: false,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
          title: {
            text: selecteKPOV + "Fail",
            align: "Conter",
          },
          xaxis: {
            lines: {
              show: true,
            },
          },

          yaxis: [
            {
              min: -4,
              max: 4,
              axisTicks: {
                show: true,
              },
              axisBorder: {
                show: true,
                color: "#ff1a1a",
              },
              labels: {
                style: {
                  colors: "#ff1a1a",
                },
              },

              title: {
                text: "Bin",
                style: {
                  color: "#ff1a1a",
                },
              },
            },
          ],
          colors: [
            "#1f77b4",
            "#ff7f0e",
            "#2ca02c",
            "#d62728",
            "#9467bd",
            "#8c564b",
            "#e377c2",
            "#7f7f7f",
            "#bcbd22",
            "#17becf",
            "#aec7e8",
            "#ffbb78",
            "#98df8a",
            "#ff9896",
            "#c5b0d5",
            "#c49c94",
            "#f7b6d2",
            "#c7c7c7",
            "#dbdb8d",
            "#9edae5",
            "#ff6600",
            "#339933",
            "#cc0000",
            "#993366",
            "#663300",
            "#ff66cc",
            "#666666",
            "#cccc00",
            "#00ccff",
            "#ff3300",
            "#66ff66",
            "#990000",
            "#996699",
            "#996633",
            "#ff99cc",
            "#999999",
            "#ffff00",
            "#0099ff",
          ],
          tooltip: {
            fixed: {
              enabled: true,
              position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
              offsetY: 30,
              offsetX: 60,
            },
          },
          legend: {
            horizontalAlign: "center",
            offsetX: 40,
          },
          markers: {
            size: 8, // ปรับขนาดของตัวเลขหรือจุดที่แสดงในกราฟ
          },
        },
      };

      const hasNullValue = json_data_cba.some((item) => {
        return selecteKPIV.some((kpi) => item[kpi] === null);
      });

      if (hasNullValue) {
        console.log("Cannot submit because some values are null.");
        // Optionally show a message to the user that some values are null.
      } else {
        // Submit the form or perform other actions.
        console.log("Submitting the form...");
      }

      const passDataSup_conf = selecteKPOVArray.map((selectesup, kpivIndex) => {
        const seriesData = [];

        json_data_cba.forEach((item, index) => {
          const KPOVValue = item[selecteKPOV].toLowerCase(); // Use selecteKPOV here

          if (KPOVValue === "pass") {
            seriesData.push({
              x: `Rule:${index + 1}Sub: ${item.sup}`, // X-axis is a combination of index and item.sup
              y: item.conf, // Y-axis is 'sup' column value
            });
          } else {
            seriesData.push({
              x: `Rule:${index + 1} Sub: ${item.sup}`, // X-axis is a combination of index and item.sup
              y: null,
            });
          }
        });

        return {
          name: "conf",
          type: "scatter",
          data: seriesData,
        };
      });

      const failDataSup_conf = selecteKPOVArray.map((selectesup, kpivIndex) => {
        const seriesData = [];

        json_data_cba.forEach((item, index) => {
          const KPOVValue = item[selecteKPOV].toLowerCase(); // Use selecteKPOV here

          if (KPOVValue === "fail") {
            seriesData.push({
              x: `Rule:${index + 1}Sub: ${item.sup}`, // X-axis is a combination of index and item.sup
              y: item.conf, // Y-axis is 'sup' column value
            });
          } else {
            seriesData.push({
              x: `Rule:${index + 1} Sub: ${item.sup}`, // X-axis is a combination of index and item.sup
              y: null,
            });
          }
        });

        return {
          name: "conf",
          type: "scatter",
          data: seriesData,
        };
      });

      const passChartSup_conf = {
        series: passDataSup_conf,
        options: {
          yaxis: {
            title: {
              text: "Confidence",
              style: {
                color: "#00e673",
              },
            },
          },
          xaxis: {
            title: {
              text: "Support",
              style: {
                color: "#00e673",
              },
            },
          },
          colors: ["#009900"],
          markers: {
            size: 10, // ปรับขนาดของตัวเลขหรือจุดที่แสดงในกราฟ
          },
          dataLabels: {
            enabled: true,
            style: {
              colors: ["green"], // กำหนดสีของข้อมูลในกราฟ
            },
            formatter: function (val, opts) {
              if (val !== null) {
                return (opts.dataPointIndex + 1).toString(); // เพิ่ม 1 เพื่อให้เริ่มจาก 1
              } else {
                return "";
              }
            },
          },
        },
      };

      const failChartSup_conf = {
        series: failDataSup_conf,
        options: {
          yaxis: {
            title: {
              text: "Confidence",
              style: {
                color: "#ff1a1a",
              },
            },
          },
          xaxis: {
            title: {
              text: "Support",
              style: {
                color: "#ff1a1a",
              },
            },
          },
          colors: ["#ff1a1a"],
          markers: {
            size: 10, // ปรับขนาดของตัวเลขหรือจุดที่แสดงในกราฟ
          },
          dataLabels: {
            enabled: true,
            style: {
              colors: ["red"], // กำหนดสีของข้อมูลในกราฟ
            },
            formatter: function (val, opts) {
              if (val !== null) {
                return (opts.dataPointIndex + 1).toString(); // เพิ่ม 1 เพื่อให้เริ่มจาก 1
              } else {
                return "";
              }
            },
          },
        },
      };

      setPassChartSup_conf(passChartSup_conf);
      setFailChartSup_conf(failChartSup_conf);

      setPassChartSupData(passChartSup);
      setFailChartSupData(failChartSup);

      setPassChartIndexData(passChartIndex);
      setFailChartIndexData(failChartIndex);

      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  const Submit_KPOV = async () => {
    setIsLoading(true);
    try {
      const result = await BIN_KPOV(
        model,
        line,
        start,
        end,
        selecteKPOV,
        selecteKPIV,
        minKPOV,
        maxKPOV
      );
      console.log("selecteKPIV in frontend:", selecteKPIV);

      // Extract count results from the response
      const countBeforeSMOTE = result.count_before_smote;
      const countAfterSMOTE = result.count_after_smote;

      // Set the countBeforeSMOTE and countAfterSMOTE state variables if needed
      setCountBeforeSMOTE(countBeforeSMOTE);
      setCountAfterSMOTE(countAfterSMOTE);

      const result_data_bin = await api_data_bin(model, selecteKPIV);

      if (Array.isArray(result_data_bin) && result_data_bin.length > 0) {
        // Assuming you want to use all datasets from result_data_bin
        // Flatten the array of arrays to get the objects
        const flattenedData = result_data_bin.flat();

        setTableData(flattenedData);
      } else {
        console.error("No data or invalid response from the API");
      }
      console.log(result_data_bin);
      setShowTable(true);
      // Other code for rendering or using the count results...
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (pythonApiImageURL && pairplotImageURL) {
      const link1 = document.createElement("a");
      link1.href = pythonApiImageURL;
      link1.download = "Python_API_Image.png";
      link1.click();

      const link2 = document.createElement("a");
      link2.href = pairplotImageURL;
      link2.download = "Pairplot_Image.png";
      link2.click();
    }
  };

  const handleParameterChange1 = (event) => {
    // อย่าทำอะไรเมื่อเลือก KPOV
    // เนื่องจากต้องเลือก KPOV ก่อน KPIV
    setSelecteKPOV(event.target.value); // Correct variable name
  };

  const handleParameterChange = (selectedOptions) => {
    // อัปเดต state ของ KPIV เมื่อมีการเลือกเปลี่ยนแปลง
    const selectedOptionValues = selectedOptions.map((option) => option.value);
    setselecteKPIV(selectedOptionValues);
  };

  const kpiOptions = parameterOptions.filter(
    (option) => !selecteKPOV.includes(option.value)
  );

  const handleSelectAll = () => {
    if (selectAll) {
      // If 'Select All' is currently active, clear all selections
      setselecteKPIV([]);
    } else {
      // If 'Select All' is not active, select all KPIV options that are not in KPOV
      const newSelectedItems = kpiOptions.map((option) => option.value);
      setselecteKPIV([...selecteKPIV, ...newSelectedItems]);
    }
    setSelectAll(!selectAll); // Toggle the 'Select All' state
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

  const fetchParameterOptions = async () => {
    try {
      const options = await getParameterOptions(); // Replace with your API call
      setParameterOptions(options);
    } catch (error) {
      console.error("Error fetching parameter options:", error);
    }
  };

  function generateRandomColor() {
    const letters = "abcdef0123456789";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // สร้างรายการสีตามจำนวนแถวในตาราง
  const cellColors = Array(tableData.length)
    .fill(null)
    .map(generateRandomColor);

  // ใช้ useEffect เพื่อเรียก fetchModelOptions เมื่อ Component ถูกโหลด
  useEffect(() => {
    async function fetchData() {
      try {
        const selectedModel = await fetchModelOptions();
        console.log("Selected Model:", selectedModel);
        await fetchLineOptions(model); // Pass the selected model to fetchLineOptions
        await fetchParameterOptions(); // Fetch parameter options independently
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [model]);

  const columnColors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
    "#aec7e8",
    "#ffbb78",
    "#98df8a",
    "#ff9896",
    "#c5b0d5",
    "#c49c94",
    "#f7b6d2",
    "#c7c7c7",
    "#dbdb8d",
    "#9edae5",
    "#ff6600",
    "#339933",
    "#cc0000",
    "#993366",
    "#663300",
    "#ff66cc",
    "#666666",
    "#cccc00",
    "#00ccff",
    "#ff3300",
    "#66ff66",
    "#990000",
    "#996699",
    "#996633",
    "#ff99cc",
    "#999999",
    "#ffff00",
    "#0099ff",
  ];

  return (
    <div className="content-wrapper">
      <div className="content" style={{ paddingTop: 80 }}>
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>Machine learning</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <a href="http://10.120.122.10:2013/Home">Home</a>
                  </li>
                  <li className="breadcrumb-item active">Machine Learning</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="card card-primary card-outline">
        <div className="card-header">
          <div className="card-body">
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
                      handleFormSubmit(); // เรียก handleFormSubmit() เมื่อมีการเปลี่ยนค่า
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
                      handleFormSubmit();
                    }}
                    placeholder={model ? "Select Line" : "Select Model first"} // Conditional placeholder
                  />
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div className="form-group">
                  <label htmlFor="start" className="col-form-label">
                    Start Date:
                  </label>
                  <input
                    id="start"
                    type="date"
                    className="form-control"
                    value={start}
                    onChange={(event) => setstart(event.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="form-group">
                  <label htmlFor="end" className="col-form-label">
                    End Date:
                  </label>
                  <input
                    id="end"
                    type="date"
                    className="form-control"
                    value={end}
                    onChange={(event) => setend(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-6">
              <div className="form-group">
                <label htmlFor="parameterSelect">Select KPOV:</label>
                <Select
                  options={parameterOptions.map((option) => ({
                    value: option.value,
                    label: option.text,
                  }))}
                  // isClearable
                  value={
                    selecteKPOV
                      ? {
                          value: selecteKPOV,
                          label: selecteKPOV,
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    if (selectedOption) {
                      setSelecteKPOV(selectedOption.value);
                    } else {
                      setSelecteKPOV(null);
                    }
                    handleFormSubmit();
                  }}
                  placeholder="Select KPOV"
                />
              </div>
            </div>
            {selecteKPOV && (
              <div className="col-2 text-right">
                <h4>KPOV {selecteKPOV}</h4>
              </div>
            )}
          </div>

          <div className="row">
            <div className="col-6">
              <div className="form-group">
                <label htmlFor="parameterSelect">Select KPIV:</label>
                <Select
                  isMulti
                  options={kpiOptions.map((option) => ({
                    value: option.value,
                    label: option.text,
                  }))}
                  onChange={handleParameterChange}
                  value={kpiOptions
                    .filter((option) => selecteKPIV.includes(option.value))
                    .map((option) => ({
                      value: option.value,
                      label: option.text,
                    }))}
                  placeholder="Select KPIV"
                  closeMenuOnSelect={false} // ไม่ปิด dropdown หลังการเลือก
                  isSearchable={false} // ไม่ให้ค้นหาอาร์เรย์
                />
              </div>

              <button onClick={handleSelectAll} className="btn btn-primary">
                {selectAll ? "Clear Selection" : "Select All"}
              </button>

              <div className="flex-container">
                <div className="flex-item">
                  <label>
                    <input
                      type="radio"
                      value="yes"
                      checked={showInput}
                      onChange={handleRadioChange}
                    />
                    Associate Rule Mining
                  </label>
                </div>
                {showInput && (
                  <div className="flex-item">
                    <div className="text-center">
                      <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="btn btn-primary"
                      >
                        {isLoading ? "Working..." : "Submit"}
                      </button>
                      {isLoading ? <p>Loading...</p> : null}
                      {/* Progress bar */}
                      <div>
                        <progress
                          max="100"
                          value={progressPercentage}
                        ></progress>
                        <p>{progressPercentage}% completed</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-6">
              <div className="content">
                <div className="container-fluid">
                  <div className="card card-primary">
                    <div className="row">
                      <div className="col-12">
                        <div
                          className="card-body table-responsive p-0"
                          style={{ height: 300 }}
                        >
                          {selecteKPIV.length > 0 && (
                            <div>
                              <table className="table table-head-fixed text-nowrap table-hover">
                                {/* <caption>KPIV Details Table</caption> */}
                                <thead>
                                  <tr>
                                    <th style={{ textAlign: "center" }}>
                                      <h4>KPIV</h4>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selecteKPIV.map((parameter) => (
                                    <tr key={parameter}>
                                      <td>{parameter}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            {/* ตรวจสอบสถานะการแสดงตาราง */}
            {showInput && (
              <div style={{ flex: 1, paddingLeft: "10px" }}>
                {/* ส่วนของตาราง */}

                <h3>Data Preparation</h3>
                <div class="content">
                  <div class="container-fluid">
                    <div className="card card-primary">
                      <div className="row">
                        <div className="col-12">
                          {/* /.card-header */}
                          <div
                            className="card-body table-responsive p-0"
                            style={{
                              height: 500,
                              zIndex: "3",
                              position: "relative",
                              zIndex: "0",
                            }}
                          >
                            <table className="table table-head-fixed text-nowrap table-hover table-bordered">
                              <caption>Summary Table</caption>
                              <thead>
                                <th style={{ textAlign: "center" }}>
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>
                                        This column represents the parameter.
                                      </Tooltip>
                                    }
                                  >
                                    {(props) => (
                                      <span
                                        {...props}
                                        style={{
                                          fontSize: 18,
                                          color: "Dodgerblue",
                                          cursor: "pointer",
                                          marginLeft: "5px", // เพิ่ม margin ที่ด้านซ้ายของ Parameter
                                        }}
                                      >
                                        Parameter
                                      </span>
                                    )}
                                  </OverlayTrigger>
                                </th>
                                <th style={{ textAlign: "center" }}>
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>
                                        This column displays the count, which
                                        represents the total number of data
                                        points.
                                      </Tooltip>
                                    }
                                  >
                                    {(props) => (
                                      <span
                                        {...props}
                                        style={{
                                          fontSize: 18,
                                          color: "Dodgerblue",
                                          cursor: "pointer",
                                          marginLeft: "5px", // เพิ่ม margin ที่ด้านซ้ายของ Parameter
                                        }}
                                      >
                                        Count
                                      </span>
                                    )}
                                  </OverlayTrigger>
                                </th>

                                <th style={{ textAlign: "center" }}>
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>
                                        This column shows the mean, which is the
                                        average value of the data.
                                      </Tooltip>
                                    }
                                  >
                                    {(props) => (
                                      <span
                                        {...props}
                                        style={{
                                          fontSize: 18,
                                          color: "Dodgerblue",
                                          cursor: "pointer",
                                          marginLeft: "5px", // เพิ่ม margin ที่ด้านซ้ายของคำอธิบาย
                                        }}
                                      >
                                        Mean
                                      </span>
                                    )}
                                  </OverlayTrigger>
                                </th>

                                <th style={{ textAlign: "center" }}>
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>
                                        This column represents the standard
                                        deviation (std) of the data.
                                      </Tooltip>
                                    }
                                  >
                                    {(props) => (
                                      <span
                                        {...props}
                                        style={{
                                          fontSize: 18,
                                          color: "Dodgerblue",
                                          cursor: "pointer",
                                          marginLeft: "5px", // เพิ่ม margin ที่ด้านซ้ายของคำอธิบาย
                                        }}
                                      >
                                        Std
                                      </span>
                                    )}
                                  </OverlayTrigger>
                                </th>

                                {/* ตัวอย่างการแสดงคอลัมน์ "Min" โดยใช้ Tooltip และข้อความ "Min" */}
                                <th style={{ textAlign: "center" }}>
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>
                                        This column displays the minimum value
                                        in the dataset.
                                      </Tooltip>
                                    }
                                  >
                                    {(props) => (
                                      <span
                                        {...props}
                                        style={{
                                          fontSize: 18,
                                          color: "Dodgerblue",
                                          cursor: "pointer",
                                          marginLeft: "5px", // เพิ่ม margin ที่ด้านซ้ายของคำอธิบาย
                                        }}
                                      >
                                        Min
                                      </span>
                                    )}
                                  </OverlayTrigger>
                                </th>

                                {/* ตัวอย่างการแสดงคอลัมน์ "25%" โดยใช้ Tooltip และข้อความ "25%" */}
                                <th style={{ textAlign: "center" }}>
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>
                                        This column represents the 25th
                                        percentile of the data.
                                      </Tooltip>
                                    }
                                  >
                                    {(props) => (
                                      <span
                                        {...props}
                                        style={{
                                          fontSize: 18,
                                          color: "Dodgerblue",
                                          cursor: "pointer",
                                          marginLeft: "5px", // เพิ่ม margin ที่ด้านซ้ายของคำอธิบาย
                                        }}
                                      >
                                        25%
                                      </span>
                                    )}
                                  </OverlayTrigger>
                                </th>

                                {/* ตัวอย่างการแสดงคอลัมน์ "50%" โดยใช้ Tooltip และข้อความ "50%" */}
                                <th style={{ textAlign: "center" }}>
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>
                                        This column represents the 50th
                                        percentile or median of the data.
                                      </Tooltip>
                                    }
                                  >
                                    {(props) => (
                                      <span
                                        {...props}
                                        style={{
                                          fontSize: 18,
                                          color: "Dodgerblue",
                                          cursor: "pointer",
                                          marginLeft: "5px", // เพิ่ม margin ที่ด้านซ้ายของคำอธิบาย
                                        }}
                                      >
                                        50%
                                      </span>
                                    )}
                                  </OverlayTrigger>
                                </th>

                                {/* ตัวอย่างการแสดงคอลัมน์ "75%" โดยใช้ Tooltip และข้อความ "75%" */}
                                <th style={{ textAlign: "center" }}>
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>
                                        This column represents the 75th
                                        percentile of the data.
                                      </Tooltip>
                                    }
                                  >
                                    {(props) => (
                                      <span
                                        {...props}
                                        style={{
                                          fontSize: 18,
                                          color: "Dodgerblue",
                                          cursor: "pointer",
                                          marginLeft: "5px", // เพิ่ม margin ที่ด้านซ้ายของคำอธิบาย
                                        }}
                                      >
                                        75%
                                      </span>
                                    )}
                                  </OverlayTrigger>
                                </th>

                                {/* ตัวอย่างการแสดงคอลัมน์ "Max" โดยใช้ Tooltip และข้อความ "Max" */}
                                <th style={{ textAlign: "center" }}>
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>
                                        This column displays the maximum value
                                        in the dataset.
                                      </Tooltip>
                                    }
                                  >
                                    {(props) => (
                                      <span
                                        {...props}
                                        style={{
                                          fontSize: 18,
                                          color: "Dodgerblue",
                                          cursor: "pointer",
                                          marginLeft: "5px", // เพิ่ม margin ที่ด้านซ้ายของคำอธิบาย
                                        }}
                                      >
                                        Max
                                      </span>
                                    )}
                                  </OverlayTrigger>
                                </th>
                              </thead>
                              <tbody>
                                {summaryData &&
                                  Object.keys(summaryData).map(
                                    (columnName, index) => (
                                      <tr
                                        key={columnName}
                                        style={{
                                          backgroundColor:
                                            index % 2 === 0
                                              ? "#f2f2f2"
                                              : "white",
                                        }}
                                      >
                                        <td>{columnName}</td>

                                        <td style={{ textAlign: "right" }}>
                                          {summaryData[columnName]?.count ||
                                            "N/A"}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          {summaryData[
                                            columnName
                                          ]?.mean?.toFixed(2) || "N/A"}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          {summaryData[
                                            columnName
                                          ]?.std?.toFixed(2) || "N/A"}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          {summaryData[
                                            columnName
                                          ]?.min?.toFixed(2) || "N/A"}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          {summaryData[columnName]?.[
                                            "25%"
                                          ]?.toFixed(2) || "N/A"}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          {summaryData[columnName]?.[
                                            "50%"
                                          ]?.toFixed(2) || "N/A"}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          {summaryData[columnName]?.[
                                            "75%"
                                          ]?.toFixed(2) || "N/A"}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          {summaryData[
                                            columnName
                                          ]?.max?.toFixed(2) || "N/A"}
                                        </td>
                                      </tr>
                                    )
                                  )}
                              </tbody>
                            </table>
                          </div>
                          {/* /.card-body */}
                        </div>
                        {/* /.card */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {summaryData && (
            <div class="content">
              <div class="container-fluid">
                <div className="card card-primary">
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="text-center">
                        <div>
                          <img
                            src={pythonApiImageURL}
                            alt="Python API Image"
                            className="img-fluid"
                            style={{ maxWidth: "70%", height: "auto" }}
                          />
                          <label>Sub Plot</label>{" "}
                          {/* You can replace "Sub Plot" with your desired caption */}
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="text-center">
                        {pairplotImageURL && (
                          <div>
                            <img
                              src={pairplotImageURL}
                              alt="Python API Image"
                              className="img-fluid"
                              style={{ maxWidth: "70%", height: "auto" }}
                            />
                            <label>Pair Plot</label>{" "}
                            {/* You can replace "Pair Plot" with your desired caption */}
                          </div>
                        )}
                      </div>
                    </div>
                    {pairplotImageURL && (
                      <div className="text-center">
                        <button
                          onClick={handleDownloadImage}
                          className="btn btn-success ml-2"
                        >
                          Download Image
                        </button>
                        {isLoading ? <p>Loading...</p> : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div>
            {summaryData && (
              <div>
                <h5> Select Spec KPOV {selecteKPOV}</h5>
                <div className="row">
                  <div className="col-2 mt-3">
                    <div className="flex-container">
                      <div>
                        <input
                          type="radio"
                          value="yes"
                          onChange={handleRadioChange_KPOV}
                          name="kpv_radio"
                        />{" "}
                        Spec KPOV {selecteKPOV}
                      </div>
                    </div>
                  </div>
                  <div className="col-2 mt-3">
                    <div className="flex-container">
                      <div>
                        <input
                          type="radio"
                          value="No"
                          onChange={handleRadioChange_KPOV}
                          name="kpv_radio"
                        />{" "}
                        Manual Input
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {summaryData && (
              <div className="row">
                <div className="col-4 mt-3">
                  <div className="form-group">
                    <label htmlFor="minKPOV">Min KPOV:</label>
                    <input
                      id="minKPOV"
                      type="text"
                      className="form-control"
                      value={minKPOV}
                      onChange={(event) => setMinKPOV(event.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>

                <div className="col-4 mt-3">
                  <div className="form-group">
                    <label htmlFor="maxKPOV">Max KPOV:</label>
                    <input
                      id="maxKPOV"
                      type="text"
                      className="form-control"
                      value={maxKPOV}
                      onChange={(event) => setMaxKPOV(event.target.value)}
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
                {maxKPOV && (
                  <div className="col-4 mt-5">
                    <button onClick={Submit_KPOV} className="btn btn-primary">
                      Submit
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Table display section */}
            {countAfterSMOTE && (
              <div style={{ flex: 1, paddingLeft: "10px" }}>
                <h3>Data Classification table</h3>

                <div className="content">
                  <div className="container-fluid">
                    <div className="card card-primary">
                      <div className="row">
                        <div className="col-12">
                          <div
                            className="card-body table-responsive p-0 styled-table"
                            style={{
                              height: 300,
                              zIndex: "3",
                              position: "relative",
                              zIndex: "0",
                            }}
                          >
                            <table className="table table-head-fixed text-nowrap table-hover table-bordered">
                              <thead>
                                <tr>
                                  <th class="row-header">Between</th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      background: "black",
                                      color: "white",
                                    }}
                                  >
                                    -4
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      background: "black",
                                    }}
                                  >
                                    -3
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      background: "black",
                                      color: "white",
                                    }}
                                  >
                                    -2
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      background: "black",
                                    }}
                                  >
                                    -1
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      background: "black",
                                      color: "white",
                                    }}
                                  >
                                    1
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      background: "black",
                                    }}
                                  >
                                    2
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      background: "black",
                                      color: "white",
                                    }}
                                  >
                                    3
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      background: "black",
                                    }}
                                  >
                                    4
                                  </th>
                                </tr>
                                <tr>
                                  <th class="row-header">Parameter</th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      fontSize: "12px",
                                      background: "black",
                                      color: "white",
                                    }}
                                  >
                                    MIN &lt;&gt; MAX
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      fontSize: "12px",
                                      background: "black",
                                    }}
                                  >
                                    MIN &lt;&gt; MAX
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      fontSize: "12px",
                                      background: "black",
                                      color: "white",
                                    }}
                                  >
                                    MIN &lt;&gt; MAX
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      fontSize: "12px",
                                      background: "black",
                                    }}
                                  >
                                    MIN &lt;&gt; MAX
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      fontSize: "12px",
                                      background: "black",
                                      color: "white",
                                    }}
                                  >
                                    MIN &lt;&gt; MAX
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      fontSize: "12px",
                                      background: "black",
                                    }}
                                  >
                                    MIN &lt;&gt; MAX
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      fontSize: "12px",
                                      background: "black",
                                      color: "white",
                                    }}
                                  >
                                    MIN &lt;&gt; MAX
                                  </th>
                                  <th
                                    colSpan={3}
                                    style={{
                                      textAlign: "center",
                                      fontSize: "12px",
                                      background: "black",
                                    }}
                                  >
                                    MIN &lt;&gt; MAX
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {tableData &&
                                  tableData.map((item, index) => (
                                    <tr key={index}>
                                      <td style={{ fontSize: "12px" }}>
                                        {item.Parameter}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MIN_L4}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MAX_L4}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MIN_L3}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MAX_L3}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MIN_L2}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MAX_L2}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MIN_L1}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MAX_L1}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MIN_U1}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MAX_U1}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MIN_U2}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MAX_U2}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MIN_U3}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MAX_U3}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MIN_U4}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "12px",
                                        }}
                                      >
                                        {item.MAX_U4}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {countAfterSMOTE && (
            <div className="row">
              {/* Updated code with form inputs and submit button */}
              <div className="row mt-3">
                <div className="col-md-4">
                  <div className="form-group">
                    <label style={{ textAlign: "center" }}>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            This input represents the level of support for the
                            data or concept.
                          </Tooltip>
                        }
                      >
                        {(props) => (
                          <span
                            {...props}
                            style={{
                              fontSize: 18,
                              color: "Dodgerblue",
                              cursor: "pointer",
                              marginLeft: "5px", // Add margin to the left of Parameter
                            }}
                          >
                            Support
                          </span>
                        )}
                      </OverlayTrigger>
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">0.</span>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        id="supportValue"
                        onChange={(e) => setSupportValue(e.target.value)}
                        value={supportValue}
                        placeholder="Enter a value"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label style={{ textAlign: "center" }}>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            This input represents the level of confidence in the
                            data or concept.
                          </Tooltip>
                        }
                      >
                        {(props) => (
                          <span
                            {...props}
                            style={{
                              fontSize: 18,
                              color: "Dodgerblue",
                              cursor: "pointer",
                              marginLeft: "5px", // Add margin to the left of Parameter
                            }}
                          >
                            Confidence
                          </span>
                        )}
                      </OverlayTrigger>
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">0.</span>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        id="confidenceValue"
                        onChange={(e) => setConfidenceValue(e.target.value)}
                        value={confidenceValue}
                        placeholder="Enter a value"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <div
                      style={{
                        flex: 3,
                        marginBottom: "30px",
                        paddingRight: "10px",
                      }}
                    >
                      {/* Content for the left side */}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        marginBottom: "10px",
                        paddingLeft: "10px",
                      }}
                    >
                      {/* Content for the right side */}
                    </div>
                  </div>
                  <button
                    onClick={SubmitButton_KPIV}
                    className="btn btn-primary"
                  >
                    Submit
                  </button>
                  {isLoading ? <p>Loading...</p> : null}
                </div>
              </div>

              {classification && (
                <div className="col-4 mt-5">
                  <table
                    border="1"
                    style={{ borderCollapse: "collapse", width: "100%" }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "gray", color: "white" }}>
                        <th style={{ textAlign: "center" }}>Class</th>
                        <th style={{ textAlign: "center" }}>Precision</th>
                        <th style={{ textAlign: "center" }}>Recall</th>
                        <th style={{ textAlign: "center" }}>F1-Score</th>
                        <th style={{ textAlign: "center" }}>Support</th>
                      </tr>
                    </thead>
                    <tbody>
                      <>
                        <tr>
                          <td>Pass</td>
                          <td style={{ textAlign: "right" }}>
                            {classification[0].precision.toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[0].recall.toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[0]["f1-score"].toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[0].support.toFixed(4)}
                          </td>
                        </tr>
                        <tr>
                          <td>fail</td>
                          <td style={{ textAlign: "right" }}>
                            {classification[1].precision.toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[1].recall.toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[1]["f1-score"].toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[1].support.toFixed(4)}
                          </td>
                        </tr>
                        <tr>
                          <td>accuracy</td>
                          <td style={{ textAlign: "right" }}>
                            {classification[2].precision.toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[2].recall.toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[2]["f1-score"].toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[2].support.toFixed(4)}
                          </td>
                        </tr>
                        <tr>
                          <td>macro avg</td>
                          <td style={{ textAlign: "right" }}>
                            {classification[3].precision.toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[3].recall.toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[3]["f1-score"].toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[3].support.toFixed(4)}
                          </td>
                        </tr>
                        <tr>
                          <td>weighted avg</td>
                          <td style={{ textAlign: "right" }}>
                            {classification[4].precision.toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[4].recall.toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[4]["f1-score"].toFixed(4)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {classification[4].support.toFixed(4)}
                          </td>
                        </tr>
                      </>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="row">
          {passChartSup_conf && (
            <div className="col-6" style={{ width: "100%" }}>
              <div style={{ width: "1%" }}></div>
              <div className="card card-warning" style={{ width: "99%" }}>
                <div className="card-body">
                  <div className="row">
                    <div style={{ width: "100%", textAlign: "center" }}>
                      <div className="chart-title" style={{ color: "green" }}>
                        Rule Efficiency Ranking Pass (suport)
                      </div>
                      <ReactApexChart
                        options={passChartSup_conf.options}
                        series={passChartSup_conf.series}
                        type="scatter"
                        height={400}
                        style={{ border: "1px solid green", padding: "10px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fail Chart */}
          {failChartSup_conf && (
            <div className="col-6" style={{ width: "100%" }}>
              <div style={{ width: "1%" }}></div>
              <div className="card card-warning" style={{ width: "99%" }}>
                <div className="card-body">
                  <div className="row">
                    <div style={{ width: "100%", textAlign: "center" }}>
                      <div className="chart-title" style={{ color: "red" }}>
                        Rule Efficiency Ranking Fail (suport)
                      </div>{" "}
                      <ReactApexChart
                        options={failChartSup_conf.options}
                        series={failChartSup_conf.series}
                        type="scatter"
                        height={400}
                        style={{ border: "1px solid red", padding: "10px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {passChartSupData && (
            <div className="col-6" style={{ width: "100%" }}>
              <div style={{ width: "1%" }}></div>
              <div className="card card-warning" style={{ width: "99%" }}>
                <div className="card-body">
                  <div className="row">
                    <div style={{ width: "100%", textAlign: "center" }}>
                      <div className="chart-title" style={{ color: "green" }}>
                        Rule Efficiency Ranking Pass (suport)
                      </div>
                      <ReactApexChart
                        options={passChartSupData.options}
                        series={passChartSupData.series}
                        type="scatter"
                        height={400}
                        style={{ border: "1px solid green", padding: "10px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fail Chart */}
          {failChartSupData && (
            <div className="col-6" style={{ width: "100%" }}>
              <div style={{ width: "1%" }}></div>
              <div className="card card-warning" style={{ width: "99%" }}>
                <div className="card-body">
                  <div className="row">
                    <div style={{ width: "100%", textAlign: "center" }}>
                      <div className="chart-title" style={{ color: "red" }}>
                        Rule Efficiency Ranking Fail (suport)
                      </div>{" "}
                      <ReactApexChart
                        options={failChartSupData.options}
                        series={failChartSupData.series}
                        type="scatter"
                        height={400}
                        style={{ border: "1px solid red", padding: "10px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {passChartIndexData && (
            <div className="col-6" style={{ width: "100%" }}>
              <div style={{ width: "1%" }}></div>
              <div className="card card-warning" style={{ width: "99%" }}>
                <div className="card-body">
                  <div className="row">
                    <div style={{ width: "100%", textAlign: "center" }}>
                      <div className="chart-title" style={{ color: "green" }}>
                        Rule description Pass
                      </div>
                      <ReactApexChart
                        options={passChartIndexData.options}
                        series={passChartIndexData.series}
                        type="scatter"
                        height={400}
                        style={{ border: "1px solid green", padding: "10px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fail Chart for Index */}
          {failChartIndexData && (
            <div className="col-6" style={{ width: "100%" }}>
              <div style={{ width: "1%" }}></div>
              <div className="card card-warning" style={{ width: "99%" }}>
                <div className="card-body">
                  <div className="row">
                    <div style={{ width: "100%", textAlign: "center" }}>
                      <div className="chart-title" style={{ color: "red" }}>
                        Rule description Fail
                      </div>{" "}
                      <ReactApexChart
                        options={failChartIndexData.options}
                        series={failChartIndexData.series}
                        type="scatter"
                        height={400}
                        style={{ border: "1px solid red", padding: "10px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {failChartIndexData && (
          <div style={{ flex: 1, paddingLeft: "10px" }}>
            <h3>Data Classification table</h3>

            <div className="content">
              <div className="container-fluid">
                <div className="card card-primary">
                  <div className="row">
                    <div className="col-12">
                    <style>
            {`
              .styled-table th,
              .styled-table td {
                font-size: 11px; /* Adjust the font size as needed */
                padding: 10px;    /* Adjust the padding as needed */
              }
            `}
          </style>
                      <div
                        className="card-body table-responsive p-0 styled-table"
                        style={{
                          height: 300,
                          zIndex: "3",
                          position: "relative",
                          zIndex: "0",
                        }}
                      >
                        <table
                          className="table table-head-fixed text-nowrap table-hover table-bordered"
                          style={{ backgroundColor: "black" }}
                        >
                          <thead>
                            <tr>
                              <th
                                class="row-header"
                                style={{
                                  textAlign: "center",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                {" "}
                                Between
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                -4
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                -3
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                -2
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                -1
                              </th>

                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                1
                              </th>

                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                2
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                3
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                4
                              </th>
                            </tr>
                            <tr>
                              <th class="row-header">Parameter</th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  fontSize: "12px",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                MIN &lt;&gt; MAX
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  fontSize: "12px",
                                  color: "white",
                                }}
                              >
                                MIN &lt;&gt; MAX
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  fontSize: "12px",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                MIN &lt;&gt; MAX
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  fontSize: "12px",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                MIN &lt;&gt; MAX
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  fontSize: "12px",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                MIN &lt;&gt; MAX
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  fontSize: "12px",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                MIN &lt;&gt; MAX
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  fontSize: "12px",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                MIN &lt;&gt; MAX
                              </th>
                              <th
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  fontSize: "12px",
                                  background: "black",
                                  color: "white",
                                }}
                              >
                                MIN &lt;&gt; MAX
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {tableData &&
                              tableData.map((item, index) => (
                                <tr key={index}>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.Parameter}
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MIN_L4}
                                  </td>
                                  
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                        margin: "0px",
                                    }}
                                  >
                                  <div
                                      style={{
                                        color: "white",
                                        margin: "0px",
                                      }}
                                    >
                                        - 4  
                                    </div>
                                   
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MAX_L4}
                                  </td>

                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    
                                    {item.MIN_L3}
                                    

                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                  <div
                                      style={{
                                        color: "white",
                                      }}
                                    >
                                        - 3  
                                    </div>
                                   
                                  </td>
                                  
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MAX_L3}
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MIN_L2}
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                  <div
                                      style={{
                                        color: "white",
                                      }}
                                    >
                                        - 2  
                                    </div>
                                   
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MAX_L2}
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MIN_L1}
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                  <div
                                      style={{
                                        color: "white",
                                      }}
                                    >
                                        -1  
                                    </div>
                                   
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MAX_L1}
                                  </td>
                                  
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MIN_U1}
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                  <div
                                      style={{
                                        color: "white",
                                      }}
                                    >
                                        1  
                                    </div>
                                   
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MAX_U1}
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MIN_U2}
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                  <div
                                      style={{
                                        color: "white",
                                      }}
                                    >
                                        2  
                                    </div>
                                   
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MAX_U2}
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MIN_U3}
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                  <div
                                      style={{
                                        color: "white",
                                      }}
                                    >
                                        3  
                                    </div>
                                   
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MAX_U3}
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MIN_U4}
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                  <div
                                      style={{
                                        color: "white",
                                      }}
                                    >
                                        4  
                                    </div>
                                   
                                  </td>
                                  <td
                                    style={{
                                      color:
                                        columnColors[
                                          index % columnColors.length
                                        ],
                                    }}
                                  >
                                    {item.MAX_U4}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {classification && (
          <table
            border="1"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead>
              <tr style={{ backgroundColor: "gray", color: "white" }}>
                {/* เปลี่ยนตัวสร้างคอลัมน์ Projection1 เพื่อรับค่า selecteKPOV แทน */}
                <th style={{ textAlign: "center" }}>Rule No. </th>

                {/* เพิ่มคอลัมน์สำหรับ KPIV ที่คุณเลือก */}
                {selecteKPIV.map((kpi, index) => (
                  <th style={{ textAlign: "center" }} key={index}>
                    KPIV:{kpi}
                  </th>
                ))}
                <th style={{ textAlign: "center" }}>sup</th>
                <th style={{ textAlign: "center" }}>conf</th>

                <th>KPOV:{selecteKPOV}</th>
              </tr>
            </thead>
            <tbody>
              {json_data_cba &&
                json_data_cba.map((item, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: "right" }}>{item.index}</td>
                    {selecteKPIV.map((kpi, index) => (
                      <td key={index} style={{ textAlign: "center" }}>
                        {item[kpi]}
                      </td>
                    ))}
                    <td style={{ textAlign: "right" }}>{item.sup}</td>
                    <td style={{ textAlign: "right" }}>{item.conf}</td>

                    <td
                      style={{
                        color: item[selecteKPOV] === "Pass" ? "green" : "red",
                      }}
                    >
                      {item[selecteKPOV]}
                    </td>
                    {/* เพิ่มคอลัมน์อื่น ๆ ตามความเหมาะสม */}
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
