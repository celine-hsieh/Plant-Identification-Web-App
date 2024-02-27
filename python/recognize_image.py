# -*- coding: utf-8 -*-

import sys
from PIL import Image
from keras.preprocessing.image import load_img, img_to_array
import numpy as np
from keras.models import load_model
import requests
from bs4 import BeautifulSoup
import json

model = load_model('./python/FV.h5')
labels = {
    0: {'en': 'apple', 'zh': '蘋果'},
    1: {'en': 'banana', 'zh': '香蕉'},
    2: {'en': 'beetroot', 'zh': '甜菜根'},
    3: {'en': 'bell pepper', 'zh': '甜椒'},
    4: {'en': 'cabbage', 'zh': '高麗菜'},
    5: {'en': 'capsicum', 'zh': '辣椒'},
    6: {'en': 'carrot', 'zh': '紅蘿蔔'},
    7: {'en': 'cauliflower', 'zh': '花椰菜'},
    8: {'en': 'chilli pepper', 'zh': '辣椒'},
    9: {'en': 'corn', 'zh': '玉米'},
    10: {'en': 'cucumber', 'zh': '黃瓜'},
    11: {'en': 'eggplant', 'zh': '茄子'},
    12: {'en': 'garlic', 'zh': '大蒜'},
    13: {'en': 'ginger', 'zh': '薑'},
    14: {'en': 'grapes', 'zh': '葡萄'},
    15: {'en': 'jalepeno', 'zh': '墨西哥辣椒'},
    16: {'en': 'kiwi', 'zh': '奇異果'},
    17: {'en': 'lemon', 'zh': '檸檬'},
    18: {'en': 'lettuce', 'zh': '生菜'},
    19: {'en': 'mango', 'zh': '芒果'},
    20: {'en': 'onion', 'zh': '洋蔥'},
    21: {'en': 'orange', 'zh': '橙子'},
    22: {'en': 'paprika', 'zh': '甜椒粉'},
    23: {'en': 'pear', 'zh': '梨'},
    24: {'en': 'peas', 'zh': '豌豆'},
    25: {'en': 'pineapple', 'zh': '鳳梨'},
    26: {'en': 'pomegranate', 'zh': '石榴'},
    27: {'en': 'potato', 'zh': '馬鈴薯'},
    28: {'en': 'radish', 'zh': '白蘿蔔'},
    29: {'en': 'soy beans', 'zh': '大豆'},
    30: {'en': 'spinach', 'zh': '菠菜'},
    31: {'en': 'sweetcorn', 'zh': '甜玉米'},
    32: {'en': 'sweetpotato', 'zh': '地瓜'},
    33: {'en': 'tomato', 'zh': '番茄'},
    34: {'en': 'turnip', 'zh': '大頭菜'},
    35: {'en': 'watermelon', 'zh': '西瓜'}
}

# labels = {0: 'apple', 1: 'banana', 2: 'beetroot', 3: 'bell pepper', 4: 'cabbage', 5: 'capsicum', 6: 'carrot',
#           7: 'cauliflower', 8: 'chilli pepper', 9: 'corn', 10: 'cucumber', 11: 'eggplant', 12: 'garlic', 13: 'ginger',
#           14: 'grapes', 15: 'jalepeno', 16: 'kiwi', 17: 'lemon', 18: 'lettuce',
#           19: 'mango', 20: 'onion', 21: 'orange', 22: 'paprika', 23: 'pear', 24: 'peas', 25: 'pineapple',
#           26: 'pomegranate', 27: 'potato', 28: 'raddish', 29: 'soy beans', 30: 'spinach', 31: 'sweetcorn',
#           32: 'sweetpotato', 33: 'tomato', 34: 'turnip', 35: 'watermelon'}

fruits = ['Apple', 'Banana', 'Bello Pepper', 'Chilli Pepper', 'Grapes', 'Jalepeno', 'Kiwi', 'Lemon', 'Mango', 'Orange',
          'Paprika', 'Pear', 'Pineapple', 'Pomegranate', 'Watermelon']
vegetables = ['Beetroot', 'Cabbage', 'Capsicum', 'Carrot', 'Cauliflower', 'Corn', 'Cucumber', 'Eggplant', 'Ginger',
              'Lettuce', 'Onion', 'Peas', 'Potato', 'Radish', 'Soy Beans', 'Spinach', 'Sweetcorn', 'Sweetpotato',
              'Tomato', 'Turnip', 'Garlic']


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
    answer = model.predict(img)
    y_class = answer.argmax(axis=-1)
    y = " ".join(str(x) for x in y_class)
    return int(y)  # Return the predicted class index



def main(image_path, language):
    predicted_index = processed_img(image_path)  # Get the predicted class index
    result = labels[predicted_index][language]  # Get the label using the predicted index
    en = 'en'
    result_en = labels[predicted_index][en]  # Get the label using the predicted index
      
    # Store all the messages in a list
    messages = []
    messages.append(result)
    
    if result_en.capitalize() in vegetables:
        messages.append('Category: Vegetables' if language == 'en' else '類別: 蔬菜')
    else:
        messages.append('Category: Fruit' if language == 'en' else '類別: 水果')
    
    cal = fetch_calories(result_en)
    if cal:
        messages.append(f'Calories (100 grams): {cal}' if language == 'en' else f'卡路里 (100 克): {cal}')

    # Send the result text and all messages as a JSON object to stdout
    output = {
        "result": result,
        "messages": messages
    }
    print(json.dumps(output))



if __name__ == "__main__":
    image_path = sys.argv[1]
    language = 'en' if sys.argv[2] == '0' else 'zh'
    main(image_path, language)
