import tensorflow as tf
import keras
from keras.src.saving import register_keras_serializable

layers = keras.layers
models = keras.models

"""
TITLE: Hermes Model Architecture Script

A hybrid CNN-RNN model for fire analysis in images/videos, powered by TensorFlow/Keras. 
Processes spatial features with EfficientNetV2 and temporal patterns with LSTM.

MODEL DETAILS:
- Input: 4D tensor (frames, height, width, channels)
- Outputs:
  ┌───────────────────┬──────────────────────────────┐
  │ fire_detected     │ Binary classification        │
  │ type_num          │ Fire type (multi-class)      │
  │ severity_num      │ Severity level (multi-class) │
  │ spread_num        │ Spread rate (multi-class)    │
  │ confidence_score  │ Prediction confidence        │
  └───────────────────┴──────────────────────────────┘

TABLE OF CONTENTS:
1. Classes
   - FrameExtractor : Custom layer for frame extraction from video sequences
2. Functions
   - build_hybrid_model : Main model builder with multi-task outputs

"""

@register_keras_serializable()
class FrameExtractor(layers.Layer):
    """
    Custom Keras layer that extracts a specific frame from a batch of video sequences.
    
    Designed for temporal data processing where input shape is 
    (batch_size, num_frames, height, width, channels). When called, it returns only 
    the frame at `frame_index` for each sequence in the batch.

    Typical use case:
        - Extracting individual frames in a loop for CNN feature extraction
        - Pre-processing before temporal modeling (e.g., LSTM/Transformer)

    Args:
        frame_index: Integer index of the frame to extract (0-based).
    
    Example:
        >>> extractor = FrameExtractor(frame_index=2)
        >>> input_tensor = tf.random.normal([8, 10, 224, 224, 3])  
        # 8 videos, 10 frames each
        >>> output = extractor(input_tensor)  
        # Shape: [8, 224, 224, 3] (only frame #2)
    """
    
    def __init__(self, frame_index, **kwargs):
        super(FrameExtractor, self).__init__(**kwargs)
        self.frame_index = frame_index
        
    def call(self, inputs):
        return inputs[:, self.frame_index]
    
    def get_config(self):
        config = super().get_config()
        config.update({"frame_index": self.frame_index})
        return config


def build_hybrid_model(input_shape=(3, 224, 224, 3), num_classes=4):
    """
    Builds a hybrid CNN-LSTM model for fire analysis in videos/images. The model:
    1. Processes each frame through EfficientNetV2B0 (pre-trained, fine-tunable) to extract features.
    2. For videos (input_shape[0] > 1): 
       - Combines frame features temporally using a Bidirectional LSTM.
    3. For single images (input_shape[0] = 1): 
       - Uses CNN features directly.
    4. Refines features with a Dense(256) + Dropout(0.5) layer.
    5. Outputs five predictions:
       - Fire detection binary (sigmoid)
       - Multi-class classifications: fire type, severity level, spread potential (softmax)
       - Confidence score (sigmoid)

    Args:
        input_shape: (num_frames, height, width, channels). Default assumes 3 RGB frames at 224x224.
        num_classes: Number of classes for type/severity/spread outputs. Default=4.

    Returns:
        A tf.keras.Model with multi-output architecture.
    """
    
    input_layer = layers.Input(shape=input_shape)
    
    base_cnn = tf.keras.applications.EfficientNetV2B0(
        include_top=False,
        weights='imagenet',
        input_shape=input_shape[1:],
        pooling='avg'
    )
    base_cnn.trainable = True  
    
    frame_features = []
    for i in range(input_shape[0]):
        frame = FrameExtractor(i)(input_layer)  
        features = base_cnn(frame)
        frame_features.append(features)
    
    if input_shape[0] > 1:  
        x = layers.Concatenate()(frame_features)
        x = layers.Reshape((input_shape[0], -1))(x)
        x = layers.Bidirectional(layers.LSTM(128))(x)
    else:  
        x = frame_features[0]
    
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    
    fire_detected = layers.Dense(1, activation='sigmoid', name='fire_detected')(x)  
    type_num = layers.Dense(num_classes, activation='softmax', name='type_num')(x)
    severity_num = layers.Dense(num_classes, activation='softmax', name='severity_num')(x)
    spread_num = layers.Dense(num_classes, activation='softmax', name='spread_num')(x)
    confidence_score = layers.Dense(1, activation='sigmoid', name='confidence_score')(x)
    
    return models.Model(
        inputs=input_layer,
        outputs={
            'fire_detected': fire_detected, 
            'type_num': type_num,           
            'severity_num': severity_num,
            'spread_num': spread_num,
            'confidence_score': confidence_score
        }
    )
