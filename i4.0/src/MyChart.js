
import React from 'react';
import { Bar } from 'react-chartjs-2';
const MyChart = ({ data }) => {
    // สร้างอาร์เรย์ของค่า x (labels) และค่า y (dataPoints)
    const labels = data.map((item, index) => index); // ใช้ index เป็นแกน x
    const dataPoints = data.map((item) => item.Set_Dim_C); // ใช้ Set_Dim_C เป็นค่าแกน y
  
    // สร้างข้อมูลสำหรับกราฟ
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Set_Dim_C', // ชื่อของชุดข้อมูล
          backgroundColor: 'rgba(75, 192, 192, 0.2)', // สีพื้นหลัง
          borderColor: 'rgba(75, 192, 192, 1)', // สีเส้นกราฟ
          borderWidth: 1, // ความหนาของเส้นกราฟ
          data: dataPoints, // ค่าข้อมูลแกน y
        },
      ],
    };
  
    return (
      <div>
        <Bar data={chartData} /> {/* แสดงกราฟแท่ง */}
      </div>
    );
  };
  