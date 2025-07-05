
import pprint
import tempfile
import cv2
import tensorflow as tf
import keras
import numpy as np
from model.src.load import load_image, load_video
from model.src.model import FrameExtractor

"""
Hermes Fire Detection Inference Module

This module provides the HermesModel class for performing fire detection and classification
on images and videos using a trained Keras model. It supports predictions from file paths
and from binary blob data (such as uploaded files or streamed data).

Classes:
    HermesModel: Loads a Keras model and provides methods to predict fire presence,
    type, severity, and spread potential from images or videos.

Example usage:
    model = HermesModel('models/deployed/HermesSavedBuild_20250530-155556.keras')
    result = model.predict_from_path('data/raw/img/no_fire/WEB11315.jpg')
    result_blob = model.predict_from_blob(blob_data, content_type='image/jpeg')
"""

class HermesModel:
    def __init__(self, model_path, DETECTION_THRESHOLD=0.5):
        self.model = tf.keras.models.load_model(model_path, custom_objects={'FrameExtractor': FrameExtractor}
)
        self.type_map = {0: 'small', 1: 'medium', 2: 'large', 3: 'none'}
        self.severity_map = {0: 'mild', 1: 'moderate', 2: 'severe', 3: 'none'}
        self.spread_map = {0: 'low', 1: 'medium', 2: 'high', 3: 'none'}
        self.DETECTION_THRESHOLD = DETECTION_THRESHOLD
    
    def predict_from_path(self, file_path):
        if file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
            frames = np.stack([load_image(file_path)] * 3)  
        else:
            frames = load_video(file_path)
        
        frames = np.expand_dims(frames, axis=0)

        predictions = self.model.predict(frames)
        
        spread_num = predictions['spread_num'][0]
        severity_num = predictions['severity_num'][0]
        type_num = predictions['type_num'][0]
        confidence = predictions['confidence_score'][0][0]
        fire_detected = predictions['fire_detected'][0][0]

        fire_detected_index = 1 if fire_detected > self.DETECTION_THRESHOLD else 0
        confidence_percentage = confidence * 100

        type_num_index = np.argmax(type_num)
        spread_num_index = np.argmax(spread_num)
        severity_num_index = np.argmax(severity_num)

        fire_type_label = self.type_map[type_num_index]
        spread_potential_label = self.spread_map[spread_num_index]
        severity_level_label = self.severity_map[severity_num_index]

        results = {
            'fire_detected': bool(fire_detected_index),
            'confidence_percentage': round(confidence_percentage, 2),
            'raw_output': {
                'fire_detected': fire_detected,
                'confidence_score': confidence,
            }
        }

        if fire_detected_index:
            results['fire_type'] = fire_type_label
            results['severity_level'] = severity_level_label
            results['spread_potential'] = spread_potential_label
            results['raw_output'].update({
                'type_num': type_num,
                'severity_num': severity_num,
                'spread_num': spread_num
            })

        return results
    
    def predict_from_blob(self, blob_data, content_type=None):
        if not isinstance(blob_data, (bytes, bytearray)):
            raise TypeError("blob_data must be bytes-like object")
    
        is_image = False
        if content_type and content_type.startswith('image/'):
            is_image = True
        else:
            if blob_data.startswith(b'\xFF\xD8\xFF'):  
                is_image = True
            elif blob_data.startswith(b'\x89PNG'):  
                is_image = True

        if is_image:
            img = cv2.imdecode(
                np.frombuffer(blob_data, dtype=np.uint8),
                cv2.IMREAD_COLOR
            )
            if img is None:
                raise ValueError("Failed to decode image BLOB")
            
            img = cv2.resize(img, (224, 224))
            frames = np.stack([img] * 3)  
        else:
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
                tmp.write(blob_data)
                tmp.flush()
                frames = load_video(tmp.name)
                
                frames = np.array([cv2.resize(frame, (224, 224)) for frame in frames])

        frames = np.expand_dims(frames, axis=0)
        predictions = self.model.predict(frames)
        
        spread_num = predictions['spread_num'][0]
        severity_num = predictions['severity_num'][0]
        type_num = predictions['type_num'][0]
        confidence = predictions['confidence_score'][0][0]
        fire_detected = predictions['fire_detected'][0][0]

        fire_detected_index = 1 if fire_detected > self.DETECTION_THRESHOLD else 0
        confidence_percentage = confidence * 100

        type_num_index = np.argmax(type_num)
        spread_num_index = np.argmax(spread_num)
        severity_num_index = np.argmax(severity_num)

        fire_type_label = self.type_map[type_num_index]
        spread_potential_label = self.spread_map[spread_num_index]
        severity_level_label = self.severity_map[severity_num_index]

        results = {
            'fire_detected': bool(fire_detected_index),
            'confidence_percentage': round(confidence_percentage, 2),
            'raw_output': {
                'fire_detected': fire_detected,
                'confidence_score': confidence,
            }
        }

        if fire_detected_index:
            results.update({
                'fire_type': fire_type_label,
                'severity_level': severity_level_label,
                'spread_potential': spread_potential_label,
                'raw_output': {
                    'type_num': type_num.tolist(),
                    'severity_num': severity_num.tolist(),
                    'spread_num': spread_num.tolist()
                }
            })

        return results

# EXAMPLE USAGE
if __name__ == "__main__":
    # Initialize the model with the chosen model version
    model = HermesModel('models/deployed/HermesSavedBuild_20250530-155556.keras')

    # Predict the result of an image accessed via the image's path
    a = model.predict_from_path('data/raw/img/no_fire/WEB11315.jpg')
    print("\nImage from File Path Prediction:")
    pprint.pprint(a)

    # Predict the result of a video accessed via the video's path
    b = model.predict_from_path('data/raw/video/fire/fire1.avi')
    print("\Video from File Path Prediction:")
    pprint.pprint(b)

    # Predict a image in blob data form and return its results
    with open('data/test/blob_data', 'rb') as f:  # Read as binary
        blob_data = f.read()
    c = model.predict_from_blob(blob_data, content_type='image/jpeg')  
    print("\nVideo from Blob Data Prediction:")
    pprint.pprint(c)

    # Predict a video in blob data form and return its results
    with open('data/test/blob_data_2', 'rb') as f:  # Read as binary
        blob_data_2 = f.read()
    d = model.predict_from_blob(blob_data_2, content_type='video/mp4')  
    print("\nVideo from Blob Data Prediction:")
    pprint.pprint(d)