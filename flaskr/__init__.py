# __init__.py
import os
from flask import Flask, render_template
from flask_mysqldb import MySQL
from datetime import datetime

mysql = MySQL()


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY="dev",
    )
    app.config["MYSQL_HOST"] = "127.0.0.1"
    app.config["MYSQL_USER"] = "root"
    app.config["MYSQL_PASSWORD"] = ""
    app.config["MYSQL_DB"] = "karting"

    if test_config is None:
        app.config.from_pyfile("config.py", silent=True)
    else:
        app.config.from_mapping(test_config)

    os.makedirs(app.instance_path, exist_ok=True)

    mysql.init_app(app)

    from . import db

    db.init_app(app)

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/hello")
    def hello():
        return "Hello, World!"

    @app.route("/users")
    def get_users():
        cur = db.get_db()

        cur.execute("SELECT * FROM users")
        columns = [col[0] for col in cur.description]
        rows = cur.fetchall()

        def serialize(value):
            if isinstance(value, datetime):
                return value.isoformat()  # also handle datetime while we're at it
            return value

        return {
            "users": [
                {col: serialize(val) for col, val in zip(columns, row)} for row in rows
            ]
        }

    return app
