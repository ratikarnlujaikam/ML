import React, { useState, useEffect } from "react";
import { API_SPC_DYNAMIC } from "./api";
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
import { get_ranking } from "./api";
import ReactApexChart from "react-apexcharts";
import Swal from "sweetalert2";

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

  const [result_dict_1, setget_ranking] = useState([]);
  const [result_dict_2, setget_ranking_2] = useState([]);
  const [nSignificant, setget_nSignificant] = useState(null);
  const [nSignificantError, setget_nSignificantError] = useState(null);
  const [rankingErrorAverage, setget_rankingErrorAverage] = useState(null);
  const [reliability, setget_reliability] = useState(null);

  const [nSignificant_2, setget_nSignificant_2] = useState(null);
  const [rankingErrorAverage_2, setget_rankingErrorAverage_2] = useState(null);
  const [reliability_2, setget_reliability_2] = useState(null);

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
  const [showAssociateRuleMining, setShowAssociateRuleMining] = useState(false);
  const [showKPIVRanking, setShowKPIVRanking] = useState(false);

  const handleAssociateRuleMiningChange = () => {
    setShowAssociateRuleMining(true);
    setShowKPIVRanking(false);
  };

  const handleKPIVRankingChange = () => {
    setShowAssociateRuleMining(false);
    setShowKPIVRanking(true);
  };

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

  // useEffect(() => {
  //   const socket = new WebSocket("ws://your-backend-url"); // Replace with your actual WebSocket URL

  //   socket.onopen = () => {
  //     console.log("WebSocket connected");
  //   };

  //   socket.onmessage = (event) => {
  //     const progressData = JSON.parse(event.data);
  //     setProgressPercentage(progressData.percentage);
  //   };

  //   socket.onclose = () => {
  //     console.log("WebSocket closed");
  //   };

  //   return () => {
  //     socket.close();
  //   };
  // }, []);







  const handleSubmit = async () => {
    setIsLoading(true);



    try {
      const pythonApiUrl = await API_SPC_DYNAMIC(
        model,
        line,
        start,
        selecteKPOV
      );
   




      const updateProgress = (progress) => {
        setProgressPercentage(progress);
      };

      // เริ่มแถบความคืบหน้าที่ค่าเริ่มต้น 0%
      setProgressPercentage(0);

      // ร้องขอ API และรอรับ JSON data
      const pythonApiResponse = await fetch(pythonApiUrl);


      // ดึงข้อมูลรูปภาพ
      const pythonApiBlob = await pythonApiResponse.blob();


      const pythonApiImageUrl = URL.createObjectURL(pythonApiBlob);
 
  

      setPythonApiImageURL(pythonApiImageUrl);
 
      console.log("summaryData", summaryData);

      console.log("pythonApiImageUrl", pythonApiImageUrl);
    

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
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Data loaded successfully.",
        showConfirmButton: true,
      });
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
              x: [index + 1], // X-axis is the index
              y: item.sup, // Y-axis is 'sup' column value
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
              x: [index + 1], // X-axis is the index
              y: item.conf, // Y-axis is 'sup' column value
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
              x: [index + 1], // X-axis is the index
              y: item.sup, // Y-axis is 'sup' column value
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
              x: [index + 1], // X-axis is the index
              y: item.conf, // Y-axis is 'sup' column value
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


          if (KPOVValue === "pass") {
            seriesData.push({
              x: [index + 1], // Use index directly +1 
              y: parseFloat(selecteKPIVFromJson[kpivIndex][index]),
            });
          }

        });

        return {
          name: kpiv,
          type: "scatter",
          data: seriesData,
        };
      });
 

      const failDataIndex = selecteKPIV.map((kpiv, kpivIndex) => {
        const seriesData = [];
      
        json_data_cba.forEach((item, index) => {
          const KPOVValue = item[selecteKPOV].toLowerCase(); // Use selecteKPOV here
      
          // Check for "fail" and non-null values
          if (KPOVValue === "fail") {
            seriesData.push({
              x: [index + 1], // Use index directly +1 
              y: parseFloat(selecteKPIVFromJson[kpivIndex][index]),
            });
          }
          
        });
      
        // Log data for debugging
        console.log('kpiv:', kpiv);
        console.log('seriesData:', seriesData);
      
        const result = {
          name: kpiv,
          type: "scatter",
          data: seriesData,
        };
      
        // Log the result
        console.log(result);
      
        return result;
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
              min: -5,
              max: 5,
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
          // colors: [
          //   "#ff9900",

          //   "#3399ff",

          //   "#00ff00",

          //   "#ff1a1a",

          //   "#FF69B4",

          //   "#9400D3",
          // ],
          // // colors: ["#009900", "#00e673"],
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
              min: -5,
              max: 5,
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
          // colors: [
          //   "#ff9900",

          //   "#3399ff",

          //   "#00ff00",

          //   "#ff1a1a",

          //   "#FF69B4",

          //   "#9400D3",
          // ],
          // // colors: ["#009900", "#00e673"],
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
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Data loaded successfully.",
        showConfirmButton: true,
      });
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
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Data loaded successfully.",
        showConfirmButton: true,
      });
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

  const kpiOptions = parameterOptions
    .filter((option) => {
      // Check if the split result is not present in selecteKPOV before splitting
      const splitValues = option.value.split(">");
      const splitResult =
        splitValues.length > 1 ? splitValues[1].trim() : option.value;

      return !selecteKPOV.includes(splitResult);
    })
    .map((option) => {
      // Use the splitResult calculated in the filter for consistency
      const splitValues = option.value.split(">");
      const splitResult =
        splitValues.length > 1 ? splitValues[1].trim() : option.value;

      return {
        value: splitResult,
        label: option.text,
      };
    });

  console.log("kpiOptions", kpiOptions);

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

    const columnColors = [
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "purple",
      "pink",
      "brown",
      "gray",
      "cyan",
      "indigo",
      "teal",
      "lime",
      "amber",
      "deep-orange",
      "deep-purple",
      "light-blue",
      "light-green",
      "blue-gray",
      "cyan",
    ];

    fetchData();
  }, [model]);

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
            </div>
          </div>

          <div className="row">
            <div className="col-2">
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
                    try {
                      if (selectedOption && selectedOption.value) {
                        const splitResult = selectedOption.value
                          .split(">")[1]
                          .trim();
                        setSelecteKPOV(splitResult);
                      } else {
                        setSelecteKPOV(null);
                      }
                    
                    } catch (error) {
                      console.error("Error splitting selected option:", error);
                      // Handle the error as needed, e.g., setSelecteKPOV to a default value.
                    }
                  }}
                  placeholder="Select KPOV"
                />
              </div>
           
            </div>

            <div className="col-4">
              <div className="form-group">
                <label htmlFor="parameterSelect">Select KPIV:</label>
                <Select
                  isMulti
                  options={kpiOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  onChange={handleParameterChange}
                  value={kpiOptions
                    .filter((option) => selecteKPIV.includes(option.value))
                    .map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                  placeholder="Select KPIV"
                  closeMenuOnSelect={false} // ไม่ปิด dropdown หลังการเลือก
                  isSearchable={false} // ไม่ให้ค้นหาอาร์เรย์
                />
              </div>

              <button onClick={handleSelectAll} className="btn btn-primary">
                {selectAll ? "Clear Selection" : "Select All"}
              </button>

              <div>
                <div className="flex-container">
                  <div className="flex-item">
                    <label>
                      <input
                        type="radio"
                        value="yes"
                        checked={showAssociateRuleMining}
                        onChange={handleAssociateRuleMiningChange}
                      />
                      Associate Rule Mining
                    </label>
                  </div>
                </div>

                <div className="flex-container">
   

              
               
                    <div className="flex-item">
                      {/* Additional input elements for Associate Rule Mining */}
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
         
                </div>
              </div>

              <div className="col-12 text-right">
                <h4>
                  Transfer KPIVs{" "}
                  <i
                    className="fas fa-arrow-right"
                    style={{ marginLeft: "1px" }}
                  ></i>
                </h4>
                <div className="col-12 text-right">
                  {/* Your other content */}
                </div>
              </div>
            </div>

            <div className="col-4">
            {selecteKPOV && (
                <div className="col-12 text-center">
                  <h4>KPOV  <i
                    className="fas fa-arrow-right"
                    style={{ marginLeft: "1px" }}
                  ></i> {selecteKPOV}</h4>
                </div>
              )}
              <div className="col-12">
                <div className="content">
                  <div className="container-fluid">
                    <div className="card card-primary">
                      <div className="row">
                        <div className="col-12">
                          <div
                            className="card-body table-responsive p-0"
                            style={{
                              height: 300,
                              zIndex: "3",
                              position: "relative",
                              zIndex: "0",
                            }}
                          >
                            {selecteKPIV.length > 0 && (
                              <div>
                                <table className="table table-head-fixed text-nowrap table-hover">
                                  {/* <caption>KPIV Details Table</caption> */}
                                  <thead>
                                    <tr>
                                      <th>No.</th>
                                      <th>KPIVs</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selecteKPIV.map((parameter, index) => (
                                      <tr key={index}>
                                        <td>{index + 1}</td>{" "}
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
          </div>
          <div>
          
          </div>
        
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
 
          <div>
        

   
          </div>

   
        </div>

 
      </div>

    </div>
  );
}

export default App;
