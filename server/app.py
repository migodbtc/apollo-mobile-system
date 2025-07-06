from flask import Flask
from flask_cors import CORS
from flaskext.mysql import MySQL
from config import FlaskConfig

class FlaskApp:

    def __init__(self, config_class=FlaskConfig):
        self.app = Flask(
            __name__
        )
        self.app.config.from_object(config_class)
        CORS(self.app)

        self.mysql = MySQL()
        self.mysql.init_app(app=self.app)        

    def run(self, *args, **kwargs):
        self.app.run(*args, **kwargs)


app_instance = FlaskApp()
app = app_instance.app
mysql = app_instance.mysql
