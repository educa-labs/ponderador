from flask import Flask
from flask import request
from flask import Response, send_from_directory, render_template, request
from db import DB
import json

app = Flask(__name__)


"""@app.route("/")
def index():
    return render_template("index2.html")"""

@app.route("/")
def test():
    return render_template("index.html")


@app.route("/get_universities", methods=['GET'])
def get_universities():
    db = DB()
    ret = db.get_universities()
    db.conn.close()
    #print(ret)
    resp = Response(ret, status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route("/get_careers/<string:uid>", methods=['GET'])
def get_careers(uid):
    db = DB()
    ret = db.get_university_careers(uid)
    db.conn.close()
    #print(ret)
    resp = Response(ret, status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route("/get_subjects/<string:cid>")
def get_subjects(cid):
    db = DB()
    ret = db.get_subjects(cid)
    db.conn.close()
    resp = Response(ret, status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route("/simulation", methods = ['GET', 'POST'])
def makeSimulation():
    if request.method == "GET":
        return "Nice try"
    db = DB()
    
    form = request.get_json(force=True)
    ret = db.simulation(form)
    #print(ret)
    resp = Response(ret, status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    db.conn.close()
    return resp

@app.route("/resultados.csv", methods=['GET'])
def getResults():
    try:
        user = request.args.get('user', '')
        pwd  = request.args.get('pass', '')
    except:
        return ""
    if user == "mvicuna" and pwd == "infopsueslomejor":
        db = DB()
        db.selectSimulaciones()
        db.conn.close()
        return send_from_directory('.', "consultas.csv")
    else:
        return "Contraseña incorrecta"

@app.route("/cantidad", methods = ['GET'])
def cantidad():
    try:
        user = request.args.get('user', '')
        pwd  = request.args.get('pass', '')
    except:
        return "Nice try"
    if user == "mvicuna" and pwd == "infopsueslomejor":
        db = DB()
        ret = db.cantidadInserciones()
        resp = Response(ret, status=200, mimetype='application/json')
        resp.headers['Access-Control-Allow-Origin'] = '*'
        db.conn.close()
        return resp
    else:
        return "Contraseña incorrecta"


##### SEND JS Y CSS ######
### Route de recursos web ###
@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css', path)

@app.route('/img/<path:path>')
def send_img(path):
    return send_from_directory('img', path)


@app.route('/templates/<path:path>')
def send_temp(path):
    return send_from_directory('templates2', path)

if __name__ == "__main__":
    app.run(host="0.0.0.0")