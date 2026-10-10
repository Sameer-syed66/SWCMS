import os
import sys
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash
import mysql.connector

load_dotenv()

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "swcms")


def create_admin(username="admin", password="Admin@123", full_name="System Administrator", email="admin@swcms.com"):
    print(f"Creating / Updating administrator account '{username}'...")
    password_hash = generate_password_hash(password)

    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        cursor = conn.cursor()
        query = """
            INSERT INTO administrators (username, password_hash, full_name, email)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                password_hash = VALUES(password_hash),
                full_name = VALUES(full_name),
                email = VALUES(email)
        """
        cursor.execute(query, (username, password_hash, full_name, email))
        conn.commit()
        cursor.close()
        conn.close()
        print(f"Successfully configured administrator '{username}' in MySQL!")
        return True
    except Exception as e:
        print(f"Failed to connect to MySQL: {e}")
        print("Note: The in-memory fallback already has 'admin' / 'Admin@123' ready for testing.")
        return False


if __name__ == "__main__":
    u = sys.argv[1] if len(sys.argv) > 1 else "admin"
    p = sys.argv[2] if len(sys.argv) > 2 else "Admin@123"
    create_admin(u, p)
