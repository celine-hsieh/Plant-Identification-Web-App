from tensorflow.keras.models import load_model
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# Load the trained model
model = load_model('./python/FV.h5')

# Load your test data and labels
# test_data = ...  # Replace with your test data
# test_labels = ...  # Replace with your test labels
test_labels = {0: 'apple', 1: 'banana', 2: 'beetroot', 3: 'bell pepper', 4: 'cabbage', 5: 'capsicum', 6: 'carrot',
          7: 'cauliflower', 8: 'chilli pepper', 9: 'corn', 10: 'cucumber', 11: 'eggplant', 12: 'garlic', 13: 'ginger',
          14: 'grapes', 15: 'jalepeno', 16: 'kiwi', 17: 'lemon', 18: 'lettuce',
          19: 'mango', 20: 'onion', 21: 'orange', 22: 'paprika', 23: 'pear', 24: 'peas', 25: 'pineapple',
          26: 'pomegranate', 27: 'potato', 28: 'raddish', 29: 'soy beans', 30: 'spinach', 31: 'sweetcorn',
          32: 'sweetpotato', 33: 'tomato', 34: 'turnip', 35: 'watermelon'}

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

# Load the trained model
model = load_model('your_model.h5')

# Define the path to your test data
test_data_dir = 'path_to_your_test_data'

# Define ImageDataGenerator for test set
test_datagen = ImageDataGenerator(rescale=1./255)  # include any other preprocessing used during training

# Load test data
test_generator = test_datagen.flow_from_directory(
    test_data_dir,
    target_size=(height, width),  # replace with the input size of your model
    batch_size=batch_size,        # can be any number that fits in your memory (smaller than your test set size)
    class_mode='categorical',     # for multi-class classification
    shuffle=False)                # important to keep data in order

# Predict the output
test_steps_per_epoch = np.math.ceil(test_generator.samples / test_generator.batch_size)
predictions = model.predict(test_generator, steps=test_steps_per_epoch)

# Get most likely class
predicted_classes = np.argmax(predictions, axis=1)

# Map predictions to correct labels
label_map = (test_generator.class_indices)
label_map = dict((v,k) for k,v in label_map.items())  # flip k,v
predictions_labels = [label_map[k] for k in predicted_classes]

# Evaluate the model
true_classes = test_generator.classes
conf_matrix = confusion_matrix(true_classes, predicted_classes)
report = classification_report(true_classes, predicted_classes, target_names=list(test_labels.values()))

print("Confusion Matrix:")
print(conf_matrix)
print("\nClassification Report:")
print(report)


# # Make predictions
# predictions = model.predict(test_data)
# predicted_classes = np.argmax(predictions, axis=1)

# # Evaluate the model
# true_classes = np.argmax(test_labels, axis=1)
# conf_matrix = confusion_matrix(true_classes, predicted_classes)
# report = classification_report(true_classes, predicted_classes)

# print("Confusion Matrix:")
# print(conf_matrix)
# print("\nClassification Report:")
# print(report)