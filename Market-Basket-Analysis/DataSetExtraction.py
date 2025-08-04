import requests

url = "https://raw.githubusercontent.com/stedy/Machine-Learning-with-R-datasets/master/groceries.csv"
response = requests.get(url)

with open("groceries.csv", "w", encoding='utf-8') as f:
    f.write(response.text)

print("Download complete!")
