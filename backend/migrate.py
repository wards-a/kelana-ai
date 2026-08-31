import os
import glob
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), "migrations")

def get_connections():
    return psycopg2.connect(DATABASE_URL)

def ensure_migrations_table(conn):
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        """)
    conn.commit()

def applied_version(conn) -> set:
    with conn.cursor() as cur:
        cur.execute("SELECT version FROM schema_migrations;")
        return {row[0] for row in cur.fetchall()}

def run_migration():
    conn = get_connections()
    try:
        ensure_migrations_table(conn)
        done = applied_version(conn)

        # collect and sort SQL files by filename
        pattern = os.path.join(MIGRATIONS_DIR, "*.sql")
        files = sorted(glob.glob(pattern))

        if not files:
            print("No migration file found in", MIGRATIONS_DIR)
            return
        
        pending = [f for f in files if os.path.basename(f) not in done]

        if not pending:
            print("All migrations already applied.")
            return
        
        for filepath in pending:
            version = os.path.basename(filepath)
            print("Applying (vserion) ...", end=" ")

            with open(filepath, "r") as fh:
                sql = fh.read()

            with conn.cursor() as cur:
                cur.execute(sql)
                cur.execute(
                    "INSERT INTO schema_migrations (version) VALUES (%s);",
                    (version,)
                )
            conn.commit()
            print("done.")
        
        print(f"\n{len(pending)} migration(s) applied succesfully.")
    except Exception as exc:
        conn.rollback()
        print(f"\nMigration failed: {exc}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()