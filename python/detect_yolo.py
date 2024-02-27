import sys
from PIL import Image
from keras.preprocessing.image import load_img, img_to_array
import numpy as np
from keras.models import load_model
import requests
from bs4 import BeautifulSoup
import tensorflow as tf

model = tf.saved_model.load('./python/saved_model.pb')
infer = loaded_model.signatures["serving_default"]


def fetch_calories(prediction):
    try:
        url = 'https://www.google.com/search?&q=calories in ' + prediction
        req = requests.get(url).text
        scrap = BeautifulSoup(req, 'html.parser')
        calories = scrap.find("div", class_="BNeawe iBp4i AP7Wnd").text
        return calories
    except Exception as e:
        #print("Can't able to fetch the Calories")
        #print(e)
        print("")


def processed_img(img_path):
    img = load_img(img_path, target_size=(224, 224, 3))
    img = img_to_array(img)
    img = img / 255
    img = np.expand_dims(img, [0])
    
    # Use the loaded model for prediction
    answer = infer(tf.constant(img))['dense']  # 'dense' might vary based on your model's output layer name
    y_class = np.argmax(answer, axis=-1)
    y = y_class[0]
    res = labels[y]
    return res.capitalize()


def main(image_path):
    result = processed_img(image_path)
    print(f"{result}")
    if result in vegetables:
        print('Category: Vegetables')
    else:
        print('Category: Fruit')
    cal = fetch_calories(result)
    if cal:
        print(f'Calories (100 grams): {cal}')

if __name__ == "__main__":
    image_path = sys.argv[1]
    main(image_path)
