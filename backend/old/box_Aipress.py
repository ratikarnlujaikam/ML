import pyodbc
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import random
from Database import create_sql_connection
from flask import send_file, Flask, jsonify, request
import os


def Select_spec():
    cnxm = create_sql_connection()
    
    cursor = cnxm.cursor()

    query1 = f" Select [USL],CL,[LSL] From [Component_Master].[dbo].[Master_matchings] where [Parameter]= 'Set_Dim_A' and [Model] = 'LONGSP' and [Part] = 'Motor_Dim'"
    dataset2 = pd.read_sql(query1,cnxm)

    cnxm.close()

    print("Select_spec",Select_spec)
    return dataset2

def Select_spec_PFH(line,Model,parameter):
    cnxm = create_sql_connection()
    
    cursor = cnxm.cursor()

    query1 = f" Select [USL],CL,[LSL] From [Component_Master].[dbo].[Master_matchings] where [Parameter]= '{parameter}' and [Model] = '{Model}' and [Part] = 'Motor_Dim'"
    dataset2 = pd.read_sql(query1,cnxm)

    cnxm.close()

    print("Select_spec_PFH",dataset2)
    return dataset2

def Select_spec_control(line,Model,parameter):
    cnxm = create_sql_connection()
    
    cursor = cnxm.cursor()

    query1 = f" SELECT [LCL],[UCL],([UCL]+[LCL])/2 as CL FROM [DataforAnalysis].[dbo].[Spec_Aipress] where Remark = 1 and Model='{Model}' and Line ='{line}' and parameter='{parameter}'"
    dataset = pd.read_sql(query1,cnxm)

    cnxm.close()

    print(f"SELECT [LCL],[UCL],([UCL]+[LCL])/2 as CL FROM [DataforAnalysis].[dbo].[Spec_Aipress] where Remark = 1 and Model='{Model}' and Line ='{line}' and parameter='{parameter}'")
    return dataset

def Data(line,Model,parameter):
        print(f"Generating chart for Line: {line}, Model: {Model}")
        cnxn = create_sql_connection()

        cursor = cnxn.cursor()

        Data3 = Select_spec()
        spec = Select_spec_control(line,Model,parameter)
        spec_PFH = Select_spec_PFH(line,Model,parameter)

        print(type(Data3))
        print(Data3)
        print(spec)

        # Query data from SQL
        query = f""" 
        SELECT top(125) [Dynamic_Parallelism_Tester].Barcode, [Ai_press].[Machine_no], [Set_Dim_A], [Set_Dim_B], [Set_Dim_C] ,Projection1,Parallelism
        FROM [Oneday_ReadtimeData].[dbo].[Dynamic_Parallelism_Tester] 
        RIGHT JOIN [Oneday_ReadtimeData].[dbo].[Ai_press] 
        ON [Ai_press].[Barcode] =  [Dynamic_Parallelism_Tester].[Barcode]
        LEFT JOIN [LinkedServer1].[IP_Address].[dbo].[List_IPAddress]
        ON [Ai_press].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
        WHERE Dynamic_Parallelism_Tester.Model = 'LONGSP' and   [Dynamic_Parallelism_Tester].Line_IP = '{line}' 
		--and [Dynamic_Parallelism_Tester].[Time] BETWEEN DATEADD(hour, -1, GETDATE()) AND GETDATE()
		and [Ai_press].[Machine_no] = 'A'
       
	   union all 
		SELECT top(125) [Dynamic_Parallelism_Tester].Barcode, [Ai_press].[Machine_no], [Set_Dim_A], [Set_Dim_B], [Set_Dim_C] ,Projection1,Parallelism
        FROM [Oneday_ReadtimeData].[dbo].[Dynamic_Parallelism_Tester] 
        RIGHT JOIN [Oneday_ReadtimeData].[dbo].[Ai_press] 
        ON [Ai_press].[Barcode] =  [Dynamic_Parallelism_Tester].[Barcode]
        LEFT JOIN [LinkedServer1].[IP_Address].[dbo].[List_IPAddress]
        ON [Ai_press].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
        WHERE Dynamic_Parallelism_Tester.Model = 'LONGSP' and   [Dynamic_Parallelism_Tester].Line_IP = '{line}' 
		--and [Dynamic_Parallelism_Tester].[Time] BETWEEN DATEADD(hour, -1, GETDATE()) AND GETDATE()
		and [Ai_press].[Machine_no] = 'B'
        """

        print("query***************************************************",query)
        datasets= pd.read_sql(query, cnxn)
    

        machine_no_dataframes = {}

        # Iterate over unique 'Machine_no' values
        for machine_no in datasets['Machine_no'].unique():
            machine_no_df = datasets[datasets['Machine_no'] == machine_no].reset_index(drop=True)
            machine_no_dataframes[machine_no] = machine_no_df
        try:    
            fig, axs = plt.subplots(1, len(machine_no_dataframes), figsize=(15, 5))
            fig.subplots_adjust(wspace=0.1)  # ปรับระยะห่างในแนวแกน x


        # fig, axs = plt.subplots(1, len(machine_no_dataframes), figsize=(6* len(machine_no_dataframes), 4))
        
            for i, (machine_no, machine_no_df) in enumerate(machine_no_dataframes.items()):
            # print("machine_no***************************************",machine_no)
            # print("machine_no_df*************************************",machine_no_df)
            
                print(f"************{machine_no} Line :{line}***********")
                data = machine_no_df[['Set_Dim_A', 'Set_Dim_B', 'Set_Dim_C','Projection1']].to_numpy()
                AVG_Parallelism= np.mean(machine_no_df['Parallelism'])
                AVG_Parallelism_rounded = round(AVG_Parallelism, 2)
                
                USL_spec_PFH = np.array([[spec_PFH['USL'],spec_PFH['USL'],spec_PFH['USL'],spec_PFH['USL']]])
                LSL_spec_PFH = np.array([[spec_PFH['LSL'],spec_PFH['LSL'],spec_PFH['LSL'],spec_PFH['LSL']]])
                USL = np.array([[Data3['USL'],Data3['USL'],Data3['USL'],Data3['USL']]])
                LSL = np.array([[Data3['LSL'],Data3['LSL'],Data3['LSL'],Data3['LSL']]])
                CL = np.array([[Data3['CL'],Data3['CL'],Data3['CL'],Data3['CL']]])
                UCL = np.array([[spec['UCL'],spec['UCL'],spec['UCL'],spec['UCL']]])
                LCL = np.array([[spec['LCL'],spec['LCL'],spec['LCL'],spec['LCL']]])
            # Boxplot with Matplotlib for the current 'Machine_no' data
                boxplot = axs[i].boxplot(data, labels=['Set_Dim_A', 'Set_Dim_B', 'Set_Dim_C','Projection1'])

            # Scatter plot for max and min values of the current 'Machine_no' data
                for j, values in enumerate(data.T):
                    max_value = np.max(values)
                    min_value = np.min(values)
                    mean_value = np.mean(values)
                    axs[i].scatter([j + 1], [max_value], color='blue', marker='o', label='Max' if j == 0 else "")
                    axs[i].scatter([j + 1], [min_value], color='green', marker='o', label='Min' if j == 0 else "")

                    axs[i].text(j + 1.1, mean_value, f'{mean_value:.4f}', verticalalignment='center', color='black')


                Line_U = np.mean(USL,axis=0)

                Line_L = np.mean(LSL,axis=0)
                C = np.arange(1,5)
                Line_CL = np.mean(CL,axis=0)
                
                UCL = np.mean(UCL,axis=0)  
                LCL = np.mean(LCL,axis=0)  
                USL_PFH = np.mean(USL_spec_PFH,axis=0)  
                LCL_PFH = np.mean(LSL_spec_PFH,axis=0)  
           
                # axs[i].plot(C, Line_L, marker='o', linestyle='-', color='red', label='LSL')
                # axs[i].plot(C, Line_U, marker='o', linestyle='-', color='red', label='USL')
                # axs[i].plot(C, Line_CL, marker='o', linestyle='--', color='red', label='CL')
             
                axs[i].plot(C, UCL, marker='o', linestyle='--', color='orange', label='UCL PFH')
                axs[i].plot(C, LCL, marker='o', linestyle='--', color='orange', label='LCL PFH')
                axs[i].plot(C, USL_PFH, marker='o', linestyle='-', color='red', label='USL PFH')
                axs[i].plot(C, LCL_PFH, marker='o', linestyle='-', color='red', label='LSL PFH')
                from datetime import datetime
                current_time = datetime.now()
                formatted_datetime = current_time.strftime("%Y-%m-%d %H:%M")
                axs[i].set_title(f'Line:{line}      Time:{formatted_datetime}  Fixture: {machine_no} \n AVG Parallelism :  {AVG_Parallelism_rounded}' )

                axs[i].legend(loc='lower left',  prop={'size': 6})
            fig.subplots_adjust(hspace=0.5)

            # เส้นทางไฟล์รูปภาพที่ต้องการบันทึก
            file_path = f"../TrainingNodeJS/chart/aipress{line}.png"

# ตรวจสอบและลบไฟล์เก่าหากมีอยู่
            if os.path.exists(file_path):
                os.remove(file_path)
                print("File removed:",file_path)

# บันทึกรูปภาพใหม่
            plt.savefig(file_path)
            plt.close()
        except ValueError as e:
            print("Error:", e)

def loop_line_database():
    cnxm = create_sql_connection()
    cursor = cnxm.cursor()

    query1 = "SELECT distinct [Spec_Aipress].[Line],[Spec_Aipress].[Model],parameter  FROM [DataforAnalysis].[dbo].[Spec_Aipress] inner join [Oneday_ReadtimeData].[dbo].[Dynamic_Parallelism_Tester] on [Spec_Aipress].Line = [Dynamic_Parallelism_Tester].Line where Remark = 1 AND [Dynamic_Parallelism_Tester].[Time] BETWEEN DATEADD(hour, -1, GETDATE()) AND GETDATE()"
    dataset2 = pd.read_sql(query1, cnxm)

    cnxm.close()
    return dataset2




from PIL import Image, ImageDraw, ImageFont, ImageOps
import datetime

def Math_graph():
    try:
        lines = loop_line_database()  # Assuming this function returns a DataFrame with a 'Line' column
        images = []  # Create a list to store images
        
        for index, row in lines.iterrows():
            line = row['Line']
            Model = row['Model']
            parameter = row['parameter']
         
            try:
                Data(line, Model, parameter)  # Create the image for each line
                image_path = f"../TrainingNodeJS/chart/aipress{line}.png"
                image = Image.open(image_path)  # Open the image for each line
                
                # Crop image to remove white borders
                image = ImageOps.crop(image, border=10)  # Adjust border size as needed
                
                # Add timestamp on image
                current_datetime = datetime.datetime.now()
                timestamp = current_datetime.strftime("%Y-%m-%d %H:%M:%S")
                draw = ImageDraw.Draw(image)
                font = ImageFont.load_default()  # You can also load a specific font
                draw.text((10, 10), f"Processed on: {timestamp}", fill="white", font=font)
                
                images.append(image)  # Add the image to the list
            except FileNotFoundError:
                # If the image file for that line is not found, create a white image
                white_image = Image.new('RGB', (200, 200), color='white')  # Create a white image with a larger size
                draw = ImageDraw.Draw(white_image)
 
        
        if images:
            # Combine images in pairs and append them below each other
            combined_images = []
            for i in range(0, len(images), 2):
                if i + 1 < len(images):
                    # Combine two images side by side
                    img1, img2 = images[i], images[i + 1]
                    combined_width = img1.width + img2.width
                    combined_height = max(img1.height, img2.height)
                    combined_image = Image.new('RGB', (combined_width, combined_height), color='white')  # Create a white background
                    combined_image.paste(img1, (0, 0))
                    
                    # Resize img2 if necessary
                    if img2.width == 100 and img2.height == 100:  # Assuming the default white image size is 100x100
                        img2 = img2.resize((img1.width, img1.height))  # Resize to match img1
                    combined_image.paste(img2, (img1.width, 0))
                else:
                    # If there's an odd number of images, just use the last one
                    combined_image = images[i]
                combined_images.append(combined_image)
            
            # Create a final image that combines all the pairwise combined images vertically
            final_height = sum(img.height for img in combined_images)
            max_width = max(img.width for img in combined_images)
            final_image = Image.new('RGB', (max_width, final_height), color='white')  # Create a white background
            
            y_offset = 0
            for img in combined_images:
                final_image.paste(img, (0, y_offset))
                y_offset += img.height
            
            # Save the final combined image
            final_image.save("../TrainingNodeJS/chart/combined_aipress.png")
            print("Combined image saved successfully.")
        else:
            # No data for any line
            print("No data available to create a combined image.")
    except Exception as e:
        print("An error occurred:", e)
        # Error fetching data or creating images
        print("Failed to fetch data or create image.")




def fetch_data_math():
    try:
            Math_graph()
            return send_file(f"../TrainingNodeJS/chart/combined_aipress.png", mimetype='image/png')
    except Exception as e:
            print("An error occurred:", e)
            # return send_file(f"../TrainingNodeJS/chart/NO_DATA.png", mimetype='image/png')
        
        
