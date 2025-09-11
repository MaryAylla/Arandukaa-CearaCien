from flask import Flask, render_template, request, redirect, url_for
import os
import json
from tflite_runtime.interpreter import Interpreter
from PIL import Image, ImageOps
import numpy as np
from werkzeug.utils import secure_filename
from unidecode import unidecode

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
MODEL_PATH = os.path.join(BASE_DIR, 'ia_model', 'model.tflite')
LABELS_PATH = os.path.join(BASE_DIR, 'ia_model', 'labels.txt')
PLANTAS_JSON_PATH = os.path.join(BASE_DIR, 'plantas.json')

interpreter = Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

with open(LABELS_PATH, 'r', encoding='utf-8') as f:
    class_names = [line.strip() for line in f.readlines()]

def carregar_dados_plantas():
    with open(PLANTAS_JSON_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def identificar_planta(caminho_imagem):
    image = Image.open(caminho_imagem).convert('RGB')
    size = (input_details[0]['shape'][1], input_details[0]['shape'][2])
    image = ImageOps.fit(image, size, Image.Resampling.LANCZOS)
    
    image_array = np.asarray(image)
    normalized_image_array = (image_array.astype(np.float32) / 127.5) - 1
    data = np.expand_dims(normalized_image_array, axis=0)

    interpreter.set_tensor(input_details[0]['index'], data)
    interpreter.invoke()
    
    prediction = interpreter.get_tensor(output_details[0]['index'])
    confidence_scores = prediction[0]
    
    index = np.argmax(confidence_scores)
    class_name = class_names[index]
    confidence_score = confidence_scores[index]
    
    nome_planta = class_name.split(' ', 1)[1]
    predicted_slug = unidecode(nome_planta).lower().replace(" ", "-")
    
    return {"slug": predicted_slug, "confianca": confidence_score * 100}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/reconhecedor')
def reconhecedor():
    return render_template('reconhecedor.html')

@app.route('/identificar', methods=['POST'])
def identificar():
    if 'imagem' not in request.files: return redirect(url_for('reconhecedor'))
    arquivo = request.files['imagem']
    if arquivo.filename == '': return redirect(url_for('reconhecedor'))
    
    if arquivo:
        filename = secure_filename(arquivo.filename)
        caminho_salvo = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        arquivo.save(caminho_salvo)
        resultado_final = None
        try:
            predicao_ia = identificar_planta(caminho_salvo)
            plantas_db = carregar_dados_plantas()
            resultado_final = next((planta for planta in plantas_db if planta['slug'] == predicao_ia['slug']), None)
            if resultado_final:
                resultado_final['confianca'] = predicao_ia['confianca']
        finally:
            os.remove(caminho_salvo)
            
        return render_template('resultado.html', planta=resultado_final, confidence=resultado_final.get('confianca') if resultado_final else None)

@app.route('/enciclopedia')
def enciclopedia():
    plantas = carregar_dados_plantas()
    return render_template('enciclopedia.html', plantas=plantas)

@app.route('/planta/<string:slug>')
def planta_detalhe(slug):
    plantas = carregar_dados_plantas()
    planta_encontrada = next((planta for planta in plantas if planta['slug'] == slug), None)
    if planta_encontrada:
        return render_template('planta_detalhe.html', planta=planta_encontrada)
    else:
        return "Planta não encontrada", 404

@app.route('/sobre')
def sobre():
    return render_template('sobre.html')

@app.route('/impacto')
def impacto():
    return render_template('impacto.html')

if __name__ == '__main__':
    app.run(debug=True)