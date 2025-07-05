import os
import tensorflow as tf
from keras import layers, Model
from model.src.load import load_csv, load_image, load_video, generate_csv

# Define the model architecture
def create_model(image_shape, num_frames):
    # Image branch
    image_input = layers.Input(shape=image_shape)
    image_features = layers.Conv2D(32, (3, 3), activation='relu')(image_input)
    image_features = layers.MaxPooling2D((2, 2))(image_features)
    image_features = layers.Flatten()(image_features)
    image_features = layers.Dense(128, activation='relu')(image_features)

    # Video branch
    video_input = layers.Input(shape=(num_frames, *image_shape))
    video_features = layers.TimeDistributed(layers.Conv2D(32, (3, 3), activation='relu'))(video_input)
    video_features = layers.TimeDistributed(layers.MaxPooling2D((2, 2)))(video_features)
    video_features = layers.TimeDistributed(layers.Flatten())(video_features)
    video_features = layers.LSTM(128, activation='relu')(video_features)

    # Combine image and video features
    combined_features = layers.Concatenate()([image_features, video_features])
    combined_features = layers.Dense(256, activation='relu')(combined_features)

    # Output layers
    fire_detected_output = layers.Dense(1, activation='sigmoid')(combined_features)
    type_num_output = layers.Dense(4, activation='softmax')(combined_features)
    severity_num_output = layers.Dense(4, activation='softmax')(combined_features)
    spread_num_output = layers.Dense(4, activation='softmax')(combined_features)
    confidence_score_output = layers.Dense(1, activation='sigmoid')(combined_features)

    model = Model(inputs=[image_input, video_input], outputs=[
        fire_detected_output,
        type_num_output,
        severity_num_output,
        spread_num_output,
        confidence_score_output
    ])

    return model

# Compile the model
def compile_model(model):
    model.compile(optimizer='adam',
                  loss={
                      'fire_detected': 'binary_crossentropy',
                      'type_num': 'categorical_crossentropy',
                      'severity_num': 'categorical_crossentropy',
                      'spread_num': 'categorical_crossentropy',
                      'confidence_score': 'mean_squared_error'
                  },
                  metrics={
                      'fire_detected': 'accuracy',
                      'type_num': 'accuracy',
                      'severity_num': 'accuracy',
                      'spread_num': 'accuracy',
                      'confidence_score': 'mean_absolute_error'
                  })

# Train the model
def train_model(model, train_generator, validation_generator):
    history = model.fit(train_generator, epochs=10, validation_data=validation_generator)
    return history

# Main function
def main():
    # Load the data
    labels_df = load_csv('data/labels.csv')

    # Create the data generators
    train_generator = generate_csv(labels_df, batch_size=32)
    validation_generator = generate_csv(labels_df, batch_size=32)

    # Create the model
    model = create_model((224, 224, 3), 3)

    # Compile the model
    compile_model(model)

    # Train the model
    history = train_model(model, train_generator, validation_generator)

    # Save the model
    model.save('fire_detection_model.h5')

if __name__ == "__main__":
    main()
