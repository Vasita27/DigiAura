from flask import Flask, request, jsonify
from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
import torch

app = Flask(__name__)
from flask_cors import CORS
CORS(app)

model = DistilBertForSequenceClassification.from_pretrained("./moral-classifier-final/moral-classifier-final")
tokenizer = DistilBertTokenizerFast.from_pretrained("./moral-classifier-final/moral-classifier-final")

id2label = {0:"Negative",1:"Neutral",2:"Positive"}

@app.post("/classify")
def classify():
    data = request.json
    sentence = data["text"]
    print(f"Classifying sentence: {sentence}")
    # later extract relationship, now assume person = friend
    rel = "friend"
    text = f"Sentence: {sentence}\nRelationship: {rel}"

    inputs = tokenizer(text, return_tensors="pt")
    outputs = model(**inputs)
    label = id2label[outputs.logits.argmax(-1).item()]
    return jsonify({"label": label})

@app.get("/")
def ping():
    return {"status": "classification server running"}

if __name__ == "__main__":
    app.run(port=5000, debug=True)
