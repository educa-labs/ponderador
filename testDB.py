import psycopg2 as psql
import json
import datetime

wea = {"cel"
:
"84709353",
"cid"
:
"23",
"cie"
:
678,
"his"
:
678,
"len"
:
687,
"mail"
:
"fahaase@uc.cl",
"mat"
:
678,
"name"
:
"felipe haase",
"nem"
:
687,
"opt"
:
0,
"ran"
:
678,
"region"
:
"XV - Arica y Parinacota",
"rut"
:
"18776006-2",
"switch"
:
"",
"uid"
:
"2"}
print(wea["uid"])
class DB():

    def __init__(self):
        self.conn = psql.connect("dbname=simulador user=fahaase password=123456asd host=pondera.cl port=5432")
        self.cur = self.conn.cursor()


    def cantidadInserciones(self):
        self.cur.execute("SELECT count(DISTINCT rut) FROM simulaciones;")
        for res in self.cur:
            pass

    def get_universities(self):
        """
        Retorna todas las universidades
        {"ues": list of jsons}
        {"uid": id universidad, "name": nombre universidad}
        """
        self.cur.execute("SELECT id,title FROM universities ORDER BY title;")

        ### JSON ###
        dicc = {"ues": [{"uid": u[0], "name": u[1]} for u in self.cur] }
        return json.dumps(dicc)


    def get_university_careers(self, uid):
        """
        Retorna form con las carreras con value=id_carrera
        Retorna JSON de la forma {"result" : [] list of json}
        [] -> {"cid": id_carrera, "name": nombre carrera}
        """
        self.cur.execute("""
            SELECT university_degrees.id, degrees.title 
            FROM university_degrees 
            INNER JOIN degrees
            ON university_degrees.degree_id=degrees.id 
            WHERE university_degrees.university_id=%s
            ORDER BY degrees.title;
            """, (uid, ))

        ### JSON ###
        dicc = {"result": [{"cid": u[0], "name": u[1]} for u in self.cur]}
        return json.dumps(dicc)


    def get_subjects(self, cid):
        """
        Retorna un diccionario
        {"result": 0} -> Prueba Ciencias
        {"result": 1} -> Prueba Historia
        {"result": 2} -> Ambas Pruebas (o ninguna)
        """
        self.cur.execute("""
            SELECT DISTINCT weighings.subject_id, weighings.value
            FROM weighings 
            INNER JOIN weights 
            ON weighings.weight_id = weights.id 
            WHERE weights.university_degree_id = %s
            ORDER BY weighings.subject_id;
            """, (cid, ))
        a = self.cur.fetchall()

        dicc = {"result": 2}
        print(a)
        if len(a) == 3:
            if a[2][0] == 3:
                dicc["result"] = 0
            else:
                dicc["result"] = 1

        return json.dumps(dicc)

    def simulation(self, form):
        """
        Retorna True si la info esta correcta
        False en caso contrario.
        Almacena la informacion en la base de 
        datos.
        1: Matematicas
        2: Lenguaje
        3: Ciencias
        6: Historia
        """

        name = form["name"]
        rut = form["rut"]
        mail = form["mail"]
        region = form["region"]
        cel = form["cel"]

        #Puntajes
        uid = form["uid"]
        cid = form["cid"]

        nem = form["nem"]
        ran = form["ran"]
        mat = form["mat"]
        leng = form["len"]
        cie = form["cie"]
        his = form["his"]

        dicc = {"nem":0, "ran":0, "mat":0, "len":0, "opt": 0, "pond":0, "corte":0, "dif": 0}

        ponderacion = 0
        ponderacion2 = 0
        corte = 0
        ##### Obtener ponderaciones ranking nem #
        self.cur.execute("""
            SELECT DISTINCT weights.nem, weights.ranking FROM
            weights
            WHERE weights.university_degree_id = %s;
            """, (cid,))

        for p in self.cur:
            ponderacion += nem*p[0]
            ponderacion += ran*p[1]
            dicc["nem"] = p[0]*100
            dicc["ran"] = p[1]*100
            break


        ##### Obtener ponderacion de la wea #####
        self.cur.execute("""
            SELECT DISTINCT weighings.subject_id, weighings.value 
            FROM weighings 
            INNER JOIN weights 
            ON weighings.weight_id = weights.id 
            WHERE weights.university_degree_id = %s
            ORDER BY weighings.subject_id;
            """, (cid, ))
        
        weights = self.cur.fetchall()
        try: # Para evitar que se caiga la consulta
            ponderacion += mat*weights[0][1]
            dicc["mat"] = weights[0][1]*100
            ponderacion += leng*weights[1][1]
            dicc["len"] = weights[1][1]*100
        except:
            dicc["mat"] = 0
            dicc["len"] = 0

        if len(weights)>3:
            #Tiene dos pruebas optativas
            dicc["opt"] = weights[2][1]*100

            if weights[2][0] == 3:
                ponderacion2 = ponderacion + cie*weights[2][1]
                ponderacion = ponderacion + his*weights[3][1]
            else:
                ponderacion2 = ponderacion + his*weights[2][1]
                ponderacion = ponderacion + cie*weights[3][1]
            ponderacion = max((ponderacion,ponderacion2))

        elif len(weights) == 3:
            #Tiene solo una
            dicc["opt"] = weights[2][1]*100
            if weights[2][0] == 3:
                ponderacion += cie*weights[2][1]
            else: 
                ponderacion += his*weights[2][1]

        dicc["pond"] = round(ponderacion,1)

        ##### Obtener puntaje ultimo matriculado
        self.cur.execute("""
            SELECT university_degree_years.last_enrolled FROM
            university_degrees
            INNER JOIN university_degree_years
            ON university_degrees.id = university_degree_years.university_degree_id
            WHERE university_degrees.id = %s
            AND university_degree_years.year = '2016';
            """, (cid,))
        for caca in self.cur:
            corte = caca[0]
            dicc["corte"] = corte

        if dicc["corte"]==0:
            self.cur.execute("""
            SELECT university_degree_years.last_enrolled FROM
            university_degrees
            INNER JOIN university_degree_years
            ON university_degrees.id = university_degree_years.university_degree_id
            WHERE university_degrees.id = %s
            AND university_degree_years.year = '2015';
            """, (cid,))
            for caca in self.cur:
                corte = caca[0]
                dicc["corte"] = corte

        # Nombre universidad
        self.cur.execute("""SELECT title FROM universities WHERE id = %s""", (uid,))
        for res in self.cur:
            universidad = res[0]

        # Nombre carrera
        self.cur.execute("""SELECT degrees.title 
            FROM university_degrees 
            INNER JOIN degrees
            ON university_degrees.degree_id=degrees.id 
            WHERE university_degrees.id=%s""", (cid,))
        for res in self.cur:
            carrera = res[0]
        dicc["dif"] = round(ponderacion - corte, 1)
        #Hacer la insercion
        self.cur.execute("""INSERT INTO simulaciones (nombre, rut, mail, region, celular,
        mat, len, cie, his, nem, ran, pond, dif, universidad, carrera, fecha)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (name,rut,mail,region,cel,mat,leng,cie,
            his,nem,ran,ponderacion, ponderacion-dicc["corte"],universidad,
            carrera,datetime.datetime.now(),))
        self.conn.commit()

        return json.dumps(dicc)

lista = []
"""for i in range(1000):
    print(i)
    while True:
        try:
            db = DB()
            lista.append(db)
            lista[i].get_universities
            break
        except:
            pass
    #print(i)
for i in range(999):
    lista[i].conn.close()"""
db = DB()
db.cur.execute("""SELECT web FROM universities WHERE id = %s""",(2,))
for i in db.cur:
    print( i[0])

