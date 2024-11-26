import React, { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import Clock from 'react-clock';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import './home.css'; // Importing the CSS file for styling

const Home = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="home-content">
      <section className="home-header">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-3">
              <div className="date-time-container">
                <Calendar value={currentDate} /> 
              </div>
            </div>
         
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
       
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
