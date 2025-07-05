import tensorflow as tf
from model.src.load import load_csv, generate_csv
from model.src.model import build_hybrid_model
import matplotlib.pyplot as plt
import datetime

"""
TITLE: Hermes Model Training Script

A training script made in order to publish Keras builds for Hermes. 

TABLE OF CONTENTS:
1. Functions
   - main : Main function to initialize, train and save a new model.
   - plot_history: A helper function to help plot and saved a graph of the model's history.

"""

def main():
    """
    Function that handles the training of the model based on the model.py script. The function:
    1. Loads the data from the .csv file within the 'data' module
    2. Parses the data into dataframes, loaded into generators for efficiency
    3. Builds a local model from model.py and compiles with optimizer, loss and metrics.
    4. Initiates callback functions like model checkpoints, early stopping and learning rate reduction.
    5. Trains the initialized model with the training and validation generators
    6. Saves the model once done into the 'models' module
    7. Plots the history of the training with the helper function 'plot_history'

    Args:
        csv_path (str): Path to metadata CSV with image/video paths and labels
        batch_size (int): Samples per batch (default=32)

    Returns: 
        Two Keras files, one made as a model checkpoint and one made as a final model, saved in models module.
    
    Note:
        Validation metrics are logged but don't affect training. 
    """
    
    df = load_csv('data/labels.csv')
    train_df = df.sample(frac=0.8, random_state=42)
    val_df = df.drop(train_df.index)
    
    train_gen = generate_csv(train_df, batch_size=8)
    val_gen = generate_csv(val_df, batch_size=8)
    
    model = build_hybrid_model()
    model.summary()  
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss={
            'fire_detected': 'binary_crossentropy',
            'type_num': 'categorical_crossentropy',
            'severity_num': 'categorical_crossentropy',
            'spread_num': 'categorical_crossentropy',
            'confidence_score': 'mse' 
        },
        metrics={
            'fire_detected': ['accuracy'],
            'type_num': ['accuracy'],
            'severity_num': ['accuracy'],
            'spread_num': ['accuracy'],
            'confidence_score': ['mae']
        }
    )

    ModelCheckpoint = tf.keras.callbacks.ModelCheckpoint
    EarlyStopping = tf.keras.callbacks.EarlyStopping
    ReduceLROnPlateau = tf.keras.callbacks.ReduceLROnPlateau

    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    callbacks = [
        ModelCheckpoint(f'models/checkpoints/HermesBestModel_{timestamp}.keras', 
                    save_best_only=True, 
                    monitor='val_loss'),
        EarlyStopping(patience=30, restore_best_weights=True),
        ReduceLROnPlateau(factor=0.5, patience=3)
    ]

    history = model.fit(
        train_gen,
        steps_per_epoch=len(train_df)//8,
        validation_data=val_gen,
        validation_steps=len(val_df)//8,
        epochs=25,
        callbacks=callbacks
    )

    file_name = f'models/deployed/HermesSavedBuild_{datetime.datetime.now().strftime("%Y%m%d-%H%M%S")}.keras'
    file_name_2 = f'models/deployed/HermesSavedBuild_{datetime.datetime.now().strftime("%Y%m%d-%H%M%S")}.png'
    
    model.save(file_name)
    
    plot_history(history, file_name_2)

def plot_history(history, file_name_2):
    """
    Function that plots the history of the model as a 4-quadrant interface. Includes:
    1. Training loss
    2. Fire detection accuracy
    3. Fire type accuracy
    4. Confidence score accuracy

    Args:
        history: Keras.callbacks.history. The model's last saved history. 
        file_name: str. The name of the model's file.
    
    Returns: 
        A PNG file of the training history saved in the history module, under the models module.
    
    Note: 
        Validation data is also recorded within each of the graphs.
    """
    
    plt.figure(figsize=(12, 8))
    
    plt.subplot(2, 2, 1)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.title('Loss')
    plt.legend()
    
    plt.subplot(2, 2, 2)
    plt.plot(history.history['fire_detected_accuracy'], label='Train Acc')
    plt.plot(history.history['val_fire_detected_accuracy'], label='Val Acc')
    plt.title('Fire Detection Accuracy')
    plt.legend()
    
    plt.subplot(2, 2, 3)
    plt.plot(history.history['type_num_accuracy'], label='Train Acc')
    plt.plot(history.history['val_type_num_accuracy'], label='Val Acc')
    plt.title('Type Classification Accuracy')
    plt.legend()
    
    plt.subplot(2, 2, 4)
    plt.plot(history.history['confidence_score_mae'], label='Train MAE')
    plt.plot(history.history['val_confidence_score_mae'], label='Val MAE')
    plt.title('Confidence Score MAE')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig(file_name_2)
    plt.show()

if __name__ == "__main__":
    main()