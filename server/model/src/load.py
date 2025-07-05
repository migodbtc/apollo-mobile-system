import os
import cv2
import numpy as np
import pandas as pd
import tensorflow as tf

def load_csv(csv_path):
    """
    Function made in order to load the comma-separated file (.csv) into a dataframe.
    The dataframe returned can be used for pandas/numpy/tensorflow operations.

    Args:
        csv_path (str): Path to metadata CSV with image/video paths and labels.

    Returns:
        df (pandas.core.frame.DataFrame): The dataframe of the converted CSV. 
    """
    
    df = pd.read_csv(csv_path)
    
    type_map = {'none': -1, 'small': 0, 'medium': 1, 'large': 2}
    severity_map = {'none': -1, 'mild': 0, 'moderate': 1, 'severe': 2}
    spread_map = {'none': -1, 'low': 0, 'medium': 1, 'high': 2}
    
    df['fire_type'] = df['fire_type'].fillna('none').str.lower()
    df['severity_level'] = df['severity_level'].fillna('none').str.lower()
    df['spread_potential'] = df['spread_potential'].fillna('none').str.lower()
    
    if 'fire_detected' in df.columns:
        df['confidence_score'] = pd.to_numeric(df['fire_detected'], errors='coerce')
        df['confidence_score'] = df['confidence_score'].clip(0, 1).fillna(0.0)
    
    df['type_num'] = df['fire_type'].map(type_map).fillna(-1).astype(int)
    df['severity_num'] = df['severity_level'].map(severity_map).fillna(-1).astype(int)
    df['spread_num'] = df['spread_potential'].map(spread_map).fillna(-1).astype(int)
    
    return df

def load_image(image_path, target_size=(224, 224)):
    """
    Load and preprocess a single image to use for model analysis and inference.
    
    Args: 
        image_path (str): The string of image path file to be loaded. 
        target_size (tuple, optional): Target dimensions (height, width) for resizing. Defaults to (224, 224).

    Returns:
        img (numpy.float32): The image converted into a numpy float32 array. 
    """
    if not os.path.exists(image_path):
        image_path = os.path.join('data', image_path) 
    
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image at {image_path}")
    
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  
    img = cv2.resize(img, target_size)
    img = img.astype(np.float32) / 255.0 
    return img

def load_video(video_path, num_frames=3, target_size=(224, 224)):
    """
    Load and preprocess frames from a video for model input. Extracts evenly spaced frames.

    Args:
        video_path (str): Path to the video file. If not found directly, searches in the 'data' subdirectory.
        num_frames (int, optional): Number of frames to extract. Defaults to 3.
        target_size (tuple, optional): Target dimensions (height, width) for resizing. Defaults to (224, 224).

    Returns:
        numpy.ndarray: Preprocessed frames as a float32 NumPy array with shape (num_frames, height, width, 3).
    """

    if not os.path.exists(video_path):
        video_path = os.path.join('data', video_path)
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video at {video_path}")
    
    frames = []
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    for i in range(num_frames):
        frame_pos = min(i * (total_frames // num_frames), total_frames - 1)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_pos)
        ret, frame = cap.read()
        if ret:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, target_size)
            frame = frame.astype(np.float32) / 255.0  
            frames.append(frame)
    
    cap.release()
    
    if len(frames) == 0:
        raise ValueError(f"No frames extracted from {video_path}")
    
    return np.array(frames)

def generate_csv(df, batch_size=4, confidence_threshold=0.5):
    """
    Generates batches of video/image data and multi-task labels from a DataFrame indefinitely.

    Args:
        df (pandas.DataFrame): DataFrame containing the labels for the fire training data.
        batch_size (int, optional): Number of samples per batch. Defaults to 4.
        confidence_threshold (float, optional): Threshold for fire detection. Defaults to 0.5.

    Yields:
        tuple: (X, y) where:
            - X: Tensor of shape (batch_size, num_frames=3, H=224, W=224, C=3) containing preprocessed frames
            - y: Dictionary of tensors with keys:
                * 'fire_detected': Binary labels [batch_size, 1]
                * 'type_num': One-hot type labels [batch_size, 4]
                * 'severity_num': One-hot severity labels [batch_size, 4]
                * 'spread_num': One-hot spread labels [batch_size, 4]
                * 'confidence_score': Regression targets [batch_size, 1]
    """
    while True:
        batch = df.sample(batch_size)
        X, y = [], {
            'fire_detected': [],
            'type_num': [],
            'severity_num': [],
            'spread_num': [],
            'confidence_score': []
        }
        
        for _, row in batch.iterrows():
            frames = load_video(row['file_path']) if 'video' in row['file_path'] else [load_image(row['file_path'])] * 3
            X.append(frames)
            
            y['fire_detected'].append([1.0] if row['confidence_score'] >= confidence_threshold else [0.0])  
            y['confidence_score'].append([float(row['confidence_score'])]) 
            
            y['type_num'].append(tf.one_hot(row['type_num'], depth=4).numpy())
            y['severity_num'].append(tf.one_hot(row['severity_num'], depth=4).numpy())
            y['spread_num'].append(tf.one_hot(row['spread_num'], depth=4).numpy())
        
        yield tf.stack(X), {
            'fire_detected': tf.convert_to_tensor(y['fire_detected'], dtype=tf.float32), 
            'type_num': tf.convert_to_tensor(y['type_num'], dtype=tf.float32),  
            'severity_num': tf.convert_to_tensor(y['severity_num'], dtype=tf.float32),
            'spread_num': tf.convert_to_tensor(y['spread_num'], dtype=tf.float32),
            'confidence_score': tf.convert_to_tensor(y['confidence_score'], dtype=tf.float32)  
        }
