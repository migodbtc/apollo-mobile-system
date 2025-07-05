from model.src.inference import HermesModel
from pprint import pprint

if __name__ == "__main__":

    model = HermesModel('model/models/deployed/HermesSavedBuild_20250530-155556.keras')

    # Predict the result of an image accessed via the image's path
    a = model.predict_from_path('model/data/raw/img/no_fire/WEB11315.jpg')
    print("\nImage from File Path Prediction:")
    pprint(a)

    # Predict the result of a video accessed via the video's path
    b = model.predict_from_path('model/data/raw/video/fire/fire1.avi')
    print("\Video from File Path Prediction:")
    pprint(b)

    # Predict a image in blob data form and return its results
    with open('model/data/test/blob_data', 'rb') as f:  # Read as binary
        blob_data = f.read()
    c = model.predict_from_blob(blob_data, content_type='image/jpeg')  
    print("\nVideo from Blob Data Prediction:")
    pprint(c)

    # Predict a video in blob data form and return its results
    with open('model/data/test/blob_data_2', 'rb') as f:  # Read as binary
        blob_data_2 = f.read()
    d = model.predict_from_blob(blob_data_2, content_type='video/mp4')  
    print("\nVideo from Blob Data Prediction:")
    pprint(d)