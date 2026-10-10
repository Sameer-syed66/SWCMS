import os
import sys
from dotenv import load_dotenv
import mysql.connector

load_dotenv()

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "swcms")


def init_database():
    print(f"Connecting to MySQL server at {MYSQL_HOST}:{MYSQL_PORT} as '{MYSQL_USER}'...")
    try:
        # Step 1: Connect to server without database to create database if not exists
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        cursor = conn.cursor()
        print(f"Creating database '{MYSQL_DATABASE}' if not exists...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        cursor.close()
        conn.close()

        # Step 2: Connect to the specific database
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        cursor = conn.cursor()

        # Step 3: Run schema.sql
        script_dir = os.path.dirname(os.path.abspath(__file__))
        schema_path = os.path.join(script_dir, "database", "schema.sql")
        if not os.path.exists(schema_path):
            schema_path = os.path.join(script_dir, "..", "Database", "schema.sql")

        print(f"Executing schema from {schema_path}...")
        with open(schema_path, "r", encoding="utf-8") as f:
            schema_sql = f.read()

        for statement in schema_sql.split(";"):
            stmt = statement.strip()
            if stmt and not stmt.lower().startswith("use "):
                try:
                    cursor.execute(stmt)
                except Exception as stmt_err:
                    print(f"Schema statement notice: {stmt_err}")

        conn.commit()

        # Step 4: Run seed.sql
        seed_path = os.path.join(script_dir, "..", "Database", "seed.sql")
        if os.path.exists(seed_path):
            print(f"Executing seed data from {seed_path}...")
            with open(seed_path, "r", encoding="utf-8") as f:
                seed_sql = f.read()

            for statement in seed_sql.split(";"):
                stmt = statement.strip()
                if stmt and not stmt.lower().startswith("use "):
                    try:
                        cursor.execute(stmt)
                    except Exception as seed_err:
                        print(f"Seed statement notice: {seed_err}")

            conn.commit()

        cursor.close()
        conn.close()
        print("Database initialization completed successfully!")
        return True

    except Exception as e:
        print(f"\n[ERROR] Database initialization failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Verify MySQL server is running (Service MySQL80 or XAMPP).")
        print("2. Check MYSQL_PASSWORD in backend/.env matches your root password.")
        print("3. Run: python -m backend.database.db (or test via API /api/health)")
        return False


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
