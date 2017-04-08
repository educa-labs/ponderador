killall gunicorn
echo "Deteniendo servidor por si estaba corriendo"
#gunicorn -b 0.0.0.0:80 -D server:app -w 1 --threads 6 --log-file ./caca --log-level debug
#gunicorn -b 0.0.0.0:90 -D server:app -k gevent --max-connections 1000
gunicorn -b 0.0.0.0:80 -D server:app -w 5 --threads 12
echo "Corriendo servidor en puerto 80"