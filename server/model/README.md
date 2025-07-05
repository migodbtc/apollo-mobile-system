# **🪽 Hermes: A TensorFlow Machine Learning Model for Apollo Fire Monitoring System**

Hermes is a machine learning model powered by TensorFlow, Pandas, NumPy along with various Python libraries in order to serve as a feature within the Apollo Fire Monitoring System. It can detect not just the presence of a visible fire within the media whether it would be a video or an image, but also several notable factors such as the severity level of the fire, the fire type from small to large, and the spread potential of the fire.

### **🌳 Repository Structure**

Within this repository are different folders containing different data for the model architecture, training data, and model testing along with many more features. Below is a visual representation of the repository, which will be given thorough explanation below the code block.

```
root/
├── data/
├── models/
├── src/
├── requirements.txt
├── README.md                       <<< You are here!
└── .gitignore
```

### **📂 Modules**

A table description on what each module/folder contains.

| Name      | Description                                                                                                                                                                                                                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/`   | Contains a folder named raw, which contains an image folder and a video folder which are both used for the model's learning. It also contains a comma-separated file named `labels.csv` which contains information to be parsed to the model such as `fire_detected`, `severity_level`, `fire_type`, and `spread_potential` |
| `models/` | Contains two folders named checkpoints and deployed. Checkpoints is responsible for storing models for development while deployed is responsible for storing deployment-ready models.                                                                                                                                       |
| `src/`    | Contains the source Python scripts for the model such as model architecture, TensorFlow data conversation, model training and model testing.                                                                                                                                                                                |

### **🔖 Classifications & Types**

The Hermes model returns a JSON object which contains information about the analyzed media. Columns like `fire_detected` and `confidence_score` return a value between 0 to 1, but `fire_type`, `spread_potential`, and `severity_level` return certain values depending on the raw score as seen in the table below. 1 signifies the least and 3 signifies the greatest.
| Magnitude | Fire Type | Severity Level | Spread Potential |
|-------------|-----------|----------------|------------------|
| 1 | small | mild | low |
| 2 | medium | moderate | medium |
| 3 | large | severe | high |

### **⚙️ Model Operation**

The model works by initializing a class instance of `HermesModel` and parsing the location of the `.keras` file as an argument. Additionally, the `DETECTION_THRESHOLD` constant can also be configured on the initialization of the object if the user wishes to increase or decrease the detection threshold of the model.

> The `DETECTION_THRESHOLD` constant is responsible for deciding whether the fire is detected or not. Since the model's `fire_detected` header returns a value between 0 to 1, the fire can only be detected by the model if it passes the constant which by default is `0.5`. So if an image returns a fire detection score of .6671, it is able to pass the default threshold, whereas if a video returns a score of .2944, it is unable to pass the default threshold and therefore it is not detected.

Once the instance has been initialized, the user can use two different prediction methods. The two main methods are `predict_from_path()` and `predict_from_blob()`, with the two serving similar purposes take in different parameters.

1. `predict_from_path()` takes in the file path of the media whether image or video and returns the data of the model's inference of the media wrapped in a JSON file.
2. `predict_from_blob()` takes in the raw blob data of the media and returns the data of the model's inference wrapped in a JSON file as well.

```py
if __name__ == "__main__":
    # Initialize the model with the chosen model version
    model = HermesModel('models/deployed/HermesSavedBuild_20250530-155556.keras')

    # Predict the result of an image accessed
    # via the image's path
    image_result = model.predict('data/raw/img/no_fire/WEB11315.jpg')
    print("\nImage from File Path Prediction:")
    pprint.pprint(image_result)

    # Predict the result of a video accessed
    # via the video's path
    image_result = model.predict('data/raw/video/fire/fire1.avi')
    print("\Video from File Path Prediction:")
    pprint.pprint(image_result)

    # Predict a image in blob data form and
    # return its results
    video_result = model.predict('data/test/blob_data')
    print("\Image from Blob Data Prediction:")
    pprint.pprint(video_result)

    # Predict a video in blob data form and
    # return its results
    video_result = model.predict('data/test/blob_data_2')
    print("\nVideo from Blob Data Prediction:")
    pprint.pprint(video_result)
```

This snippet of code results to...

```
1/1 ━━━━━━━━━━━━━━━━━━━━ 6s 6s/step

Image from File Path Prediction:
{'confidence_percentage': np.float32(54.7),
 'fire_detected': False,
 'raw_output': {'confidence_score': np.float32(0.5470245),
                'fire_detected': np.float32(0.07930134)}}
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 48ms/step
\Video from File Path Prediction:
{'confidence_percentage': np.float32(56.63),
 'fire_detected': True,
 'fire_type': 'small',
 'raw_output': {'confidence_score': np.float32(0.566268),
                'fire_detected': np.float32(0.56954384),
                'severity_num': array([0.40881175, 0.20674972, 0.18837675, 0.19606179], dtype=float32),
                'spread_num': array([0.38772038, 0.1994188 , 0.19137487, 0.22148593], dtype=float32),
                'type_num': array([0.3745756 , 0.18021798, 0.20433725, 0.24086918], dtype=float32)},
 'severity_level': 'mild',
 'spread_potential': 'low'}
1/1 ━━━━━━━━━━━━━━━━━━━━ 9s 9s/step

Image from Blob Data Prediction:
{'confidence_percentage': np.float32(62.95),
 'fire_detected': False,
 'raw_output': {'confidence_score': np.float32(0.6294676),
                'fire_detected': np.float32(0.14650749)}}
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 57ms/step

Video from Blob Data Prediction:
{'confidence_percentage': np.float32(56.32),
 'fire_detected': True,
 'fire_type': 'large',
 'raw_output': {'severity_num': [0.26504984498023987,
                                 0.2488442212343216,
                                 0.2904069721698761,
                                 0.19569894671440125],
                'spread_num': [0.32948780059814453,
                               0.22799862921237946,
                               0.2581063508987427,
                               0.18440721929073334],
                'type_num': [0.24856702983379364,
                             0.22666044533252716,
                             0.3183261454105377,
                             0.20644640922546387]},
 'severity_level': 'severe',
 'spread_potential': 'low'}

```

> **NOTE**: Both the video and the image use the same algorithms, making data prediction consistent throughout the two mediums.

### **🫂 Additional Credits**

The image dataset used within this model is provided by
D-Fire: An Image Dataset for Fire and Smoke Detection. The link to their website can be found here: https://github.com/gaiasd/DFireDataset?tab=readme-ov-file

The video dataset that is used within this model is also by MIVIA in their Fire Detection Dataset website. The link to the website can be found here: https://mivia.unisa.it/datasets/video-analysis-datasets/fire-detection-dataset/
