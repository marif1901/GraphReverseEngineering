import json
import csv
import os
import glob
import random
from flask import Flask, render_template, request, redirect, Response, jsonify, make_response
import pandas as pd
from sklearn.cluster import KMeans 
from sklearn import metrics 
from scipy.spatial.distance import cdist 
import numpy as np 
import matplotlib
import pickle
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt 
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt 
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import scale
from sklearn.decomposition import PCA
from sklearn.metrics import pairwise_distances
from sklearn import manifold
import seaborn as sns

import os,io
import pandas as pd
import cv2
from google.cloud import vision
from google.cloud.vision import types
from pandas.io.json import json_normalize
sns.set(style="ticks")

app = Flask(__name__)
randomSampleCount = int(0.25 * 1000)
feature_selected = ''
categorical_features = ['Type','Year','City','Rating','Major Size','Population']
numerical_features = ['Price','Total Volume','Total Bags','PLU4046','PLU4225','PLU4770','Small Bags','Large Bags','XLarge Bags']
stratified_sample = pd.DataFrame()
random_sample = pd.DataFrame()
eigen_values_org = []
eigen_values_random = []
eigen_values_stratified = []  
eigen_vectors_org = []
eigen_vectors_random = []
eigen_vectors_stratified = []
x_ticks_sqLoad_org = []
x_ticks_sqLoad_random = []
x_ticks_sqLoad_strat = []
squared_loadings_org = []
squared_loadings_random = []
squared_loadings_strat = []
colors=["red","green","blue","pink","yellow"]

y_ticks_org = []
y_ticks_random = []
y_ticks_stratified = []
clustered_sample = []



@app.route("/")
def index():

    return render_template("index_2.html")

@app.route('/success', methods = ['POST'])  
def success():  
    PEOPLE_FOLDER = os.path.join('static', 'academic')
    app.config['UPLOAD_FOLDER'] = PEOPLE_FOLDER
    if request.method == 'POST':  
        f = request.files['file']  
        f.save(f.filename)  
        os.environ['GOOGLE_APPLICATION_CREDENTIALS']=r'ServiceAccountToken.json'
        client = vision.ImageAnnotatorClient()
        global image_path
        image_path=f.filename

        def Bounding_Box(response,fh,fw):
            df1 = pd.DataFrame(columns=['Text', 'xp', 'yp','x2p','y2p','xcp','ycp','wp','hp'])
            i=0
            for text in response.text_annotations:
                if "\n" in text.description:
                    continue

                j=0
                for v in text.bounding_poly.vertices:
                    if j==1:
                        right_bottom_x=v.x
                        right_bottom_y=v.y
                    if j==3:
                        top_left_x=v.x
                        top_left_y=v.y
                    j+=1

                #Top-left and Bottom-right Coordinates
                xl=top_left_x
                yl=top_left_y
                xr=right_bottom_x
                yr=right_bottom_y

                #Center Coordinates
                xc=(xl+yr)/2.0
                yc=(yl+yr)/2.0

                #Dimension of Bounding-Box
                w=abs(xr-xl)
                h=abs(yr-yl)

                #Normalize the coordinates
                xl/=fw
                yl/=fh
                xr/=fw
                yr/=fh
                xc/=fw
                yc/=fh
                w/=fw
                h/=fh

                #Push in Dataframe
                df1.loc[i] = [text.description] + [xl,yl,xr,yr,xc,yc,w,h]
                i+=1
                
            return df1

        def test_feature(file_path):
            image_path =file_path

            #To get Image Shape
            img=cv2.imread(image_path)
            fh,fw,c=img.shape

            #Open file from path
            with io.open(image_path,'rb') as image_file:
                content = image_file.read()

            # construct an image instance
            image = vision.types.Image(content=content)

            # annotate Image Response : this would be in JSON format
            response = client.text_detection(image=image)  # returns TextAnnotation
            df = pd.DataFrame(columns=['locale', 'description'])

            texts = response.text_annotations

            for text in texts:
                df = df.append(
                    dict(
                        locale=text.locale,
                        description=text.description
                    ),
                    ignore_index=True
                )
                v=text.bounding_poly.vertices

            #Coordinates will be a Dataframe
            Coordinates=Bounding_Box(response,fh,fw)
            return Coordinates
            
        file = open('svm_model.pkl', 'rb')
        final_model = pickle.load(file)
        file.close()

        file = open('svm_scaler.pkl', 'rb')
        scaler = pickle.load(file)
        file.close()

        file = open('svm_encoder.pkl', 'rb')
        encoder = pickle.load(file)
        file.close()

        def chart_labels(image_path):
            x_test=test_feature(image_path)
            myfeat= ['xp', 'yp','x2p','y2p','xcp','ycp','wp','hp']
            x_test = x_test[myfeat]

            x_test_scaled = scaler.transform(x_test)

            y_test_pred = final_model.predict(x_test_scaled)
            y_test_pred_label = list(encoder.inverse_transform(y_test_pred))
            return y_test_pred_label
        


        path = "Images"
        images = os.listdir(path)
        images.sort()
        img_items=[]
        for img in images:
            if "jpg" not in img: 
                continue
            img_items= img_items+ [img]


            
        try:
            test_pred_labels= chart_labels(image_path)
            test_pred_labels= np.unique(test_pred_labels)
            print('\033[1m' + 'Predicted Chart Labels are: ' + str(test_pred_labels))
            print(type(test_pred_labels))
            df = pd.DataFrame(data=test_pred_labels, columns=["Predicted Labels"])
            print(df)
        except :
            print('\033[1m' + "OOPS !!: Very Poor Chart no Labels Found !")
    
        full_filename = os.path.join(app.config['UPLOAD_FOLDER'], image_path)
        print(image_path)
        return render_template("PredictedLabels.html",tables=[df.to_html(classes='data')], titles=df.columns.values, user_image=full_filename)
        # return render_template("AdvancedProject.html", name = f.filename)  

@app.route("/dashboard")
def dashboard():
    return render_template("visual.html")

@app.route("/AdvancedProject", methods = ['POST', 'GET'])
def AdvancedProject():
   
    return render_template("AdvancedProject.html")

@app.route("/Coordinates", methods = ['POST', 'GET'])
def Coordinates():
    # if request.method == 'POST':
    # f = request.files['file']
    # image_path =f.filename
    # print('Inside Post')
    os.environ['GOOGLE_APPLICATION_CREDENTIALS']=r'ServiceAccountToken.json'
    client = vision.ImageAnnotatorClient()

    file_name = 'test.jpg'
    # image_path='Images/test.jpg'

    #To get Image Shape
    img=cv2.imread(image_path)
    fh,fw,c=img.shape

    #Open file from path
    with io.open(image_path,'rb') as image_file:
        content = image_file.read()

    # construct an image instance
    image = vision.types.Image(content=content)

    # annotate Image Response : this would be in JSON format
    response = client.text_detection(image=image)  # returns TextAnnotation
    df = pd.DataFrame(columns=['locale', 'description'])

    texts = response.text_annotations

    for text in texts:
        df = df.append(
            dict(
                locale=text.locale,
                description=text.description
            ),
            ignore_index=True
        )
        v=text.bounding_poly.vertices


    def Bounding_Box(response):
        df1 = pd.DataFrame(columns=['Text', 'xp', 'yp','x2p','y2p','xcp','ycp','wp','hp'])

        i=0
        for text in response.text_annotations:
            if "\n" in text.description:
                continue

            j=0
            for v in text.bounding_poly.vertices:
                if j==1:
                    right_bottom_x=v.x
                    right_bottom_y=v.y
                if j==3:
                    top_left_x=v.x
                    top_left_y=v.y
                j+=1

            #Top-left and Bottom-right Coordinates
            xl=top_left_x
            yl=top_left_y
            xr=right_bottom_x
            yr=right_bottom_y

            #Center Coordinates
            xc=(xl+yr)/2.0
            yc=(yl+yr)/2.0

            #Dimension of Bounding-Box
            w=abs(xr-xl)
            h=abs(yr-yl)

            #Normalize the coordinates
            xl/=fw
            yl/=fh
            xr/=fw
            yr/=fh
            xc/=fw
            yc/=fh
            w/=fw
            h/=fh

            #Push in Dataframe
            df1.loc[i] = [text.description] + [xl,yl,xr,yr,xc,yc,w,h]
            i+=1
            
        
        return df1
        
    #Coordinates will be a Dataframe
    Coordinates=Bounding_Box(response)

    print(Coordinates)

    return render_template("Coordinates.html",tables=[Coordinates.to_html(classes='data')], titles=Coordinates.columns.values)

@app.route("/Color", methods = ['POST', 'GET'])
def Color():
    os.environ['GOOGLE_APPLICATION_CREDENTIALS']=r'ServiceAccountToken.json'


    with io.open(image_path,'rb') as image_file:
        content = image_file.read()

    client = vision.ImageAnnotatorClient()

    image = vision.types.Image(content=content)
    response = client.image_properties(image=image).image_properties_annotation
    dominant_colors = response.dominant_colors

    a=[]
    b=[]
    c=[]
    d=[]
    i=0
    for color in dominant_colors.colors:
        a.append(color.pixel_fraction)
        b.append(color.color.red)
        c.append(color.color.green)
        d.append(color.color.blue)

    df1=pd.DataFrame(a,columns=['Pixel Fraction'])
    df2=pd.DataFrame(b,columns=['Red'])
    df3=pd.DataFrame(c,columns=['Green'])
    df4=pd.DataFrame(d,columns=['Blue'])

    y=df1.merge(df2,left_index=True, right_index=True)
    z=y.merge(df3,left_index=True, right_index=True)
    x=z.merge(df4,left_index=True, right_index=True)

    return render_template("Color.html",tables=[x.to_html(classes='data')], titles=x.columns.values)

@app.route("/view_dataset", methods = ['POST', 'GET'])
def view_dataset():
    return render_template("dataset.html")



if __name__ == "__main__":
    app.run(debug=True)