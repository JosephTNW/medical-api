import pandas as pd
import json
import sys
import pickle
import os
from dotenv import load_dotenv
from sklearn.decomposition import PCA

load_dotenv()

def preprocess():
    cwd = os.getcwd()
    
    try: 
        input_data_str = sys.stdin.read()

        # Parse the input data as JSON
        form_data = json.loads(input_data_str)

        diseases = pd.DataFrame(form_data, index=[0])

        diseases = pd.concat([diseases, pd.get_dummies(diseases['General_Health'], prefix='gh', dtype=int)], axis=1)
        diseases = pd.concat([diseases, pd.get_dummies(diseases['Checkup'], prefix='checkup', dtype=int)], axis=1)
        diseases = pd.concat([diseases, pd.get_dummies(diseases['Age_Category'], prefix='ac', dtype=int)], axis=1)
        diseases = pd.concat([diseases, pd.get_dummies(diseases['Diabetes'], prefix='d', dtype=int)], axis=1)

        diseases.drop(['General_Health', 'Checkup', 'Age_Category', 'Diabetes'], axis=1, inplace=True)

        """"
        "Alcohol_Consumption": null,
        "Fruit_Consumption": null,
        "Green_Vegetables_Consumption": null,
        "FriedPotato_Consumption": null,

        """
        diseases['Alcohol_Consumption'] = pd.to_numeric(diseases['Alcohol_Consumption'], errors='coerce')
        diseases['Fruit_Consumption'] = pd.to_numeric(diseases['Fruit_Consumption'], errors='coerce')
        diseases['Green_Vegetables_Consumption'] = pd.to_numeric(diseases['Green_Vegetables_Consumption'], errors='coerce')
        diseases['FriedPotato_Consumption'] = pd.to_numeric(diseases['FriedPotato_Consumption'], errors='coerce')

        biCategorical = diseases.select_dtypes(include=['object'])
        for i in biCategorical.columns:
            if i == "Sex":
                diseases[i] = diseases[i].map({'Male': 0, 'Female': 1})
            else:
                diseases[i] = diseases[i].map({'No': 0, 'Yes': 1})

        diseases.rename(columns={'Height': 'Height_(cm)'}, inplace=True)
        diseases.rename(columns={'Weight': 'Weight_(kg)'}, inplace=True)
        diseases.rename(columns={'Other_Cancers': 'Other_Cancer'}, inplace=True)

        file_columns = [
            'Exercise', 'Skin_Cancer', 'Other_Cancer', 'Depression', 'Arthritis', 'Sex', 'Height_(cm)', "Weight_(kg)", 
            'Smoking_History', 'Alcohol_Consumption', 'Fruit_Consumption', 'Green_Vegetables_Consumption',
            'FriedPotato_Consumption', 'gh_Excellent', 'gh_Fair', 'gh_Good', 'gh_Poor', 'gh_Very Good',
            'checkup_5 or more years ago', 'checkup_Never', 'checkup_Within the past 2 years',
            'checkup_Within the past 5 years', 'checkup_Within the past year', 'ac_18-24', 'ac_25-29', 'ac_30-34',
            'ac_35-39', 'ac_40-44', 'ac_45-49', 'ac_50-54', 'ac_55-59', 'ac_60-64', 'ac_65-69', 'ac_70-74', 'ac_75-79',
            'ac_80+', 'd_No', 'd_No, pre-diabetes or borderline diabetes', 'd_Yes', 'd_Yes, but female told only during pregnancy',
        ]

        for col in file_columns:
            if col not in diseases.columns:
                diseases[col] = 0
        
        print(diseases.columns)

        try:
            pkl_file_path = os.environ.get('PCA_DATA')
            with open(pkl_file_path, 'rb') as file:
                loaded_pca = pickle.load(file)
            dfs = pd.DataFrame(loaded_pca)
            

            pca = PCA(n_components=1, random_state=123)
            pca.fit(dfs[['BMI','Weight_(kg)']])
            diseases['BMI_W'] = pca.transform(diseases.loc[:, ('BMI','Weight_(kg)')]).flatten()

            print(diseases['BMI_W'])
        except Exception as e:
            print(json.dumps({"errortrydua": str(e)}))

        desired_order = [
            'Exercise', 'Skin_Cancer', 'Other_Cancer', 'Depression', 'Arthritis', 'Sex',
            'Height_(cm)', 'Smoking_History', 'Alcohol_Consumption', 'Fruit_Consumption',
            'Green_Vegetables_Consumption', 'FriedPotato_Consumption', 'gh_Excellent', 'gh_Fair',
            'gh_Good', 'gh_Poor', 'gh_Very Good', 'checkup_5 or more years ago', 'checkup_Never',
            'checkup_Within the past 2 years', 'checkup_Within the past 5 years', 'checkup_Within the past year',
            'ac_18-24', 'ac_25-29', 'ac_30-34', 'ac_35-39', 'ac_40-44', 'ac_45-49', 'ac_50-54',
            'ac_55-59', 'ac_60-64', 'ac_65-69', 'ac_70-74', 'ac_75-79', 'ac_80+',
            'd_No', 'd_No, pre-diabetes or borderline diabetes', 'd_Yes', 'd_Yes, but female told only during pregnancy',
            'BMI_W'
        ]

        df_ordered = diseases.reindex(columns=desired_order)


        pkl_file_path = os.environ.get('SCALER_MODEL_PATH')
        with open(pkl_file_path, 'rb') as file:
            loaded_scaler = pickle.load(file)

        numerical_columns = ['Height_(cm)', 'Alcohol_Consumption', 'Fruit_Consumption',
                     'Green_Vegetables_Consumption', 'FriedPotato_Consumption', 'BMI_W']
        
        df_ordered[numerical_columns] = loaded_scaler.transform(df_ordered[numerical_columns])

        pkl_file_path = os.environ.get('MODELDTC')
        with open(pkl_file_path, "rb") as file:
            model = pickle.load(file)
        
        heart_disease_prediction = model.predict(df_ordered)

        print(json.dumps({"Heart_Disease_Prediction": str(heart_disease_prediction[0])}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

preprocess()