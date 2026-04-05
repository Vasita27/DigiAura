from deep_translator import GoogleTranslator

def translate_to_english(text):
    try:
        return GoogleTranslator(source='auto', target='en').translate(text)
    except Exception as e:
        print("Translation error:", e)
        return text

def translate_to_telugu(text):
    try:
        return GoogleTranslator(source='en', target='te').translate(text)
    except Exception as e:
        print("Translation error:", e)
        return text

def detect_language(text):
    try:
        # simple detection trick
        translated = GoogleTranslator(source='auto', target='en').translate(text)
        return "te" if translated != text else "en"
    except:
        return "en"