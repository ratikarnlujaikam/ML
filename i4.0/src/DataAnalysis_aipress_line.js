import React, { useState, useEffect } from 'react';
import { fetch_data_math } from './api'; // เปลี่ยนที่เก็บ API ตามโครงสร้างของโปรเจ็กต์ของคุณ
import './ImageComponent.css'; // Import CSS เพื่อปรับแต่งสไตล์

function ImageComponent() {
    const [imageUrl, setImageUrl] = useState('');
    const [countdown, setCountdown] = useState(3600); // เวลานับถอยหลังเริ่มต้นคือ 1 ชั่วโมง (3600 วินาที)

    // ฟังก์ชันสำหรับดึงข้อมูลรูปภาพ
    async function fetchData() {
        try {
            const url = await fetch_data_math(); // เรียกใช้ฟังก์ชั่น fetch_data_math เพื่อดึง URL ของรูปภาพ
            setImageUrl(url); // ตั้งค่า URL ของรูปภาพใน state
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ:', error);
        }
    }

    useEffect(() => {
        // เรียกใช้ fetchData เพื่อดึงข้อมูลรูปภาพเมื่อ Component โหลดครั้งแรก
        fetchData();

        const intervalId = setInterval(() => {
            setCountdown(prevCountdown => {
                if (prevCountdown === 1) {
                    fetchData(); // เรียกใช้ fetchData เมื่อ countdown ถึง 0
                    window.location.reload(); // ทำการ refresh เมื่อ countdown ถึง 0
                    return 3600; // รีเซ็ตเวลาถอยหลังกลับเป็น 1 ชั่วโมง
                }
                return prevCountdown - 1;
            });
        }, 1000); // เรียกใช้งานทุกๆ 1 วินาที

        return () => clearInterval(intervalId);
    }, []); // ทำให้ useEffect นี้ทำงานเฉพาะครั้งแรกที่ Component ถูก mount

    // แปลงเวลาที่เหลือในรูปแบบ HH:MM:SS
    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        
        <div className="image-container">
        <div className="col-sm-12">
        <ol className="breadcrumb float-sm-right">
          <li className="breadcrumb-item">
            <a href="http://192.168.101.120:2027/Home">Home</a>
          </li>
        
        </ol>
      </div>
     <h1 >Data Analysis for Rotor to base</h1>
            <div className="countdown">Refresh {formatTime(countdown)}</div>
            {imageUrl ? (
                <img src={imageUrl} alt="รูปภาพจาก API" className="small-image" />
            ) : (
                <div className="loading">loading...</div>
            )}
        </div>
    );
}

export default ImageComponent;
