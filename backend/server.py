import seaborn as sns
import numpy as np
from flask import send_file, Flask, jsonify, request
from flask_cors import CORS
import pyodbc


from ML_japan import make_chart

from pairplot_generator import pairplot
from pairplot_generator import make_chartML
from pairplot_generator import summary_describe
from pairplot_generator import fetch_data
from pairplot_generator import get_parameters
from pairplot_generator import get_model
from pairplot_generator import get_line 
from pairplot_generator import BinKPOV_Auto 
from pairplot_generator import BIN_KPOV 

from pairplot_generator import data_bin 
# from pairplot_generator import api_data_bin 
from pairplot_generator import BIN_KPIV 


from Data import get_ranking 
# from Dynamic_SPC_plot import Senfile_input 
from Dynamic_SPC import get_process
from Dynamic_SPC import process_input
from Dynamic_SPC import get_parameters_spc
from Dynamic_SPC import get_line_SPC
from Dynamic_SPC import get_model_spc
from option import get_model_options

from Aipress import Select_Model
from Aipress import Select_Line
from Aipress import Select_MC
from Aipress import fetch_data
from box_Aipress import fetch_data_math



from api_ML_EWMS import pairplot as pairplot_ewms
from api_ML_EWMS import make_chartML as make_chartML_ewms
from api_ML_EWMS import summary_describe as summary_describe_ewms
from api_ML_EWMS import fetch_data as fetch_data_ewms
from api_ML_EWMS import get_parameters as get_parameters_ewms
from api_ML_EWMS import get_model as get_model_ewms
from api_ML_EWMS import get_line as get_line_ewms
from api_ML_EWMS import BinKPOV_Auto  as BinKPOV_Auto_ewms
from api_ML_EWMS import BIN_KPOV  as BIN_KPOV_ewms

from api_ML_EWMS import data_bin as data_bin_ewms
# from pairplot_generator import api_data_bin 
from api_ML_EWMS import BIN_KPIV as BIN_KPIV_ewms



app = Flask(__name__)
cors = CORS(app)

app.add_url_rule('/api/data/<start>/<end>', 'make_tilt_plot', make_chart)

app.add_url_rule('/api/make_chartML', 'generate_heatmap', make_chartML)
app.add_url_rule('/api/pairplot', 'generate_pairplot', pairplot)

app.add_url_rule('/api/data/<model>/<line>/<start>/<end>/<selecteKPOV>/<selecteKPIV>', 'fetch_data', fetch_data)

app.add_url_rule('/api/get_ranking/<model>/<line>/<start>/<end>/<selecteKPOV>/<selecteKPIV>', 'get_ranking', get_ranking)

app.add_url_rule('/api/summary_describe/<model>/<line>/<start>/<end>/<selecteKPOV>/<selecteKPIV>', 'summary_json', summary_describe)
app.add_url_rule('/api/model', 'get_model', get_model)

app.add_url_rule('/api/model_option', 'get_model_options', get_model_options)

app.add_url_rule('/api/line/<model>', 'get_line', get_line)
app.add_url_rule('/api/parameters/<model>', 'get_parameters', get_parameters)

app.add_url_rule('/api/process', 'get_process', get_process)
app.add_url_rule('/api/line_SPC/<model>/<process>/<start>', 'get_line_SPC', get_line_SPC)
app.add_url_rule('/api/model_spc/<process>/<start>', 'get_model_spc', get_model_spc)

app.add_url_rule('/api/process_input/<process>/<startDate>/<model>/<line>/<parameter>', 'process_input', process_input)
app.add_url_rule('/api/get_parameters_spc/<process>', 'get_parameters_spc', get_parameters_spc)

app.add_url_rule('/api/BinKPOV_Auto/<model>/<selecteKPOV>', 'BinKPOV_Auto', BinKPOV_Auto)
app.add_url_rule('/api/BIN_KPOV/<selecteKPOV>/<minKPOV>/<maxKPOV>', 'BIN_KPOV', BIN_KPOV)
app.add_url_rule('/api/data_bin/<model>/<selecteKPIV>', 'data_bin', data_bin)
# app.add_url_rule('/api/api_data_bin/<model>/<selecteKPIV>', 'api_data_bin', api_data_bin)
app.add_url_rule('/api/BIN_KPIV/<model>/<selecteKPOV>/<selecteKPIV>/<minKPOV>/<maxKPOV>/<support>/<confidence>', 'BIN_KPIV', BIN_KPIV)
app.add_url_rule('/api/Senfile_input/<model>/<line>/<start>/<end>/<selecteKPOV>', 'Senfile_input', input)

# Aipress
app.add_url_rule('/api/model/<StartDate>/<EndDate>', 'get_model_PFH', Select_Model)
app.add_url_rule('/api/line_Aipress/<model>/<StartDate>/<EndDate>', 'get_line_PFH', Select_Line)

app.add_url_rule('/api/machine/<line>/<model>/<StartDate>/<EndDate>','get_machine', Select_MC)
app.add_url_rule('/api/data/<model>/<line>/<MC>/<StartDate>/<EndDate>','fetch_data', fetch_data)
# box_Aipress
app.add_url_rule('/api/fetch_data_math', 'fetch_data_math', fetch_data_math)

# ewms
app.add_url_rule('/api/pairplot', 'pairplot_ewms', pairplot_ewms)
app.add_url_rule('/api/make_chartML_ewms', 'make_chartML_ewms', make_chartML_ewms)
app.add_url_rule('/api/summary_describe_ewms/<model>/<line>/<start>/<end>/<selecteKPOV>/<selecteKPIV>', 'summary_describe_ewms', summary_describe_ewms)
app.add_url_rule('/api/data/<model>/<line>/<start>/<end>/<selecteKPOV>/<selecteKPIV>', 'fetch_data_ewms', fetch_data_ewms)
app.add_url_rule('/api/parameters_ewms', 'get_parameters_ewms', get_parameters_ewms)
app.add_url_rule('/api/get_model_ewms', 'get_model_ewms', get_model_ewms)
app.add_url_rule('/api/get_line_ewms/<model>', 'get_line_ewms', get_line_ewms)
app.add_url_rule('/api/BinKPOV_Auto_ewms/<model>/<selecteKPOV>', 'BinKPOV_Auto_ewms', BinKPOV_Auto_ewms)
app.add_url_rule('/api/BIN_KPOV_ewms/<selecteKPOV>/<minKPOV>/<maxKPOV>', 'BIN_KPOV_ewms', BIN_KPOV_ewms)
# app.add_url_rule('/api/api_data_bin/<model>/<selecteKPIV>', 'api_data_bin', api_data_bin)
app.add_url_rule('/api/BIN_KPIV_ewms/<model>/<selecteKPOV>/<selecteKPIV>/<minKPOV>/<maxKPOV>/<support>/<confidence>', 'BIN_KPIV_ewms', BIN_KPIV_ewms)


if __name__ == '__main__':

    app.run(port=2023)
