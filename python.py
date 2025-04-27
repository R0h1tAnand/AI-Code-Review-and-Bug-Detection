from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Load the trained model and tokenizer
model = AutoModelForSequenceClassification.from_pretrained("final_model_2")
tokenizer = AutoTokenizer.from_pretrained("final_tokenizer_2")

# Function for model prediction
def get_prediction(user_input):
    # Tokenize the input text
    inputs = tokenizer(user_input, return_tensors="pt", truncation=True, padding=True)

    # Get the model's prediction
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_class = torch.argmax(logits, dim=-1).item()

    # Map prediction to meaningful label
    if predicted_class == 1:
        return "Bug"
    else:
        return "No Bug"

# User input for testing
user_input = input("Enter text for bug detection: ")

# Get and print the prediction
prediction = get_prediction(user_input)
print(f"Prediction: {prediction}")
