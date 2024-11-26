from flask import Flask, jsonify
import json
import seaborn as sns
import numpy as np
import base64
import datetime
from flask import send_file, Flask, jsonify, request
from flask_cors import CORS
import pyodbc
import math
import matplotlib.pyplot as plt
import pandas as pd
import pymssql
import matplotlib
matplotlib.use('Agg')
from imblearn.over_sampling import SMOTE
from collections import Counter

from Database import create_sql_connection
from Database import create_sql_Component_Master

import pandas as pd  # Import pandas at the beginning of your script

app = Flask(__name__)
cors = CORS(app)

import logging
from flask import jsonify

def get_Process():
    try:
        # Establish a connection to the SQL Server database
        conn = create_sql_Component_Master()
        cursor = conn.cursor()

        # Execute SQL query
        cursor.execute("""
            SELECT DISTINCT [Part] as Process 
            FROM [DataforAnalysis].[dbo].[parameters]
            INNER JOIN [Component_Master].[dbo].[Master_matchings] 
            ON [parameters].[Parameter] = [Master_matchings].[Parameter]
        """)

        # Fetch the results
        rows = cursor.fetchall()

        # Create options for JSON response
        options = [{"value": row.Process, "text": row.Process} for row in rows]

        # Close the database connection
        conn.close()

        # Return JSON response
        with app.app_context():
            return jsonify(options)

    except Exception as e:
        # Log the error for further investigation
        logging.error(str(e))
        return str(e)

# Call the function and #print the result
# result = get_Process()
#print(result)
    
def get_parameters():
    try:
        # การเชื่อมต่อฐานข้อมูล SQL Server
        conn = create_sql_connection()

        cursor = conn.cursor()

        # ดึงข้อมูลจาก SQL
        cursor.execute("""
          with set1 as (SELECT DISTINCT [Part] + '>' + [parameters].[Parameter] AS parameters
            FROM [DataforAnalysis].[dbo].[parameters]
            LEFT JOIN [Component_Master].[dbo].[Master_matchings]
            ON [parameters].Parameter = [Master_matchings].Parameter
            WHERE [parameters].[Parameter] != 'P1_Attractive_1'
            AND [parameters].[Parameter] != 'P1_Stack_1'
            AND [parameters].[Parameter] != 'P2_Attractive_2'
            AND [parameters].[Parameter] != 'P2_Stack_2'
            AND [parameters].[Parameter] != 'P3_Attractive_3'
            AND [parameters].[Parameter] != 'P3_Stack_3'
            AND [parameters].[Parameter] != 'P4_Ramp_Height'
            AND [parameters].[Parameter] != 'P5_Pivot'
            AND [parameters].[Parameter] != 'P3_Attractive_3'
            AND [parameters].[Parameter] != 'Set_Dimension_Attractive'
            AND [parameters].[Parameter] != 'Set_Dimension_Stack'
            AND [parameters].[Parameter] != 'Start Torque'
            AND [parameters].[Parameter] != 'Parallelism_Attractive'
            AND [parameters].[Parameter] != 'Parallelism_Stack'
            AND [parameters].[Parameter] != 'R_max-min'
            AND [parameters].[Parameter] != 'BEMF 0-Peak'
		
            UNION
            SELECT 'Diecast_Pivot_2' AS parameters
            UNION
            SELECT 'Diecast_Ramp' AS parameters)

			select * from set1
			where parameters is not null
        """)
        rows = cursor.fetchall()

        options = [{"value": row.parameters, "text": row.parameters}
                   for row in rows]

        # ปิดการเชื่อมต่อฐานข้อมูล
        conn.close()

        return jsonify(options)

    except Exception as e:
        #print(str(e))
        return str(e)


def get_model():
    try:
        # การเชื่อมต่อฐานข้อมูล SQL Server
        conn = create_sql_Component_Master()

        cursor = conn.cursor()

        # ดึงข้อมูลจาก SQL
        cursor.execute(
            "SELECT distinct [Model] as model FROM [Component_Master].[dbo].[line_for_QRcode] where [Model] !='ALL'")
        rows = cursor.fetchall()

        options = [{"value": row.model, "text": row.model} for row in rows]

        # ปิดการเชื่อมต่อฐานข้อมูล
        conn.close()

        # ใช้ #print เพื่อแสดงข้อมูลที่คุณต้องการตรวจสอบ

        return jsonify(options)

    except Exception as e:
        # ใช้ #print เพื่อแสดงข้อผิดพลาดที่เกิดขึ้น
        #print(str(e))
        return str(e)


def get_line(model):
    try:
        # การเชื่อมต่อฐานข้อมูล SQL Server
        conn = create_sql_Component_Master()

        cursor = conn.cursor()

        # ดึงข้อมูลจาก SQL
        cursor.execute(
            "SELECT distinct [line] FROM [Component_Master].[dbo].[line_for_QRcode] WHERE [Model] != 'ALL' AND Model = '" + model + "'")
        rows = cursor.fetchall()

        options = [{"value": row.line, "text": row.line} for row in rows]

        # ปิดการเชื่อมต่อฐานข้อมูล
        conn.close()

        # ใช้ #print เพื่อแสดงข้อมูลที่คุณต้องการตรวจสอบ

        return jsonify(options)

    except Exception as e:
        # ใช้ #print เพื่อแสดงข้อผิดพลาดที่เกิดขึ้น
        #print(str(e))
        return str(e)

# global_datasets = None
# def fetch_data(model, Line, start, end, selecteKPOV, selecteKPIV):
#     global global_datasets  # ประกาศ global_datasets เป็น global
#     conn = create_sql_connection()
#     cursor = conn.cursor()
#     # #print(f"fetch_data*************************************************************",model,Line,start,end,selecteKPOV,selecteKPIV)

#     query_template = """
#     WITH Data AS (
#         SELECT [DataML_Test].Time, [DataML_Test].Barcode_motor, {selecteKPOV}, {selecteKPIV}
#         FROM [DataforAnalysis].[dbo].[DataML_Test]
#         LEFT JOIN [TransportData].[dbo].[Matching_Auto_Unit1] ON [DataML_Test].Barcode_motor = [Matching_Auto_Unit1].Barcode_Motor
#         LEFT JOIN [Diecast].[dbo].[Pivot] ON [Matching_Auto_Unit1].Barcode_Base = [Pivot].Diecast_S_N
#         WHERE [DataML_Test].[Model] = '{model}' 
#         AND [DataML_Test].[Line] = '{line}'
#         AND [DataML_Test].[Date] BETWEEN '{start}' AND '{end}'

#     )
#     SELECT {selecteKPOV}, {selecteKPIV}
#     FROM Data
   
# """
#     print(query_template)
#     # Split the comma-separated selecteKPIV into a list
#     selecteKPIV_list = selecteKPIV.split(',')
    
#     # Generate conditions for selecteKPIV columns
#     # kpi_conditions = ""
#     # for column in selecteKPIV_list:
#     #     kpi_conditions += f"AND {column.strip()} IS NOT NULL\n"

# # Generate combined condition for all selecteKPIV columns
#     # kpi_not_null_conditions = " AND ".join([f"{column} IS NOT NULL" for column in selecteKPIV_list])

# # Execute the query with parameters and fetch data
#     query = query_template.format(model=model, line=Line, start=start, end=end, selecteKPOV=selecteKPOV, selecteKPIV=','.join(selecteKPIV_list))

#     #print("SQL Query:", query)

#     datasets = pd.read_sql(query, conn)
#     datasets[selecteKPIV_list] = datasets[selecteKPIV_list].astype(float)
#     datasets = datasets.dropna()
#     global_datasets = datasets  # เก็บค่าในตัวแปร Global
#     return datasets

global_datasets = None
def fetch_data(model, Line, start, end, selecteKPOV, selecteKPIV):
    global global_datasets  # ประกาศ global_datasets เป็น global
    conn = create_sql_connection()
    cursor = conn.cursor()
    if "Diecast_Pivot_2" in selecteKPIV or "Diecast_Ramp" in selecteKPIV or selecteKPOV =="Diecast_Pivot_2" or selecteKPOV =="Diecast_Ramp":
        query_template = """
    WITH Data AS (
        SELECT {selecteKPOV}, {selecteKPIV}
        FROM [DataforAnalysis].[dbo].[DataML_Test]
        LEFT JOIN [TransportData].[dbo].[Matching_Auto_Unit1] ON [DataML_Test].Barcode_motor = [Matching_Auto_Unit1].Barcode_Motor
        LEFT JOIN [Diecast].[dbo].[Pivot] ON [Matching_Auto_Unit1].Barcode_Base = [Pivot].Diecast_S_N
        WHERE [DataML_Test].[Model] = '{model}' 
        AND [DataML_Test].[Line] = '{line}'
        AND [DataML_Test].[Date] BETWEEN '{start}' AND '{end}'
    )
    SELECT {selecteKPOV}, {selecteKPIV}
    FROM Data

    """
    else:
        query_template = """
    WITH Data AS (
        SELECT  {selecteKPOV}, {selecteKPIV}
        FROM [DataforAnalysis].[dbo].[DataML_Test]
        WHERE [DataML_Test].[Model] = '{model}' 
        AND [DataML_Test].[Line] = '{line}'
        AND [DataML_Test].[Date] BETWEEN '{start}' AND '{end}'
    )
    SELECT {selecteKPOV}, {selecteKPIV}
    FROM Data
   
    """

    print(query_template)
    # Split the comma-separated selecteKPIV into a list
    selecteKPIV_list = selecteKPIV.split(',')
    
  

# Execute the query with parameters and fetch data
    query = query_template.format(model=model, line=Line, start=start, end=end, selecteKPOV=selecteKPOV, selecteKPIV=','.join(selecteKPIV_list))

    print("SQL Query:", query)

    datasets = pd.read_sql(query, conn)
    datasets[selecteKPIV_list] = datasets[selecteKPIV_list].astype(float)

    global_datasets = datasets.dropna()
    return global_datasets

import matplotlib.pyplot as plt
from datetime import datetime

def make_chartML():

    return send_file(f"../TrainingNodeJS/chart/heatmap.png", mimetype='image/png')

def pairplot():

    return send_file(f"../TrainingNodeJS/chart/pairplot.png", mimetype='image/png')

def summary_describe(model, line, start, end, selecteKPOV, selecteKPIV):
    fetch_data(model, line, start, end, selecteKPOV, selecteKPIV)
    datasets = global_datasets
    summary = datasets.describe(include='all')
    summary_json = summary.to_json()
    summary_json = summary_json.replace('null', 'No data')

    if datasets is None or datasets.empty:
        return "No data available"

    corrmat = datasets.corr()
    f, ax = plt.subplots(figsize=(12, 9))
    sns.heatmap(corrmat, vmax=.8, square=True, cmap='coolwarm', annot=True)

    current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    info_text = f"Model: {model}\nLine: {line}\nDate: {current_datetime}"
    plt.text(0.5, 1.05, info_text, horizontalalignment='center', verticalalignment='center', transform=ax.transAxes)
    plt.savefig('../TrainingNodeJS/chart/heatmap.png')
    plt.close()

    try:
        pairplot = sns.pairplot(datasets, height=4)
        pairplot.savefig('../TrainingNodeJS/chart/pairplot.png')
        plt.close()
    except MemoryError as e:
        print(f"Error: {e}")
        print("Not enough memory to create the pairplot. Skipping this plot.")

    return summary_json


def BinKPOV_Auto(model, selecteKPOV):
    conn = create_sql_connection()
    cursor = conn.cursor()
    
    query = """
     SELECT
      [Parameter] as KPOV
      ,[LSL] as MinKPOV
	  ,[CL] as specValue
      ,[USL] as MaxKPOV
    FROM [Component_Master].[dbo].[Master_matchings]
    where [Model]=? and [Parameter]=?
    """
    
    Output_BinKPOV = pd.read_sql(query, conn, params=(model, selecteKPOV))
    #print(Output_BinKPOV)
    # Convert the DataFrame to a dictionary
    result = Output_BinKPOV.to_dict(orient='records')
    #print(result)
    # Return the result as JSON response
    return jsonify(result)
global_datasets = None

def BIN_KPOV( selecteKPOV, minKPOV, maxKPOV):
    global global_datasets
    
    try:
        data = global_datasets.copy()
        
        # Check if the selected KPOV column contains any null values
        if data[selecteKPOV].isnull().any():
            return {"error": f"The column {selecteKPOV} contains null values"}

        # Perform data binning
        data[selecteKPOV] = pd.cut(
            data[selecteKPOV],
            bins=[-np.inf, float(minKPOV), float(maxKPOV), np.inf],
            labels=['fail_low', 'Pass', 'fail_high']
        )

        # Replace 'fail_low' and 'fail_high' with 'fail' in the KPOV column
        data[selecteKPOV].replace(['fail_low', 'fail_high'], 'fail', inplace=True)
        
        # Count the occurrences of different values in the original KPOV data
        count_before_smote = dict(Counter(data[selecteKPOV]))
        print("Count of values before SMOTE:", count_before_smote)

        k = 3
        X = data.loc[:, data.columns != selecteKPOV]
        y = data[selecteKPOV]

        # Sampling strategy
        sm = SMOTE(sampling_strategy='minority', k_neighbors=k, random_state=100)
        X_res, y_res = sm.fit_resample(X, y)

        # Concatenate the resampled data
        datasets = pd.concat([pd.DataFrame(X_res), pd.DataFrame(y_res)], axis=1)

        # Replace 'fail_low' and 'fail_high' with 'fail' in the resampled KPOV data
        datasets[selecteKPOV].replace(['fail_low', 'fail_high'], 'fail', inplace=True)

        # Count the occurrences of different values in the resampled KPOV data
        count_after_smote = dict(Counter(datasets[selecteKPOV]))

        # Convert the DataFrame to a JSON object
        json_data = datasets.to_json(orient='records')

        # Create a dictionary to include the count results in the JSON response
        print("Count of values after SMOTE:", count_after_smote)
        response_data = {
            "data": json_data,
            "count_before_smote": count_before_smote,
            "count_after_smote": count_after_smote
        }
        return response_data

    except Exception as e:
        # Handle the error here, send error message to the frontend
        error_message = str(e)
        print("An error occurred:", error_message)
        return {"error": error_message}


def data_bin(model, selecteKPIV):
    conn = create_sql_connection()
    cursor = conn.cursor()
    #print("data_bin", selecteKPIV)
    selecteKPIV_01 = selecteKPIV.split(',')
    
    result_datasets = []
    query = ""
    for KPIV in selecteKPIV_01:
        query_template = """
     WITH set1 AS (
        SELECT
            [id],
            [Fullname],
            [Model],
            [Parameter],
            [USL],
            [LSL],
            CL,
            [USL] - [LSL] AS "X",
            ([USL] - [LSL]) / 6 AS "Y",
			([USL] - [LSL]) / 7 AS "N",
            [Part],
            [Machine],
            [empNumber],
            [createdAt],
            [updatedAt]
        FROM [Component_Master].[dbo].[Master_matchings]
    )


    SELECT
        [Model],
        [Parameter],
		[LSL],
        CASE 
		WHEN [LSL] != 0 THEN '-infinity'
		ELSE  '0'
		END AS "MIN_L4",
        CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] - 0.0001, 4)
		ELSE  ROUND(N - 0.0001, 4)
		END AS "MAX_L4",

		CASE 
		WHEN [LSL] != 0 THEN ROUND ([LSL] , 4)
		ELSE ROUND (N , 4)
		END AS MIN_L3,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 1 * [Y]- 0.0001, 4)
		ELSE ROUND(N + 1 * N - 0.0001, 4)
		END AS MAX_L3,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 1 * [Y], 4)
		ELSE ROUND(N + 1 * N, 4)
		END AS MIN_L2,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 2 * [Y]- 0.0001, 4)
		ELSE ROUND(N + 2 * N - 0.0001, 4)
		END AS MAX_L2,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 2 * [Y], 4)
		ELSE ROUND(N + 2 * N, 4)
		END AS MIN_L1,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 3 * [Y] - 0.0001, 4)
		ELSE ROUND(N + 3 * N - 0.0001, 4)
		END AS MAX_L1,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 3 * [Y] , 4)
		ELSE ROUND(N + 3 * N, 4)
		END AS MIN_U1,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 4 * [Y] - 0.0001, 4)
		ELSE ROUND(N + 4 * N - 0.0001, 4)
		END AS MAX_U1,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 4 * [Y] , 4)
		ELSE ROUND(N + 4 * N, 4)
		END  AS MIN_U2,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 5 * [Y] - 0.0001, 4)
		ELSE ROUND(N + 5 * N - 0.0001, 4)
		END  AS MAX_U2,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 5 * [Y] , 4)
		ELSE ROUND(N + 5 * N, 4)
		END  AS MIN_U3,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 6 * [Y] , 4)
		ELSE ROUND(N + 6 * N , 4)
		END  AS MAX_U3,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 6 * [Y] + 0.0001, 4)
		ELSE ROUND(N + 6 * N + 0.0001, 4)
		END  AS MIN_U4,
		'+infinity' as [MAX_U4]
		FROM set1
        WHERE [Model] = '{model}' AND [Parameter] = '{KPIV}'

        """

        query = query_template.format(model=model, KPIV=KPIV)  # Format the query string
        datasets_bin = pd.read_sql(query, conn)
        
        # Convert the DataFrame to a list of dictionaries
        datasets_bin_dict = datasets_bin.to_dict(orient='records')
        
        result_datasets.append(datasets_bin_dict)
    return result_datasets


def data_bin_Table(model, selecteKPIV):
    conn = create_sql_connection()
    cursor = conn.cursor()
    
    query_template = """
        DECLARE @pivot_columns NVARCHAR(MAX);
DECLARE @query NVARCHAR(MAX);

-- สร้างรายการคอลัมน์ที่ใช้ใน PIVOT
SET @pivot_columns = STUFF(
    (SELECT DISTINCT ',' + QUOTENAME(LTRIM(RTRIM([Parameter])))
    FROM [Component_Master].[dbo].[Master_matchings]
    WHERE [Parameter] != ''
    FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '');

-- สร้างคำสั่ง SQL ที่ใช้ PIVOT
SET @query = '
  WITH set1 AS (
        SELECT
            [id],
            [Fullname],
            [Model],
            [Parameter],
            [USL],
            [LSL],
            CL,
            [USL] - [LSL] AS "X",
            ([USL] - [LSL]) / 6 AS "Y",
			([USL] - [LSL]) / 7 AS "N",
            [Part],
            [Machine],
            [empNumber],
            [createdAt],
            [updatedAt]
        FROM [Component_Master].[dbo].[Master_matchings]
		WHERE [Model] = ''${model}''  
    )


  ,set2 as (  SELECT
        [Model],
        [Parameter],
		[LSL],
        CASE 
		WHEN [LSL] != 0 THEN ''-infinity''
		ELSE  ''0''
		END AS "MIN_L4",
        CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] - 0.0001, 4)
		ELSE  ROUND(N - 0.0001, 4)
		END AS "MAX_L4",

		CASE 
		WHEN [LSL] != 0 THEN ROUND ([LSL] , 4)
		ELSE ROUND (N , 4)
		END AS MIN_L3,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 1 * [Y]- 0.0001, 4)
		ELSE ROUND(N + 1 * N - 0.0001, 4)
		END AS MAX_L3,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 1 * [Y], 4)
		ELSE ROUND(N + 1 * N, 4)
		END AS MIN_L2,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 2 * [Y]- 0.0001, 4)
		ELSE ROUND(N + 2 * N - 0.0001, 4)
		END AS MAX_L2,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 2 * [Y], 4)
		ELSE ROUND(N + 2 * N, 4)
		END AS MIN_L1,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 3 * [Y] - 0.0001, 4)
		ELSE ROUND(N + 3 * N - 0.0001, 4)
		END AS MAX_L1,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 3 * [Y] , 4)
		ELSE ROUND(N + 3 * N, 4)
		END AS MIN_U1,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 4 * [Y] - 0.0001, 4)
		ELSE ROUND(N + 4 * N - 0.0001, 4)
		END AS MAX_U1,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 4 * [Y] , 4)
		ELSE ROUND(N + 4 * N, 4)
		END  AS MIN_U2,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 5 * [Y] - 0.0001, 4)
		ELSE ROUND(N + 5 * N - 0.0001, 4)
		END  AS MAX_U2,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 5 * [Y] , 4)
		ELSE ROUND(N + 5 * N, 4)
		END  AS MIN_U3,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 6 * [Y] , 4)
		ELSE ROUND(N + 6 * N , 4)
		END  AS MAX_U3,

		CASE 
		WHEN [LSL] != 0 THEN ROUND([LSL] + 6 * [Y] + 0.0001, 4)
		ELSE ROUND(N + 6 * N + 0.0001, 4)
		END  AS MIN_U4,
		''+infinity'' as [MAX_U4]
		FROM set1
      
)
SELECT * 
FROM (
    SELECT [Parameter], 0 as MAX_U4 , ''4 Max'' as Rule_3
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MAX_U4)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable
UNION ALL
--------''4''
SELECT * 
FROM (
    SELECT [Parameter],[MIN_U4], ''4 Min'' as Rule_Test
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MIN_U4)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable


--------''3''
UNION ALL
SELECT * 
FROM (
    SELECT [Parameter], MAX_U3 , ''3 Max'' as Rule_3
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MAX_U3)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable

UNION ALL
SELECT * 
FROM (
    SELECT [Parameter], [MIN_U3], ''3 Min'' as Rule_Test
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MIN_U3)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable

--------''2''
UNION ALL
SELECT * 
FROM (
    SELECT [Parameter], MAX_U2 , ''2 Max'' as Rule_3
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MAX_U2)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable
UNION ALL
SELECT * 
FROM (
    SELECT [Parameter], [MIN_U2], ''2 Min'' as Rule_Test
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MIN_U2)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable

--------''1''

UNION ALL
SELECT * 
FROM (
    SELECT [Parameter], MAX_U1 , ''1 Max'' as Rule_3
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MAX_U1)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable


UNION ALL

SELECT * 
FROM (
    SELECT [Parameter], [MIN_U1], ''1 Min'' as Rule_Test
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MIN_U1)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable

UNION ALL
SELECT * 
FROM (
    SELECT [Parameter], MAX_L1 , ''-1 Max'' as Rule_3
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MAX_L1)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable

UNION ALL
------''-1''
SELECT * 
FROM (
    SELECT [Parameter], [MIN_L1], ''-1 Min'' as Rule_Test
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MIN_L1)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable


UNION ALL
SELECT * 
FROM (
    SELECT [Parameter], MAX_L2 , ''-2 Max'' as Rule_3
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MAX_L2)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable

UNION ALL
------''-2''
SELECT * 
FROM (
    SELECT [Parameter], [MIN_L2], ''-2 Min'' as Rule_Test
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MIN_L2)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable




UNION ALL
SELECT * 
FROM (
    SELECT [Parameter], MAX_L3 , ''-3 Max'' as Rule_3
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MAX_L3)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable

UNION ALL
------''-3''
SELECT * 
FROM (
    SELECT [Parameter], [MIN_L3], ''-3 Min'' as Rule_Test
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MIN_L3)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable

UNION ALL
SELECT * 
FROM (
    SELECT [Parameter], MAX_L4 , ''-4 Max'' as Rule_3
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MAX_L4)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable

UNION ALL
------''-4''
SELECT * 
FROM (
    SELECT [Parameter], 0 as [MIN_L4], ''-4 Min'' as Rule_Test
    FROM set2
) AS SourceTable
PIVOT
(
    SUM(MIN_L4)
    FOR [Parameter] IN (' + @pivot_columns + ')
) AS PivotTable


';
-- ดำเนินการเรียกคำสั่ง SQL
EXEC sp_executesql @query;

        """  

    query = query_template.format(model=model, selecteKPIV=selecteKPIV)  # Format the query string
    datasets_bin = pd.read_sql(query, conn)
    #print(query)
    result_json = datasets_bin.to_json(orient='records')
    
    return jsonify(result_json)


def api_data_bin(model, selecteKPIV):
    selecteKPIV = selecteKPIV.split(',')
    result_datasets = data_bin_Table(model, selecteKPIV)
    return result_datasets


import re
import pandas as pd
import numpy as np
from pyarc import CBA, TransactionDB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

def process_kpiv(datasets_data, KPIV, dataset_query):
    LCL_4 = dataset_query.get('MAX_L4', '-infinity')
    LCL_3 = dataset_query.get('MAX_L3', '-infinity')
    LCL_2 = dataset_query.get('MAX_L2', '-infinity')
    LCL_1 = dataset_query.get('MAX_L1', '-infinity')
    UCL_1 = dataset_query.get('MAX_U1', '+infinity')
    UCL_2 = dataset_query.get('MAX_U2', '+infinity')
    UCL_3 = dataset_query.get('MAX_U3', '+infinity')

    # Cut the KPIV column and assign it back
    datasets_data[KPIV] = pd.cut(
        datasets_data[KPIV],
        bins=[-np.inf, float(LCL_4), float(LCL_3), float(LCL_2), float(LCL_1), float(UCL_1),
              float(UCL_2), float(UCL_3), np.inf],
        labels=['-4', '-3', '-2', '-1', '1', '2', '3', '4'],
    )

    return datasets_data[KPIV]

def BIN_KPIV(model, selecteKPOV, selecteKPIV, minKPOV, maxKPOV, support, confidence):
    
    selecteKPIV_01 = selecteKPIV.split(',')
    datasets_bin_query = data_bin(model, selecteKPIV)

    if datasets_bin_query and len(datasets_bin_query) > 0:
        # Call BIN_KPOV once
        datasets = BIN_KPOV(selecteKPOV, minKPOV, maxKPOV)  # ส่ง KPIV ไปให้ BIN_KPOV

        if isinstance(datasets, dict) and 'data' in datasets:
            datasets_data = pd.read_json(datasets['data'])
            print(f"*****************************************************************datasets_data", datasets_data)

            binned_data = pd.DataFrame()
            for KPIV in selecteKPIV_01:
                if KPIV in datasets_data.columns:
                    dataset_query = next((query[0] for query in datasets_bin_query if query and len(query) > 0 and query[0].get('Model') == model and query[0].get('Parameter') == KPIV), None)
                    
                    if dataset_query:
                        binned_data[KPIV] = process_kpiv(datasets_data, KPIV, dataset_query)
                        print("binned_data************************************************************************************", binned_data)

            # รวมข้อมูล Projection1 เข้ากับ binned_data
            binned_data = pd.merge(binned_data, datasets_data[selecteKPOV], left_index=True, right_index=True)

            selectKPOV_list = [selecteKPOV]
            selected_columns = selecteKPIV_01 + selectKPOV_list
            print("******************************selected_columns", selected_columns)
            binned_data = binned_data[selected_columns]
            print("******************************binned_data", binned_data)

            train, test = train_test_split(binned_data, test_size=0.1)
            txns_train = TransactionDB.from_DataFrame(train)
            txns_test = TransactionDB.from_DataFrame(test)

            combined_str = "0." + confidence
            support_float = "0." + support

            cba = CBA(support=float(support_float), confidence=float(combined_str), algorithm='m1')
            cba.fit(txns_train)

            y_pred = cba.predict(txns_test)
            y_test = test[selecteKPOV]

            classification_results = classification_report(y_test, y_pred, zero_division=1, output_dict=True)
            df_classification_results = pd.DataFrame(classification_results).transpose()
            df_classification_results.index.name = 'Class'

            text = str(cba.clf.rules)
            try:
                if not text:
                    print("No rule")
                    return {"error": "No rule"}
                else:
                    print("df_rules:", text)
            except Exception as e:
                error_message = str(e)
                print("Error:", error_message)
                return {"error": error_message}

            rules = re.findall(r'CAR {(.*?)} => {(.*?)} sup: (.*?) conf: (.*?) len: (.*?), id: (.*?)(?=, CAR|$)', text)
            if not rules:
                print("No rule")
                return {"error": "No rule"}
            data = []

            for rule in rules:
                try:
                    KPIV_data, KPOV_data, sup, conf, length, rule_id = rule
                    KPIV = {}
                    for item in KPIV_data.split(','):
                        if '=' in item:
                            key, value = item.split('=', 1)
                            KPIV[key] = value
                        else:
                            print(f"Malformed item: {item}")
                    KPIV.update({'sup': sup, 'conf': conf, 'len': length, 'id': rule_id, selecteKPOV: KPOV_data})
                    data.append(KPIV)
                except IndexError as e:
                    print(f"Error processing rule: {rule}. Error: {e}")
                    continue

            df = pd.DataFrame(data)

            if df.empty:
                return {"error": "No valid rule found"}

            df['index'] = range(len(df))
            df[selecteKPOV] = df[selecteKPOV].apply(lambda x: 'Pass' if 'Pass' in x else 'fail')
            df.sort_values(by=[selecteKPOV, 'sup'], inplace=True)
            df['index'] = range(1, len(df) + 1)

            print("df_rules", df)

            json_data = df.where(pd.notna(df), None).to_dict(orient='records')
            classification_results_json = df_classification_results.to_json(orient='records')

            response_data = {
                "json_data": json_data,
                "classification_results_json": classification_results_json
            }

            return response_data
    else:
        return {"error": "No datasets found"}




