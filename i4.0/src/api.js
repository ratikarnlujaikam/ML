
export const API_URL = 'http://localhost:2023';  // URL เซิร์ฟเวอร์ Python ที่ต้องการเรียกใช้งาน

//  const API_URL = 'http://10.120.122.28:2010';  // URL เซิร์ฟเวอร์ Python ที่ต้องการเรียกใช้งาน
// const API_URL = 'http://192.168.101.120:2025';  // URL เซิร์ฟเวอร์ Python ที่ต้องการเรียกใช้งา

export const fetchDataFromPythonAPI = async (formattedStartDate, formattedEndDate) => {
  try {
    const response = await fetch(`${API_URL}/api/data/${formattedStartDate}:00/${formattedEndDate}:00`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.url;
  } catch (error) {
    console.error('Error:', error);
  }
};
export const fetchSPC = async (process, model, line, startDate, parameter) => {
  try {
    const response = await fetch(`${API_URL}/api/process_input/${process}/${startDate}/${model}/${line}/${parameter}`);

    if (!response.ok) {
      // Throw an error for non-ok responses
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error:', error);

    // You can rethrow the error or return a default value here
    throw error;
  }
};


// /Boxes_plot_for_PFH


export const fetchDataML = async () => {
  try {
    const response = await fetch(`${API_URL}/api/data/model`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const jsonData = await response.json(); // Parse response data as JSON
    return jsonData;
  } catch (error) {
    console.error('Error:', error);
    return null; // Return null in case of an error to handle it accordingly in the caller function
  }
};


export const get_ranking = async (model, line, startDate, endDate, selecteKPOV, selecteKPIV) => {
  try {
    const response = await fetch(`${API_URL}/api/get_ranking/${model}/${line}/${startDate}/${endDate}/${selecteKPOV}/${selecteKPIV}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const fetch_and_plot = async (model, line, startDate, endDate, selecteKPOV, selecteKPIV) => {
  try {
    const response = await fetch(`${API_URL}/api/fetch_and_plot/${model}/${line}/${startDate}/${endDate}/${selecteKPOV}/${selecteKPIV}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error('Network response was not ok');
    }

    const result = await response.json(); // เพิ่มบรรทัดนี้เพื่อให้คืนค่า JSON จาก response

    return result;
  } catch (error) {
    console.error('Error:', error);
  }
};



export const PythonAPI = async () => {
  try {
    const response = await fetch(`${API_URL}/api/make_chartML`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error('Network response was not ok');

    }
    return response.url;
  } catch (error) {
    console.error('Error:', error);
  }
};



export const pairplot = async () => {
  try {
    const response = await fetch(`${API_URL}/api/pairplot`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.url;
  } catch (error) {
    console.error('Error:', error);
  }
};


export const summary_describe = async (model, line, startDate, endDate, selecteKPOV, selecteKPIV) => {
  try {
    const response = await fetch(`${API_URL}/api/summary_describe/${model}/${line}/${startDate}/${endDate}/${selecteKPOV}/${selecteKPIV}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error; // สามารถรีเธิร์นข้อผิดพลาดเพื่อให้การจัดการข้อผิดพลาดเกิดขึ้นในส่วนอื่นของโค้ดได้
  }
};

export const getParameterOptions = async (model) => {
  try {
    const response = await fetch(`${API_URL}/api/parameters/${model}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
export const getParameterOptions_SPC = async (process) => {
  try {
    const response = await fetch(`${API_URL}/api/get_parameters_spc/${process}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};


export const getModelOptions = async () => {
  try {
    const response = await fetch(`${API_URL}/api/model`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
export const getModelOptions_spc = async (process, start) => {
  try {
    const response = await fetch(`${API_URL}/api/model_spc/${process}/${start}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};


export const getlineOptions = async (model) => {
  try {
    const response = await fetch(`${API_URL}/api/line/${model}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
export const getlineOptions_SPC= async (model,process,start) => {
  try {
    const response = await fetch(`${API_URL}/api/line_SPC/${model}/${process}/${start}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
export const get_process = async () => {
  try {
    const response = await fetch(`${API_URL}/api/process`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
export const BinKPOV_Auto = async (model, selecteKPOV) => {
  try {
    const response = await fetch(`${API_URL}/api/BinKPOV_Auto/${model}/${selecteKPOV}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const jsonData = await response.json(); // Parse response data as JSON
    return jsonData;
  } catch (error) {
    console.error('Error:', error);
    return null; // Return null in case of an error to handle it accordingly in the caller function
  }
};


export const BIN_KPOV = async (selecteKPOV,minKPOV,maxKPIV) => {
  try {
    const response = await fetch(`${API_URL}/api/BIN_KPOV/${selecteKPOV}/${minKPOV}/${maxKPIV}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const BIN_KPIV = async (model, selecteKPOV, selecteKPIV, minKPOV, maxKPOV, support, confidence) => {
  try {
    const response = await fetch(`${API_URL}/api/BIN_KPIV/${model}/${selecteKPOV}/${selecteKPIV}/${minKPOV}/${maxKPOV}/${support}/${confidence}`);
    if (!response.ok) {
      const errorMessage = await response.text();
      if (errorMessage.includes('"undefined" is not valid JSON')) {
        return 'No rule'; // Return a string indicating no rule
      } else {
        throw new Error(errorMessage); // Throw an error with the received message
      }
    }
    const data = await response.json();
    return data; // Return the JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for handling elsewhere
  }
};


export const api_data_bin = async (model,selecteKPIV) => {
  try {
    const response = await fetch(`${API_URL}/api/data_bin/${model}/${selecteKPIV}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const API_SPC_DYNAMIC = async (model, line, start, selecteKPOV) => {
  try {
    const response = await fetch(`${API_URL}/api/Senfile_input/${model}/${line}/${start}/${selecteKPOV}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error('Network response was not ok');

    }
    return response.url;
  } catch (error) {
    console.error('Error:', error);
  }
};





export const model1 = async (startDate,endDate) => {
  try {
    const response = await fetch(`${API_URL}/api/model/${startDate}/${endDate}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};


export const line1 = async (model,startDate,endDate) => {
  try {
    console.log(`${API_URL}/api/line_Aipress/${model}/${startDate}/${endDate}`);
    const response = await fetch(`${API_URL}/api/line_Aipress/${model}/${startDate}/${endDate}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};


export const machine1 = async (line,model,startDate,endDate) => {
  try {
    const response = await fetch(`${API_URL}/api/machine/${line}/${model}/${startDate}/${endDate}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const data1 = async (model,line,MC,formattedStartDate,formattedEndDate) => {
  try {
    const response = await fetch(`${API_URL}/api/data/${model}/${line}/${MC}/${formattedStartDate}/${formattedEndDate}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.url
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};



export const fetch_data_math = async () => {
  try {
    const response = await fetch(`${API_URL}/api/fetch_data_math`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.url
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// ewms

export const PythonAPI_make_chartML_ewms = async () => {
  try {
    const response = await fetch(`${API_URL}/api/make_chartML_ewms`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error('Network response was not ok');

    }
    return response.url;
  } catch (error) {
    console.error('Error:', error);
  }
};

export const getModelOptions_ewms = async () => {
  try {
    const response = await fetch(`${API_URL}/api/get_model_ewms`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getlineOptions_ewms = async (model) => {
  try {
    const response = await fetch(`${API_URL}/api/get_line_ewms/${model}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getParameterOptions_ewms = async () => {
  try {
    const response = await fetch(`${API_URL}/api/parameters_ewms`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const BinKPOV_Auto_ewms = async (model, selecteKPOV) => {
  try {
    const response = await fetch(`${API_URL}/api/BinKPOV_Auto_ewms/${model}/${selecteKPOV}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const jsonData = await response.json(); // Parse response data as JSON
    return jsonData;
  } catch (error) {
    console.error('Error:', error);
    return null; // Return null in case of an error to handle it accordingly in the caller function
  }
};
export const BIN_KPOV_ewms = async (selecteKPOV,minKPOV,maxKPIV) => {
  try {
    const response = await fetch(`${API_URL}/api/BIN_KPOV_ewms/${selecteKPOV}/${minKPOV}/${maxKPIV}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const BIN_KPIV_ewms = async (model, selecteKPOV, selecteKPIV, minKPOV, maxKPOV, support, confidence) => {
  try {
    const response = await fetch(`${API_URL}/api/BIN_KPIV_ewms/${model}/${selecteKPOV}/${selecteKPIV}/${minKPOV}/${maxKPOV}/${support}/${confidence}`);
    if (!response.ok) {
      const errorMessage = await response.text();
      if (errorMessage.includes('"undefined" is not valid JSON')) {
        return 'No rule'; // Return a string indicating no rule
      } else {
        throw new Error(errorMessage); // Throw an error with the received message
      }
    }
    const data = await response.json();
    return data; // Return the JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for handling elsewhere
  }
};

export const summary_describe_ewms = async (model, line, startDate, endDate, selecteKPOV, selecteKPIV) => {
  try {
    const response = await fetch(`${API_URL}/api/summary_describe_ewms/${model}/${line}/${startDate}/${endDate}/${selecteKPOV}/${selecteKPIV}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error; // สามารถรีเธิร์นข้อผิดพลาดเพื่อให้การจัดการข้อผิดพลาดเกิดขึ้นในส่วนอื่นของโค้ดได้
  }
};

