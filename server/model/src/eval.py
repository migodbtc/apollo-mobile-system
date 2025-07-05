import tensorflow as tf
from model.src.load import load_csv, generate_csv
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

def evaluate_model(model_path, csv_path):
    # Load model
    model = tf.keras.models.load_model(model_path)
    
    # Load test data
    df = load_csv(csv_path)
    test_gen = generate_csv(df, batch_size=8)
    
    # Evaluate
    results = model.evaluate(test_gen, steps=len(df)//8)
    print(f"Test Loss: {results[0]}")
    print(f"Fire Detection Accuracy: {results[6]}")
    print(f"Type Classification Accuracy: {results[7]}")
    print(f"Severity Classification Accuracy: {results[8]}")
    print(f"Spread Classification Accuracy: {results[9]}")
    print(f"Confidence Score MAE: {results[10]}")
    
    # Generate predictions for detailed metrics
    y_true = {'fire_detected': [], 'type_num': [], 'severity_num': [], 'spread_num': []}
    y_pred = {'fire_detected': [], 'type_num': [], 'severity_num': [], 'spread_num': []}
    
    for i, (X_batch, y_batch) in enumerate(test_gen):
        if i >= len(df)//8:
            break
        preds = model.predict(X_batch, verbose=0)
        
        for key in y_true.keys():
            y_true[key].extend(y_batch[key].numpy())
            y_pred[key].extend(preds[list(y_batch.keys()).index(key)])
    
    # Convert to numpy arrays
    for key in y_true.keys():
        y_true[key] = np.array(y_true[key])
        y_pred[key] = np.array(y_pred[key])
    
    # Generate classification reports
    print("\nFire Detection Report:")
    print(classification_report(
        y_true['fire_detected'].argmax(axis=1) if len(y_true['fire_detected'].shape) > 1 else y_true['fire_detected'],
        y_pred['fire_detected'].argmax(axis=1) if len(y_pred['fire_detected'].shape) > 1 else (y_pred['fire_detected'] > 0.5).astype(int),
        target_names=['No Fire', 'Fire']
    ))
    
    print("\nFire Type Report:")
    print(classification_report(
        y_true['type_num'].argmax(axis=1),
        y_pred['type_num'].argmax(axis=1),
        target_names=['none', 'small', 'medium', 'large']
    ))
    
    # Plot confusion matrices
    plot_confusion_matrices(y_true, y_pred)

def plot_confusion_matrices(y_true, y_pred):
    plt.figure(figsize=(15, 10))
    
    # Fire detection
    plt.subplot(2, 2, 1)
    cm = confusion_matrix(
        y_true['fire_detected'].argmax(axis=1) if len(y_true['fire_detected'].shape) > 1 else y_true['fire_detected'],
        y_pred['fire_detected'].argmax(axis=1) if len(y_pred['fire_detected'].shape) > 1 else (y_pred['fire_detected'] > 0.5).astype(int)
    )
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['No Fire', 'Fire'], yticklabels=['No Fire', 'Fire'])
    plt.title('Fire Detection')
    
    # Fire type
    plt.subplot(2, 2, 2)
    cm = confusion_matrix(y_true['type_num'].argmax(axis=1), y_pred['type_num'].argmax(axis=1))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['none', 'small', 'medium', 'large'], yticklabels=['none', 'small', 'medium', 'large'])
    plt.title('Fire Type')
    
    plt.tight_layout()
    plt.savefig('confusion_matrices.png')
    plt.show()

if __name__ == "__main__":
    evaluate_model('models/best_model.keras', 'data/labels.csv')