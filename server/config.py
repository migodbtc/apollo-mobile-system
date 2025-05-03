import os
from datetime import timedelta

# FlaskConfig Class
# A class dedicated to the configuration of a Flask application, particularly
# for its secret key, session lifetime, and SQL connection.
class FlaskConfig:
    SECRET_KEY = os.urandom(24)
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=360)
    MYSQL_DATABASE_USER = "root"
    MYSQL_DATABASE_PASSWORD = ""
    MYSQL_DATABASE_HOST = "localhost"
    MYSQL_DATABASE_DB = "apollo_system"
    
