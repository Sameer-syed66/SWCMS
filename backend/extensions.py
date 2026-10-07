from flask_cors import CORS
import mysql.connector

cors = CORS()


def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="swcms"
    )