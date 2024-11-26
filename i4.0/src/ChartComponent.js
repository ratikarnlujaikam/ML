import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

const ChartComponent = ({ data, selectedKPIVs }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    setChartData({
      labels: data.map(item => item.index),
      datasets: selectedKPIVs.map(kpiv => ({
        label: kpiv,
        data: data.map(item => item[kpiv]),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      })),
    });
  }, [data, selectedKPIVs]);

  return (
    <div>
      <h2>Line Chart</h2>
      <Line data={chartData} />
    </div>
  );
};

export default ChartComponent;
