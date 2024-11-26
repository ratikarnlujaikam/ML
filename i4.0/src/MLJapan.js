import React, { useState, useEffect } from 'react';
import {fetchDataFromPythonAPI} from './api'

function App() {
  const [imageURL, setImageURL] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false); // เพิ่ม state เพื่อติดตามสถานะการโหลด

  const formattedStartDate = startDate.replace("T", " ");
  const formattedEndDate = endDate.replace("T", " ");

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const url = await fetchDataFromPythonAPI(formattedStartDate, formattedEndDate);
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
      const link = document.createElement('a');
      link.href = imageURL;
      link.download = 'Data analysis.png';
      link.click();
    }
  };

  return (
    <div className="container" style={{ paddingTop: 80 }}>

              <div className="col-sm-12">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <a href="http://10.120.122.10:2013/Home">Home</a>
                  </li>
                  <li className="breadcrumb-item active">Tilt plot for PFH</li>
                </ol>
              </div>
      <h1 className="text-center mt-4 mb-5">Tilt plot for PFH</h1>
      <div className="form-group row">
        <label htmlFor="startDate" className="col-sm-2 col-form-label">Start Date:</label>
        <div className="col-sm-4">
          <input
            id="startDate"
            type="datetime-local"
            className="form-control"
            value={startDate}
            onChange={event => setStartDate(event.target.value)}
          />
        </div>
      </div>
      <div className="form-group row">
        <label htmlFor="endDate" className="col-sm-2 col-form-label">End Date:</label>
        <div className="col-sm-4">
          <input
            id="endDate"
            type="datetime-local"
            className="form-control"
            value={endDate}
            onChange={event => setEndDate(event.target.value)}
          />
        </div>
      </div>
      <div className="text-center">
        <div className="col-sm-7">
          <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
          {isLoading ? (
            <span className="ml-2">Loading...</span> // แสดงข้อความ "กำลังโหลด" เมื่อ isLoading เป็น true
          ) : (
            imageURL && (
              <button className="btn btn-success ml-2" onClick={handleDownloadImage}>Download Image</button>
            )
          )}
        </div>
      </div>
      {imageURL && (
        <div className="image-container text-center mt-5">
          <img src={imageURL} alt="Tilt Plot" className="img-fluid" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}
    </div>
  );
}

export default App;
