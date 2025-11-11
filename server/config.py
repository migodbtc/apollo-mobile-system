import os
from datetime import timedelta
from celery import Celery, Task
from flask import Flask

# FlaskConfig Class
# A class dedicated to the configuration of a Flask application, particularly
# for its secret key, session lifetime, and SQL connection.
class FlaskConfig:
    SECRET_KEY = os.urandom(24)
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=360)
    MYSQL_DATABASE_USER = "admin"
    MYSQL_DATABASE_PASSWORD = "YouAndI1234;"
    MYSQL_DATABASE_PORT = 3306
    MYSQL_DATABASE_HOST = "apollo-mariadb-3.cheq8aacozpj.ap-southeast-1.rds.amazonaws.com"
    MYSQL_DATABASE_DB = "apollo_system"



    
