import pyodbc
from Date_All_process import Date_between
import pandas as pd
import numpy as np
from flask import send_file, Flask, jsonify, request

Date_BT = Date_between()
from Database import create_sql_connection 
from Database import create_sql_Component_Master
from flask import jsonify 


import pyodbc
from Date_All_process import Date_between
import pandas as pd
import numpy as np

Date_BT = Date_between()



def fetch_data(model, line, start, Parameter ,MC_NAME):
    print("------------------------------------------------------Fetching data-------------------------------")
    print("model",model)
    print("line",line)
    print("start",start)
    print("Parameter",Parameter)
    print("MC_NAME",MC_NAME)
    conn = create_sql_connection()
    cursor = conn.cursor()
    if MC_NAME == 'Hipot':
            print("Condition: Hipot")
            query_template = f"""
        SELECT [DataforAnalysis].[dbo].[Hipot].[Time]
              ,cast(DATEPART(hour,[DataforAnalysis].[dbo].[Hipot].[Time]) as varchar) as [hr]
              ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Hipot].[Time]) over (order by [DataforAnalysis].[dbo].[Hipot].[Time] desc) - [DataforAnalysis].[dbo].[Hipot].[Time]) as time)) < 120 
              then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Hipot].[Time]) over (order by [DataforAnalysis].[dbo].[Hipot].[Time] desc) - [DataforAnalysis].[dbo].[Hipot].[Time]) as time)) 
              when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Hipot].[Time]) over (order by [DataforAnalysis].[dbo].[Hipot].[Time] desc) - [DataforAnalysis].[dbo].[Hipot].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
              ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Hipot].[Time]) over (order by [DataforAnalysis].[dbo].[Hipot].[Time] desc) - [DataforAnalysis].[dbo].[Hipot].[Time]) as time)) >= 120 
              then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Hipot].[Time]) over (order by [DataforAnalysis].[dbo].[Hipot].[Time] desc) - [DataforAnalysis].[dbo].[Hipot].[Time]) as time)) 
              when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Hipot].[Time]) over (order by [DataforAnalysis].[dbo].[Hipot].[Time] desc) - [DataforAnalysis].[dbo].[Hipot].[Time]) as time)) < 120 then 0 end as [D/T]
              ,[DataforAnalysis].[dbo].[Hipot].{Parameter} as [Parameter]
              ,[DataforAnalysis].[dbo].[Hipot].[Model] as [model]
              ,[Component_Master].[dbo].[Master_matchings].LSL as [LSL]
              ,[Component_Master].[dbo].[Master_matchings].CL as [CL]
              ,[Component_Master].[dbo].[Master_matchings].USL as [USL]
              ,Hipot.Machine_no as [AVG]
              ,[DataforAnalysis].[dbo].[Hipot].Barcode
              FROM [DataforAnalysis].[dbo].[Hipot]
              INNER JOIN [Component_Master].[dbo].[Master_matchings]
              ON [DataforAnalysis].[dbo].[Hipot].Model = [Component_Master].[dbo].[Master_matchings].Model
              left join [LinkedServer1].[IP_Address].[dbo].[List_IPAddress]
              ON [Hipot].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
              WHERE 
                  CONVERT(DATE,[DataforAnalysis].[dbo].[Hipot].[Time]) = ?
                  AND [DataforAnalysis].[dbo].[Hipot].[Model] = ?
                  AND [List_IPAddress].[Line] = ?
                  AND [Component_Master].[dbo].[Master_matchings].[Parameter] = ?

                      and {Parameter} < 100 and {Parameter} > 0
                      
                  """
    elif  MC_NAME == 'Dynamic_Parallelism_Tester':
        print("Condition: Dynamic_Parallelism_Tester")
        query_template = f"""
        SELECT [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]
              ,cast(DATEPART(hour,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar) as [hr]
              ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) < 120 
              then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) 
              when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
              ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) >= 120 
              then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) 
              when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) < 120 then 0 end as [D/T]
              ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].{Parameter} as [Parameter]
              ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] as [model]
              ,[Component_Master].[dbo].[Master_matchings].LSL as [LSL]
              ,[Component_Master].[dbo].[Master_matchings].CL as [CL]
              ,[Component_Master].[dbo].[Master_matchings].USL as [USL]
              ,Dynamic_Parallelism_Tester.Machine_no as [AVG]
              ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].Barcode
              FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
              INNER JOIN [Component_Master].[dbo].[Master_matchings]
              ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].Model = [Component_Master].[dbo].[Master_matchings].Model
              left join [LinkedServer1].[IP_Address].[dbo].[List_IPAddress]
              ON [Dynamic_Parallelism_Tester].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
              WHERE 
                  CONVERT(DATE,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) = ?
                  AND [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = ?
                  AND [List_IPAddress].[Line] = ?
                  AND [Component_Master].[dbo].[Master_matchings].[Parameter] = ?
    
    """
    elif  MC_NAME == 'EWMS':
        print("Condition: EWMS")
        query_template = f"""
        SELECT [DataforAnalysis].[dbo].[EWMS].[Time]
              ,cast(DATEPART(hour,[DataforAnalysis].[dbo].[EWMS].[Time]) as varchar) as [hr]
              ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[EWMS].[Time]) over (order by [DataforAnalysis].[dbo].[EWMS].[Time] desc) - [DataforAnalysis].[dbo].[EWMS].[Time]) as time)) < 120 
              then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[EWMS].[Time]) over (order by [DataforAnalysis].[dbo].[EWMS].[Time] desc) - [DataforAnalysis].[dbo].[EWMS].[Time]) as time)) 
              when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[EWMS].[Time]) over (order by [DataforAnalysis].[dbo].[EWMS].[Time] desc) - [DataforAnalysis].[dbo].[EWMS].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
              ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[EWMS].[Time]) over (order by [DataforAnalysis].[dbo].[EWMS].[Time] desc) - [DataforAnalysis].[dbo].[EWMS].[Time]) as time)) >= 120 
              then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[EWMS].[Time]) over (order by [DataforAnalysis].[dbo].[EWMS].[Time] desc) - [DataforAnalysis].[dbo].[EWMS].[Time]) as time)) 
              when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[EWMS].[Time]) over (order by [DataforAnalysis].[dbo].[EWMS].[Time] desc) - [DataforAnalysis].[dbo].[EWMS].[Time]) as time)) < 120 then 0 end as [D/T]
              ,[DataforAnalysis].[dbo].[EWMS].{Parameter} as [Parameter]
              ,[DataforAnalysis].[dbo].[EWMS].[Model] as [model]
              ,[Component_Master].[dbo].[Master_matchings].LSL as [LSL]
              ,[Component_Master].[dbo].[Master_matchings].CL as [CL]
              ,[Component_Master].[dbo].[Master_matchings].USL as [USL]
              ,EWMS.Machine_no as [AVG]
              ,[DataforAnalysis].[dbo].[EWMS].Barcode
              FROM [DataforAnalysis].[dbo].[EWMS]
              INNER JOIN [Component_Master].[dbo].[Master_matchings]
              ON [DataforAnalysis].[dbo].[EWMS].Model = [Component_Master].[dbo].[Master_matchings].Model
              left join [LinkedServer1].[IP_Address].[dbo].[List_IPAddress]
              ON [EWMS].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
              WHERE 
                  CONVERT(DATE,[DataforAnalysis].[dbo].[EWMS].[Time]) = ?
                  AND [DataforAnalysis].[dbo].[EWMS].[Model] = ?
                  AND [List_IPAddress].[Line] = ?
                  AND [Component_Master].[dbo].[Master_matchings].[Parameter] = ?

    """
    elif  MC_NAME == 'Dimension_WR':
        print("Condition: Dimension_WR")
        query_template = f"""
          SELECT [DataforAnalysis].[dbo].[Dimension_WR].[Time]
              ,cast(DATEPART(hour,[DataforAnalysis].[dbo].[Dimension_WR].[Time]) as varchar) as [hr]
              ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dimension_WR].[Time]) over (order by [DataforAnalysis].[dbo].[Dimension_WR].[Time] desc) - [DataforAnalysis].[dbo].[Dimension_WR].[Time]) as time)) < 120 
              then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dimension_WR].[Time]) over (order by [DataforAnalysis].[dbo].[Dimension_WR].[Time] desc) - [DataforAnalysis].[dbo].[Dimension_WR].[Time]) as time)) 
              when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dimension_WR].[Time]) over (order by [DataforAnalysis].[dbo].[Dimension_WR].[Time] desc) - [DataforAnalysis].[dbo].[Dimension_WR].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
              ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dimension_WR].[Time]) over (order by [DataforAnalysis].[dbo].[Dimension_WR].[Time] desc) - [DataforAnalysis].[dbo].[Dimension_WR].[Time]) as time)) >= 120 
              then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dimension_WR].[Time]) over (order by [DataforAnalysis].[dbo].[Dimension_WR].[Time] desc) - [DataforAnalysis].[dbo].[Dimension_WR].[Time]) as time)) 
              when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dimension_WR].[Time]) over (order by [DataforAnalysis].[dbo].[Dimension_WR].[Time] desc) - [DataforAnalysis].[dbo].[Dimension_WR].[Time]) as time)) < 120 then 0 end as [D/T]
              ,[DataforAnalysis].[dbo].[Dimension_WR].{Parameter} as [Parameter]
              ,[DataforAnalysis].[dbo].[Dimension_WR].[Model] as [model]
              ,[Component_Master].[dbo].[Master_matchings].LSL as [LSL]
              ,[Component_Master].[dbo].[Master_matchings].CL as [CL]
              ,[Component_Master].[dbo].[Master_matchings].USL as [USL]
              ,Dimension_WR.Machine_no as [AVG]
              ,[DataforAnalysis].[dbo].[Dimension_WR].Part_ID as Barcode
              FROM [DataforAnalysis].[dbo].[Dimension_WR]
              INNER JOIN [Component_Master].[dbo].[Master_matchings]
              ON [DataforAnalysis].[dbo].[Dimension_WR].Model = [Component_Master].[dbo].[Master_matchings].Model
              left join [LinkedServer1].[IP_Address].[dbo].[List_IPAddress]
              ON [Dimension_WR].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
              WHERE 
                  CONVERT(DATE,[DataforAnalysis].[dbo].[Dimension_WR].[Time]) = ?
                  AND [DataforAnalysis].[dbo].[Dimension_WR].[Model] = ?
                  AND [List_IPAddress].[Line] = ?
                  AND [Component_Master].[dbo].[Master_matchings].[Parameter] = ?
    
    
    """
    else:
        raise ValueError(f"Unsupported MC_NAME: {MC_NAME}")
            
    print("query_template",query_template)
    
    datasets = pd.read_sql(query_template, conn, params=(start, model, line, Parameter))
    print("datasets***********************************************",datasets)
    control_specs = f"""
    
    
      with ControlSpecs as (  SELECT [LCL], [UCL], [CL], [CL_STD], [LCL_STD], [UCL_STD],'ControlSpecs' as tabel
  ,[Model]
    FROM [TransportData].[dbo].[ControlSpecs]
    WHERE [Model] = '{model}' AND [Parameter] = '{Parameter}' AND [Line] = '{line}'
    AND [createdAt] = (
        SELECT MAX([createdAt])
        FROM [TransportData].[dbo].[ControlSpecs]
        WHERE [Model] = '{model}' AND [Parameter] = '{Parameter}' AND [Line] = '{line}'
    )
    GROUP BY [LCL], [UCL], [CL], [CL_STD], [LCL_STD], [UCL_STD],[Model] )

	

,Spec_Aipress_special as (SELECT 
      [LCL]
      ,[UCL]
	  ,'' as [CL]
	  ,'' as [CL_STD]
	  ,'' as [LCL_STD]
	  ,'' as [UCL_STD]
	  ,[Model]
	  ,'Spec_Aipress_special' as Spec_Aipress_special
     FROM [DataforAnalysis].[dbo].[Spec_Aipress_special] )

SELECT
    CASE 
        WHEN s.Model IN ('LONGSP', 'SUMMIT', 'MARL10') THEN spec.[LCL]
        ELSE s.[LCL]
    END AS LCL,
    CASE 
        WHEN s.Model IN ('LONGSP', 'SUMMIT', 'MARL10') THEN spec.[UCL]
        ELSE s.[UCL]
    END AS UCL,
    CASE 
        WHEN s.Model IN ('LONGSP', 'SUMMIT', 'MARL10') THEN spec.[CL]
        ELSE s.[CL]
    END AS CL,
    s.[CL_STD],
    s.[LCL_STD],
    s.[UCL_STD]
FROM
    ControlSpecs AS s
LEFT JOIN
    Spec_Aipress_special AS spec
    ON s.Model = spec.[Model]

""" 
    print("control_specs",control_specs)
    control_specs_1 = pd.read_sql(control_specs, conn)
    datafarm = pd.DataFrame(control_specs_1)

    print("173_control_specs_1",control_specs_1)
    
    hr = datasets['hr']     #x1
    DT_INSEC = datasets['C/T in sec']   #X2
    DT = datasets['D/T']    #x3
    Parameter = datasets['Parameter']   #x4
    model = datasets['model']   #x5
    LSL = datasets['LSL']   #x6
    CL = datasets['CL']   #x7
    USL = datasets['USL']   #x8
    Machine = datasets['AVG']   #x9
    Barcode = datasets['Barcode']   #x10
    UCL = datafarm['UCL']   #x10
    LCL = datafarm['LCL']   #x10
    
    
    Time = pd.DataFrame({'Time': pd.date_range('00:00', '23:00', freq='H').strftime('%H:%M')})
    
    new_df = pd.DataFrame({
    'Time': pd.to_datetime(datasets['Time']),  # แปลงเป็นรูปแบบ datetime
    'hr': hr, #x1
    'C/T in sec': DT_INSEC,  #x2
    'D/T': DT,  #x3
    'Parameter': Parameter,  #x4
    'model': model,  #x5
    'LSL': LSL,  #x6
    'LCL': LCL,  #x6
    'CL': CL,   #x7
    'UCL': UCL, #x8
    'USL': USL, #x8
    'Machine': Machine, #x9
    'Barcode': Barcode #x10
    })
    # print("Columns in new_df:", new_df.columns)
    # print("Unique values in 'LSL' column:", new_df['LSL'].unique())
    # print("Data type of 'LSL' column:", new_df['LSL'].dtype)
    # print(new_df['C/T in sec'])

# x1,x5,x6,x7,x8,x9
    result_grouped = new_df.rename(columns={'LSL': 'LSL_Original', 'CL': 'CL_Original', 'USL': 'USL_Original'}).groupby(['hr', 'LSL_Original', 'CL_Original', 'USL_Original'])

    result = result_grouped.agg(
    Cycle_time_sec=('C/T in sec', lambda x: np.sum(x) / np.count_nonzero(x)),
    Down_time_min=('D/T', lambda x: np.sum(x) / 60),
    AVG=('Parameter', lambda x: np.average(x)),
    mean=('Parameter', lambda x: np.mean(x)),
    STD=('Parameter', lambda x: np.std(x)),

    Parameter=('Parameter', 'first'),
    LSL=('LSL_Original', 'first'),
    CL=('CL_Original', 'first'),
    USL=('USL_Original', 'first'),
    UCL=('UCL','first'),
    LCL=('LCL','first'),
    model=('model', 'first'),
    Machine=('Machine', 'first'),
    
).reset_index()
    
    print("232_result_grouped",result_grouped)
 



# Assuming 'Parameter', 'LSL', 'USL', and 'hr' are columns in your DataFrame
    new_df['yield_1'] = np.where((new_df['Parameter'] >= new_df['LSL']) & (new_df['Parameter'] <= new_df['USL']), 1, np.nan)
    new_df['yield_2'] = np.where(((new_df['Parameter'] >= new_df['LSL']) & (new_df['Parameter'] <= new_df['USL'])), 1, np.nan)
    new_df['yield_3'] = np.where((new_df['Parameter'] < new_df['LSL']) | (new_df['Parameter'] > new_df['USL']), 1, np.nan)

# Group by 'hr' and calculate yield metrics for each hour
    grouped_df = new_df.groupby('hr').agg(
    data=('yield_1', 'count'),
    data2=('yield_2', 'count'),
    data3=('yield_3', 'count')

)
# Calculate yield percentage for each hour, handling division by zero
    grouped_df['yield_percentage'] = np.where((grouped_df['data2'] + grouped_df['data3']) != 0,
                                           grouped_df['data'] / (grouped_df['data2'] + grouped_df['data3']) * 100,
                                           np.nan)

    # Assuming 'hr' is a common column between 'result' and 'grouped_df'
    merged_df = pd.merge(result, grouped_df, on='hr', how='inner')

# Display the merged DataFrame
    selected_columns = ['hr', 'Cycle_time_sec', 'Down_time_min', 'AVG', 'mean', 'STD', 'Parameter', 'LSL', 'USL','yield_percentage','model','CL','Machine']

# Select only the desired columns from the merged DataFrame

    selected_df = merged_df[selected_columns].round(4)

    result['CPK'] = np.select(
    [
        (result['Parameter'] > result['USL'] - 3 * result['STD']) ,
        (result['Parameter'] < result['LSL'] - 3 * result['STD']) | ((result['Parameter'] > result['USL'] - 3 * result['STD']) & (result['LSL'] == 0)),
        (result['Parameter'] >= result['LSL'] - 3 * result['STD']) & (result['Parameter'] <= result['USL'] - 3 * result['STD'])
    ],
    [
        (result['USL'] - result['AVG']) / (3 * result['STD']),
        (result['AVG'] - result['LSL']) / (3 * result['STD']),
        (result['USL'] - result['AVG']) / (3 * result['STD'])
    ],
    default=np.nan
)
    CPK = result.groupby('hr')['CPK'].mean()

    selected_df['CPK'] = selected_df['hr'].map(CPK)
    selected_df = selected_df.round(4)
  
    data ={
        'Time': selected_df['hr']+ ':00',
        # '%yield':selected_df['yield_percentage'],
        # 'Cycle_time (sec)':selected_df['Cycle_time_sec'],
        # 'Cycle_time(sec)':selected_df['Down_time_min'],
        'AVG':selected_df['AVG'],
        'STD':selected_df['STD'],
        # 'CPK':selected_df['CPK'],
        'model':selected_df['model'],
        'LSL':selected_df['LSL'],
        'CL':selected_df['CL'],
        'USL':selected_df['USL'],
        'Machine':selected_df['Machine'],
     
   
    }
    selected_df = pd.DataFrame(data)
    selected_df['Time'] = pd.to_datetime(selected_df['Time'].astype(str) + ':00').dt.strftime('%H:%M')

    print(selected_df)
    import seaborn as sns
    import matplotlib.pyplot as plt

    selected_df = selected_df.sort_values(by='Time')

# Fix the typo here
    datafarm['Time'] = selected_df['Time']
    print(datafarm)

    selected_df = pd.merge(selected_df, datafarm[['Time', 'LCL', 'UCL', 'UCL_STD', 'LCL_STD','CL_STD']], on='Time', how='left')

    selected_df[['LCL', 'UCL', 'UCL_STD', 'LCL_STD','CL_STD']] = selected_df[['LCL', 'UCL', 'UCL_STD', 'LCL_STD','CL_STD']].ffill()
    print(selected_df)
    datafarm.fillna(method='ffill', inplace=True)
    datafarm.fillna(method='bfill', inplace=True)

    selected_df['LCL'] = selected_df.groupby('Time')['LCL'].transform(lambda x: x.fillna(x.mean()))
    selected_df['UCL'] = selected_df.groupby('Time')['UCL'].transform(lambda x: x.fillna(x.mean()))

    
    
    import seaborn as sns
    import matplotlib.pyplot as plt

  
#     plt.figure(figsize=(16, 6))
#     lsl_color = 'red'
#     cl_color = 'grey'
#     usl_color = 'red'
#     ucl_color = 'Orange'
#     lcl_color = 'Orange'




#     print(selected_df)
# # เพิ่มเส้นกราฟ
#     sns.lineplot(x='Time', y='USL', data=selected_df, label='USL', color=usl_color ,linestyle='dashed')
#     sns.lineplot(x='Time', y='UCL', data=selected_df, label='UCL', color=ucl_color, linestyle='dashed')
#     sns.lineplot(x='Time', y='CL', data=selected_df, label='CL', color=cl_color,linestyle='dashed')
#     sns.lineplot(x='Time', y='LCL', data=selected_df, label='LCL', color=lcl_color, linestyle='dashed')
#     sns.lineplot(x='Time', y='LSL', data=selected_df, label='LSL', color=lsl_color ,linestyle='dashed')
    
#     sns.lineplot(x='Time', y='AVG', data=selected_df, hue='Machine', marker='o')

    
#     plt.grid(True, linestyle='--', alpha=0.10)
# # เพิ่มรายละเอียดแกน X, Y และตั้งชื่อกราฟ
#     plt.xlabel('Time')
#     plt.ylabel('Values')
#     plt.title(MC_NAME)
#     plt.legend()

# # Save the plot as an image (adjust the filename and format as needed)
#     plt.savefig(f'../TrainingNodeJS/chart/Xbar_SPC.png', bbox_inches='tight')
    return selected_df
from datetime import datetime
def fetch_data_month(model, line, start, Parameter ,MC_NAME):
    start_datetime = datetime.strptime(start, "%Y-%m-%d")
    month = start_datetime.month
    year = start_datetime.year
    
    conn = create_sql_connection()
    cursor = conn.cursor()

    if  MC_NAME == 'Dimension_WR':
        query_template = f"""
        SELECT 
             CAST([DataforAnalysis].[dbo].[Dimension_WR].[Time] AS DATE) as [hr]
              ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dimension_WR].[Time]) over (order by [DataforAnalysis].[dbo].[Dimension_WR].[Time] desc) - [DataforAnalysis].[dbo].[Dimension_WR].[Time]) as time)) < 120 
              then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dimension_WR].[Time]) over (order by [DataforAnalysis].[dbo].[Dimension_WR].[Time] desc) - [DataforAnalysis].[dbo].[Dimension_WR].[Time]) as time)) 
              when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dimension_WR].[Time]) over (order by [DataforAnalysis].[dbo].[Dimension_WR].[Time] desc) - [DataforAnalysis].[dbo].[Dimension_WR].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
              ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dimension_WR].[Time]) over (order by [DataforAnalysis].[dbo].[Dimension_WR].[Time] desc) - [DataforAnalysis].[dbo].[Dimension_WR].[Time]) as time)) >= 120 
              then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dimension_WR].[Time]) over (order by [DataforAnalysis].[dbo].[Dimension_WR].[Time] desc) - [DataforAnalysis].[dbo].[Dimension_WR].[Time]) as time)) 
              when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dimension_WR].[Time]) over (order by [DataforAnalysis].[dbo].[Dimension_WR].[Time] desc) - [DataforAnalysis].[dbo].[Dimension_WR].[Time]) as time)) < 120 then 0 end as [D/T]
              ,[DataforAnalysis].[dbo].[Dimension_WR].{Parameter} as [Parameter]
              ,[DataforAnalysis].[dbo].[Dimension_WR].[Model] as [model]
              ,[Component_Master].[dbo].[Master_matchings].LSL as [LSL]
              ,[Component_Master].[dbo].[Master_matchings].CL as [CL]
              ,[Component_Master].[dbo].[Master_matchings].USL as [USL]
              ,Dimension_WR.Machine_no as [AVG]
              ,[DataforAnalysis].[dbo].[Dimension_WR].Part_ID as Barcode
              FROM [DataforAnalysis].[dbo].[Dimension_WR]
              INNER JOIN [Component_Master].[dbo].[Master_matchings]
              ON [DataforAnalysis].[dbo].[Dimension_WR].Model = [Component_Master].[dbo].[Master_matchings].Model
              left join [LinkedServer1].[IP_Address].[dbo].[List_IPAddress]
              ON [Dimension_WR].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
              WHERE 
                  MONTH([DataforAnalysis].[dbo].[Dimension_WR].[Time]) = ?
                  AND [DataforAnalysis].[dbo].[Dimension_WR].[Model] = ?
                  AND [List_IPAddress].[Line] = ?
                  AND [Component_Master].[dbo].[Master_matchings].[Parameter] = ?
                  AND [Component_Master].[dbo].[Master_matchings].[createdAt] = (
                      SELECT MAX([Component_Master].[dbo].[Master_matchings].[createdAt]) 
                      FROM [Component_Master].[dbo].[Master_matchings])
    """
        
    else: query_template = f"""
    SELECT 
        CAST([DataforAnalysis].[dbo].[{MC_NAME}].[Time] AS DATE) as [hr],
        CASE 
            WHEN DATEDIFF(SECOND, 0, CAST(LAG([DataforAnalysis].[dbo].[{MC_NAME}].[Time]) OVER (ORDER BY [DataforAnalysis].[dbo].[{MC_NAME}].[Time] DESC) - [DataforAnalysis].[dbo].[{MC_NAME}].[Time] AS TIME)) < 120 
                THEN DATEDIFF(SECOND, 0, CAST(LAG([DataforAnalysis].[dbo].[{MC_NAME}].[Time]) OVER (ORDER BY [DataforAnalysis].[dbo].[{MC_NAME}].[Time] DESC) - [DataforAnalysis].[dbo].[{MC_NAME}].[Time] AS TIME)) 
            WHEN DATEDIFF(SECOND, 0, CAST(LAG([DataforAnalysis].[dbo].[{MC_NAME}].[Time]) OVER (ORDER BY [DataforAnalysis].[dbo].[{MC_NAME}].[Time] DESC) - [DataforAnalysis].[dbo].[{MC_NAME}].[Time] AS TIME)) >= 120 
                THEN 0 
        END AS [C/T in sec],
        CASE 
            WHEN DATEDIFF(SECOND, 0, CAST(LAG([DataforAnalysis].[dbo].[{MC_NAME}].[Time]) OVER (ORDER BY [DataforAnalysis].[dbo].[{MC_NAME}].[Time] DESC) - [DataforAnalysis].[dbo].[{MC_NAME}].[Time] AS TIME)) >= 120 
                THEN DATEDIFF(SECOND, 0, CAST(LAG([DataforAnalysis].[dbo].[{MC_NAME}].[Time]) OVER (ORDER BY [DataforAnalysis].[dbo].[{MC_NAME}].[Time] DESC) - [DataforAnalysis].[dbo].[{MC_NAME}].[Time] AS TIME)) 
            WHEN DATEDIFF(SECOND, 0, CAST(LAG([DataforAnalysis].[dbo].[{MC_NAME}].[Time]) OVER (ORDER BY [DataforAnalysis].[dbo].[{MC_NAME}].[Time] DESC) - [DataforAnalysis].[dbo].[{MC_NAME}].[Time] AS TIME)) < 120 
                THEN 0 
        END AS [D/T],
        [DataforAnalysis].[dbo].[{MC_NAME}].{Parameter} as [Parameter],
        [DataforAnalysis].[dbo].[{MC_NAME}].[Model] as [model],
        [Component_Master].[dbo].[Master_matchings].LSL as [LSL],
        [Component_Master].[dbo].[Master_matchings].CL as [CL],
        [Component_Master].[dbo].[Master_matchings].USL as [USL],
        {MC_NAME}.Machine_no as [AVG],
        [DataforAnalysis].[dbo].[{MC_NAME}].Barcode
    FROM [DataforAnalysis].[dbo].[{MC_NAME}]
    INNER JOIN [Component_Master].[dbo].[Master_matchings]
    ON [DataforAnalysis].[dbo].[{MC_NAME}].Model = [Component_Master].[dbo].[Master_matchings].Model
    left join [LinkedServer1].[IP_Address].[dbo].[List_IPAddress]
    ON [{MC_NAME}].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
    WHERE 
        MONTH([DataforAnalysis].[dbo].[{MC_NAME}].[Time]) = ?
        AND [DataforAnalysis].[dbo].[{MC_NAME}].[Model] = ?
        AND [List_IPAddress].[Line] = ?
        AND [Component_Master].[dbo].[Master_matchings].[Parameter] = ?
        AND [Component_Master].[dbo].[Master_matchings].[createdAt] = (
            SELECT MAX([Component_Master].[dbo].[Master_matchings].[createdAt]) 
            FROM [Component_Master].[dbo].[Master_matchings]
        )
        and {Parameter} < 100 and {Parameter} > 0
"""

            
            
    
    datasets = pd.read_sql(query_template, conn, params=(month, model, line, Parameter))
    print("datasets",datasets)
    control_specs = f"""
    SELECT [LCL], [UCL], [CL], [CL_STD], [LCL_STD], [UCL_STD], [createdAt]
    FROM [TransportData].[dbo].[ControlSpecs]
    WHERE [Model] = '{model}' AND [Parameter] = '{Parameter}' AND [Line] = '{line}'
    AND [createdAt] = (
        SELECT MAX([createdAt])
        FROM [TransportData].[dbo].[ControlSpecs]
        WHERE [Model] = '{model}' AND [Parameter] = '{Parameter}' AND [Line] = '{line}'
    )
    GROUP BY [LCL], [UCL], [CL], [CL_STD], [LCL_STD], [UCL_STD], [createdAt]
"""
    control_specs_1 = pd.read_sql(control_specs, conn)
    datafarm = pd.DataFrame(control_specs_1)

    selected_df  = datasets
    print(selected_df)
    
    hr = datasets['hr']     #x1
    DT_INSEC = datasets['C/T in sec']   #X2
    DT = datasets['D/T']    #x3
    Parameter = datasets['Parameter']   #x4
    model = datasets['model']   #x5
    LSL = datasets['LSL']   #x6
    CL = datasets['CL']   #x7
    USL = datasets['USL']   #x8
    Machine = datasets['AVG']   #x9
    Barcode = datasets['Barcode']   #x10
    UCL = datafarm['UCL']   #x10
    LCL = datafarm['LCL']   #x10
    CL_STD = datafarm['CL']   #x10
    
    
    Time = pd.DataFrame({'Time': pd.date_range('00:00', '23:00', freq='H').strftime('%H:%M')})
    
    new_df = pd.DataFrame({
    'Date': hr,
    'C/T in sec': DT_INSEC,
    'D/T': DT,
    'Parameter': Parameter,
    'model': model,
    'LSL': LSL,
    'LCL': LCL,
    'CL': CL,
    'UCL': UCL, 
    'USL': USL,
    'CL_STD': CL_STD,
    'Machine': Machine,
    'Barcode': Barcode
})


    
    # print("Columns in new_df:", new_df.columns)
    # print("Unique values in 'LSL' column:", new_df['LSL'].unique())
    # print("Data type of 'LSL' column:", new_df['LSL'].dtype)
    # print(new_df['C/T in sec'])

# # x1,x5,x6,x7,x8,x9
    result_grouped = new_df.rename(columns={'LSL': 'LSL_Original', 'CL': 'CL_Original', 'USL': 'USL_Original'}).groupby(['Date', 'LSL_Original', 'CL_Original', 'USL_Original'])

    result = result_grouped.agg(
    Cycle_time_sec=('C/T in sec', lambda x: np.sum(x) / np.count_nonzero(x)),
    Down_time_min=('D/T', lambda x: np.sum(x) / 60),
    AVG=('Parameter', lambda x: np.average(x)),
    mean=('Parameter', lambda x: np.mean(x)),
    STD=('Parameter', lambda x: np.std(x)),

    Parameter=('Parameter', 'first'),
    LSL=('LSL_Original', 'first'),
    CL=('CL_Original', 'first'),
    USL=('USL_Original', 'first'),
    model=('model', 'first'),
    Machine=('Machine', 'first'),
    
 
).reset_index()
    # print("result", result)
    




# Assuming 'Parameter', 'LSL', 'USL', and 'hr' are columns in your DataFrame
    new_df['yield_1'] = np.where((new_df['Parameter'] >= new_df['LSL']) & (new_df['Parameter'] <= new_df['USL']), 1, np.nan)
    new_df['yield_2'] = np.where(((new_df['Parameter'] >= new_df['LSL']) & (new_df['Parameter'] <= new_df['USL'])), 1, np.nan)
    new_df['yield_3'] = np.where((new_df['Parameter'] < new_df['LSL']) | (new_df['Parameter'] > new_df['USL']), 1, np.nan)

# Group by 'Date' and calculate yield metrics for each hour
    grouped_df = new_df.groupby('Date').agg(
    data=('yield_1', 'count'),
    data2=('yield_2', 'count'),
    data3=('yield_3', 'count')

)
# Calculate yield percentage for each hour, handling division by zero
    grouped_df['yield_percentage'] = np.where((grouped_df['data2'] + grouped_df['data3']) != 0,
                                           grouped_df['data'] / (grouped_df['data2'] + grouped_df['data3']) * 100,
                                           np.nan)

    # Assuming 'Date' is a common column between 'result' and 'grouped_df'
    merged_df = pd.merge(result, grouped_df, on='Date', how='inner')

# Display the merged DataFrame
    selected_columns = ['Date', 'Cycle_time_sec', 'Down_time_min', 'AVG', 'mean', 'STD', 'Parameter', 'LSL', 'USL','yield_percentage','model','CL','Machine']

# Select only the desired columns from the merged DataFrame

    selected_df = merged_df[selected_columns].round(4)
    
    result['CPK'] = np.select(
    [
        (result['Parameter'] > result['USL'] - 3 * result['STD']) ,
        (result['Parameter'] < result['LSL'] - 3 * result['STD']) | ((result['Parameter'] > result['USL'] - 3 * result['STD']) & (result['LSL'] == 0)),
        (result['Parameter'] >= result['LSL'] - 3 * result['STD']) & (result['Parameter'] <= result['USL'] - 3 * result['STD'])
    ],
    [
        (result['USL'] - result['AVG']) / (3 * result['STD']),
        (result['AVG'] - result['LSL']) / (3 * result['STD']),
        (result['USL'] - result['AVG']) / (3 * result['STD'])
    ],
    default=np.nan
)
    CPK = result.groupby('Date')['CPK'].mean()

    selected_df['CPK'] = selected_df['Date'].map(CPK)
    selected_df = selected_df.round(4)
    
    data ={
        'Date': selected_df['Date'],
        # '%yield':selected_df['yield_percentage'],
        # 'Cycle_time (sec)':selected_df['Cycle_time_sec'],
        # 'Cycle_time(sec)':selected_df['Down_time_min'],
        'AVG':selected_df['AVG'],
        'STD':selected_df['STD'],
        # 'CPK':selected_df['CPK'],
        'model':selected_df['model'],
        'LSL':selected_df['LSL'],
        'CL':selected_df['CL'],
        'USL':selected_df['USL'],
        'Machine':selected_df['Machine'],
     
   
    }
    selected_df = pd.DataFrame(data)
   

    print(selected_df)
    import seaborn as sns
    import matplotlib.pyplot as plt

    

# Fix the typo here
    datafarm['Date'] = selected_df['Date']
    print(datafarm)

    selected_df = pd.merge(selected_df, datafarm[['Date', 'LCL', 'UCL', 'UCL_STD', 'LCL_STD','CL_STD']], on='Date', how='left')

    selected_df[['LCL', 'UCL', 'UCL_STD', 'LCL_STD','CL_STD']] = selected_df[['LCL', 'UCL', 'UCL_STD', 'LCL_STD','CL_STD']].ffill()
    
    print("603_UCL LCL*******************************************************************",selected_df)
    
    datafarm.fillna(method='ffill', inplace=True)
    datafarm.fillna(method='bfill', inplace=True)

    selected_df['LCL'] = selected_df.groupby('Date')['LCL'].transform(lambda x: x.fillna(x.mean()))
    selected_df['UCL'] = selected_df.groupby('Date')['UCL'].transform(lambda x: x.fillna(x.mean()))


# แสดง DataFrame ใหม่ที่เลือกเฉพาะบางคอลัมน์
    print(selected_df)


    return selected_df


from flask import send_file



def process_input(process, startDate,model, line,parameter):

    MC_NAME = process
    
    data = fetch_data(model, line, startDate, parameter, MC_NAME)
    # data_month = fetch_data_month(model, line, startDate, parameter, MC_NAME)
    
    json_data = data.dropna().to_dict(orient='records')
    # json_data_month = data_month.dropna().to_dict(orient='records')

    response_data = {
            "json_data": json_data,
            # "json_data_month": json_data_month,
            }
    print("response_data",response_data)
    return response_data

def process_input_month(process, startDate,model, line,parameter):

    MC_NAME = process
    
    # data = fetch_data(model, line, startDate, parameter, MC_NAME)
    data_month = fetch_data_month(model, line, startDate, parameter, MC_NAME)
    
    # json_data = data.dropna().to_dict(orient='records')
    json_data_month = data_month.dropna().to_dict(orient='records')

    response_data = {
            # "json_data": json_data,
            "json_data_month": json_data_month,
            }
    print("response_data",response_data)
    return response_data

def get_model_spc(process,start):
    try:
        # การเชื่อมต่อฐานข้อมูล SQL Server
        conn = create_sql_connection()

        cursor = conn.cursor()
            # Hipot 
            # Dynamic_Parallelism_Tester
            # EWMS

        # ดึงข้อมูลจาก SQL
      
        cursor.execute(f"SELECT distinct[model] as model FROM [DataforAnalysis].[dbo].[{process}]where  Date = '" + start + "' and Model != ''")
        print(f"******************************************************************************************************************************SELECT distinct[model] as model FROM [DataforAnalysis].[dbo].[{process}]where  Date = '" + start + "' and Model != ''")
        

        rows = cursor.fetchall()

        options = [{"value": row.model, "text": row.model}
                   for row in rows]
        print(options)

        # ปิดการเชื่อมต่อฐานข้อมูล
        conn.close()

        return jsonify(options)

    except Exception as e:
        # print(str(e))
        return str(e)  


def get_line_SPC(model,process,start):
    try:
        # การเชื่อมต่อฐานข้อมูล SQL Server
        conn = create_sql_connection()

        cursor = conn.cursor()
        


        cursor.execute(f"SELECT distinct [List_IPAddress].[Line] as line FROM [DataforAnalysis].[dbo].[{process}] left join [LinkedServer1].[IP_Address].[dbo].[List_IPAddress] ON [{process}].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS where [{process}].Model = '" + model + "'and Date = '" + start + "' order by [List_IPAddress].[Line]")

        print(f"SELECT distinct [List_IPAddress].[Line] as line FROM [DataforAnalysis].[dbo].[{process}] left join [LinkedServer1].[IP_Address].[dbo].[List_IPAddress] ON [{process}].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS where [{process}].Model = '" + model + "'and Date = '" + start + "' order by [List_IPAddress].[Line]")
        rows = cursor.fetchall()
        print(rows)
        options = [{"value": row.line, "text": row.line}
                   for row in rows]
        print(options)

        # ปิดการเชื่อมต่อฐานข้อมูล
        conn.close()

        return jsonify(options)

    except Exception as e:
        # print(str(e))
        return str(e)  

    
def get_process():
    try:
        # การเชื่อมต่อฐานข้อมูล SQL Server
        conn = create_sql_Component_Master()

        cursor = conn.cursor()

        # ดึงข้อมูลจาก SQL
        
        cursor.execute(
            " select  'Hipot' as process union select 'Dynamic_Parallelism_Tester' union select 'EWMS' union select 'Dimension_WR' ")
        rows = cursor.fetchall()

        options = [{"value": row.process, "text": row.process} for row in rows]

        # ปิดการเชื่อมต่อฐานข้อมูล
        conn.close()

        # ใช้ #print เพื่อแสดงข้อมูลที่คุณต้องการตรวจสอบ

        return jsonify(options)

    except Exception as e:
        # ใช้ #print เพื่อแสดงข้อผิดพลาดที่เกิดขึ้น
        print(str(e))
        return str(e)
    
def get_parameters_spc(process):

    try:
        # การเชื่อมต่อฐานข้อมูล SQL Server
        conn = create_sql_connection()

        cursor = conn.cursor()
            # Hipot 
            # Dynamic_Parallelism_Tester
            # EWMS

        # ดึงข้อมูลจาก SQL
        if process == 'Hipot':
            cursor.execute("""
                   SELECT DISTINCT [Part], [parameters].[Parameter] AS parameters
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
			and [Part] is not null
			and [Part] !='Ai_press'
			and [Part] !='Rotor'
            and [Part] ='Motor_Hipot'
            """)
        elif process == 'Dynamic_Parallelism_Tester':
            cursor.execute("""
                SELECT DISTINCT [Part], [parameters].[Parameter] AS parameters
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
			and [Part] is not null
			and [Part] !='Ai_press'
			and [Part] !='Rotor'
            and Part='Motor_Dim'
            """)
        elif process == 'EWMS':
            cursor.execute("""
                   SELECT DISTINCT [Part], [parameters].[Parameter] AS parameters
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
			and [Part] is not null
			and [Part] !='Ai_press'
			and [Part] !='Rotor'
            and Part='Motor_EWMS'
            """)
        elif process == 'Dimension_WR':
            cursor.execute("""
                    SELECT DISTINCT parameter as parameters
            FROM [Component_Master].[dbo].[Master_matchings]
            WHERE  [Part] ='Stack_Height'
            """)
        
        else:
            # Default query if process doesn't match any specific condition
            cursor.execute("""
            select 'ERROR'
            """)

        rows = cursor.fetchall()

        options = [{"value": row.parameters, "text": row.parameters}
                   for row in rows]

        # ปิดการเชื่อมต่อฐานข้อมูล
        conn.close()

        return jsonify(options)

    except Exception as e:
        # print(str(e))
        return str(e)



