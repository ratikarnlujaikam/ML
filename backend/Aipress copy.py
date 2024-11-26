import pyodbc
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import random
from Database import create_sql_connection
from flask import send_file, Flask, jsonify, request
import os

def Select_Model():
    try:
        con3 = create_sql_connection()
    
        cursor = con3.cursor()

        cursor.execute ("Select distinct [Dynamic_Parallelism_Tester].[Model] FROM [Oneday_ReadtimeData].[dbo].[Dynamic_Parallelism_Tester] RIGHT JOIN [Oneday_ReadtimeData].[dbo].[Ai_press] ON [Ai_press].[Barcode] =  [Dynamic_Parallelism_Tester].[Barcode] where Dynamic_Parallelism_Tester.Model != ''")

        rows = cursor.fetchall()

        options = [{"value": row.Model, "text": row.Model} for row in rows]

        # dataset2 = pd.read_sql(query2,con3)

        print("+++++++++++++++++++++++++++++++++++++++++++++",options)

        con3.close()
        return jsonify(options)
    except Exception as e:
        return str(e)

# Input_Model = Select_Model()

def Select_Line(model):
    try:
        con1 = create_sql_connection()
        cursor1 = con1.cursor()

        cursor1.execute (f""" Select distinct [Dynamic_Parallelism_Tester].Line_IP FROM [Oneday_ReadtimeData].[dbo].[Dynamic_Parallelism_Tester] RIGHT JOIN [Oneday_ReadtimeData].[dbo].[Ai_press] ON [Ai_press].[Barcode] =  [Dynamic_Parallelism_Tester].[Barcode]
         where [Dynamic_Parallelism_Tester].[Model]= '{model}'""")


        rows = cursor1.fetchall()

        options = [{"value": row.Line, "text": row.Line} for row in rows]



        con1.close()
        return jsonify(options)

    except Exception as e:
        return str(e)

# model='LONGSP'
# line ='1-4'

# Input_line = Select_Line(model)

def Select_MC(line):
    try:
        con1 = create_sql_connection()
        cursor1 = con1.cursor()

        cursor1.execute(f""" Select distinct [Dynamic_Parallelism_Tester].[Machine_no] FROM [Oneday_ReadtimeData].[dbo].[Dynamic_Parallelism_Tester]
left join [LinkedServer1].[IP_Address].[dbo].[List_IPAddress] ON [Dynamic_Parallelism_Tester].[IP] COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
where [[Dynamic_Parallelism_Tester].Line_IP= '{line}'""")
        
        print(f""" Select distinct [Dynamic_Parallelism_Tester].[Machine_no] FROM [Oneday_ReadtimeData].[dbo].[Dynamic_Parallelism_Tester]
left join [LinkedServer1].[IP_Address].[dbo].[List_IPAddress] ON [Dynamic_Parallelism_Tester].[IP] COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
where [Dynamic_Parallelism_Tester].Line_IP = '{line}'""")
       
        
        # dataset3 = pd.read_sql(query3,con1)

        rows = cursor1.fetchall()

        options = [{"value": row.Machine_no, "text": row.Machine_no} for row in rows]

        print(options)

        con1.close()
        return jsonify(options)

    except Exception as e:
        return str(e)

# from database import create_sql_Component_Master
def Select_spec(model):
    cnxm = create_sql_connection()
    
    cursor = cnxm.cursor()

    query1 = f" Select [USL],CL,[LSL] From [Component_Master].[dbo].[Master_matchings] where [Parameter]= 'Set_Dim_A' and [Model] = '{model}' and [Part] = 'Motor_Dim'"
    dataset2 = pd.read_sql(query1,cnxm)

    cnxm.close()

    print(dataset2)
    return dataset2

# Data2 = Select_spec()
import matplotlib
matplotlib.use('Agg')  # ใช้ Agg backend แทน GUI backend
import json
def Data(model, line, MC, StartDate, EndDate):

        cnxn = create_sql_connection()

        cursor = cnxn.cursor()

        Data3 = Select_spec(model)

        print(type(Data3))
        print(Data3)

        # Query data from SQL
        query = f""" 
        SELECT distinct [Dynamic_Parallelism_Tester].Barcode, [Ai_press].[Machine_no], [Set_Dim_A], [Set_Dim_B], [Set_Dim_C] 
        FROM [Oneday_ReadtimeData].[dbo].[Dynamic_Parallelism_Tester] 
        RIGHT JOIN [Oneday_ReadtimeData].[dbo].[Ai_press] 
        ON [Ai_press].[Barcode] =  [Dynamic_Parallelism_Tester].[Barcode]
        LEFT JOIN [LinkedServer1].[IP_Address].[dbo].[List_IPAddress]
        ON [Ai_press].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
        WHERE Dynamic_Parallelism_Tester.Model = '{model}' and   [List_IPAddress].[Line] = '{line}' AND [Dynamic_Parallelism_Tester].[Machine_no] = '{MC}' AND [Dynamic_Parallelism_Tester].[Time] BETWEEN '{StartDate}' AND '{EndDate}'
        ORDER BY [Ai_press].[Machine_no];
        """

        print("edit test***************************************************",query)

        print("test 1***************************************************",query)
        print("test 2***************************************************",query)
        datasets= pd.read_sql(query, cnxn)
    




        # Create an empty dictionary to store DataFrames for each 'Machine_no'
        machine_no_dataframes = {}

        # Iterate over unique 'Machine_no' values
        for machine_no in datasets['Machine_no'].unique():
            machine_no_df = datasets[datasets['Machine_no'] == machine_no].reset_index(drop=True)
            machine_no_dataframes[machine_no] = machine_no_df
            
            # print("machine_no",machine_no)
            # print("machine_no_df",machine_no_df)
            # print("machine_no_dataframes",machine_no_dataframes)

        # subplots(1, len(machine_no_dataframes)
        # subplots = เงื่อนไข(row,column)  
        # len คือ การนับ จำนวน 
        fig, axs = plt.subplots(len(machine_no_dataframes), 1, figsize=(6, 4* len(machine_no_dataframes)))

        # fig, axs = plt.subplots(1, len(machine_no_dataframes), figsize=(6* len(machine_no_dataframes), 4))
        
        for i, (machine_no, machine_no_df) in enumerate(machine_no_dataframes.items()):
            # print("machine_no***************************************",machine_no)
            # print("machine_no_df*************************************",machine_no_df)
            data = machine_no_df[['Set_Dim_A', 'Set_Dim_B', 'Set_Dim_C']].to_numpy()

            USL = np.array([[Data3['USL'],Data3['USL'],Data3['USL']]])
            LSL = np.array([[Data3['LSL'],Data3['LSL'],Data3['LSL']]])
            CL = np.array([[Data3['CL'],Data3['CL'],Data3['CL']]])

            # Boxplot with Matplotlib for the current 'Machine_no' data
            boxplot = axs[i].boxplot(data, labels=['Set_Dim_A', 'Set_Dim_B', 'Set_Dim_C'])

            # Scatter plot for max and min values of the current 'Machine_no' data
            for j, values in enumerate(data.T):
                max_value = np.max(values)
                min_value = np.min(values)
                axs[i].scatter([j + 1], [max_value], color='blue', marker='o', label='Max' if j == 0 else "")
                axs[i].scatter([j + 1], [min_value], color='green', marker='o', label='Min' if j == 0 else "")


            # Line plot for the mean of the current 'Machine_no' data
            U = np.arange(1,4)
            Line_U = np.mean(USL,axis=0)
            L = np.arange(1,4)
            Line_L = np.mean(LSL,axis=0)
            C = np.arange(1,4)
            Line_CL = np.mean(CL,axis=0)

            axs[i].plot(L, Line_L, marker='o', linestyle='-', color='red', label='LSL')
            axs[i].plot(U, Line_U, marker='o', linestyle='-', color='red', label='USL')
            axs[i].plot(C, Line_CL, marker='o', linestyle='--', color='#90D26D', label='CL')

            # Add details
            axs[i].set_title(f'Boxplot with Fixture {machine_no} {model} Line :{line}')
            axs[i].legend(loc='lower left',  prop={'size': 6})
        fig.subplots_adjust(hspace=0.5)

        plt.savefig("../TrainingNodeJS/chart/aipress.png")  # บันทึกรูปภาพใหม่
        plt.close()

        return send_file(f"../TrainingNodeJS/chart/aipress"+".png", mimetype='image/png')

    

def fetch_data(model, line, MC, StartDate, EndDate):
    try:
            Data2 = Data(model, line, MC, StartDate, EndDate)
            print(Data2)
            return send_file(f"../TrainingNodeJS/chart/aipress.png", mimetype='image/png')
    except Exception as e:
            print("An error occurred:", e)
            return send_file(f"../TrainingNodeJS/chart/NO_DATA.png", mimetype='image/png')


    


# Call the function to fetch and plot the data boxplot
# Data01 = fetch_data()

# print(Data01)

