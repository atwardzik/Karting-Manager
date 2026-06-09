import os
import subprocess
import threading
import time
from datetime import datetime


def backup_db(app):
    db_host = app.config.get("MYSQL_HOST", "127.0.0.1")
    db_user = app.config.get("MYSQL_USER", "root")
    db_password = app.config.get("MYSQL_PASSWORD", "")
    db_name = app.config.get("MYSQL_DB", "karting")

    project_root = os.path.dirname(app.root_path)
    backup_dir = os.path.join(project_root, "backups")

    try:
        os.makedirs(backup_dir, exist_ok=True)
    except Exception as e:
        app.logger.error(f"[Backup] Failed to create backups directory: {e}")
        return

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(backup_dir, f"backup_{db_name}_{timestamp}.sql")

    cmd = ["mysqldump", "-h", db_host, "-u", db_user]
    if db_password:
        cmd.append(f"-p{db_password}")
    cmd.append(db_name)

    app.logger.info(f"[Backup] Starting database backup to {backup_file}...")

    try:
        with open(backup_file, "w", encoding="utf-8") as f:
            subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True, check=True)
        app.logger.info(f"[Backup] Database backup completed successfully: {backup_file}")
    except subprocess.CalledProcessError as e:
        if os.path.exists(backup_file):
            try:
                os.remove(backup_file)
            except Exception:
                pass
        app.logger.error(f"[Backup] mysqldump command failed: {e.stderr.strip()}")
        app.logger.error("[Backup] Please make sure 'mysqldump' is installed and in your system PATH")
    except FileNotFoundError:
        if os.path.exists(backup_file):
            try:
                os.remove(backup_file)
            except Exception:
                pass
        app.logger.error("[Backup] 'mysqldump' command not found. Make sure MySQL bin directory is in your system PATH")
    except Exception as e:
        if os.path.exists(backup_file):
            try:
                os.remove(backup_file)
            except Exception:
                pass
        app.logger.error(f"[Backup] Database backup failed: {e}")


def start_backup_scheduler(app):
    if app.debug and os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        return

    def run():
        time.sleep(5)  # wait 5 seconds after startup
        while True:
            with app.app_context():
                backup_db(app)
            time.sleep(86400)  # 24h

    thread = threading.Thread(target=run, daemon=True)
    thread.start()
