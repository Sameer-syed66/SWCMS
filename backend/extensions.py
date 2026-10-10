import os
from dotenv import load_dotenv
from flask_cors import CORS
import mysql.connector

load_dotenv()

cors = CORS()


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "swcms")
    )