# __init__.py
import os
from flask import Flask, render_template, jsonify, session, request
from flask_mysqldb import MySQL
from datetime import datetime, date

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

    @app.route("/index")
    def index():
        return render_template("index.html")

    from .blueprints import auth
    from .blueprints import gearManagement

    app.register_blueprint(auth.bp)
    app.register_blueprint(gearManagement.bp)

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

    @app.route("/helloUser")
    def hello_user():
        user_id = session["user_id"]

        if not user_id:
            return "You are not logged in!", 401

        return jsonify({"name": session["name"], "surname": session["surname"]})

    @app.route("/kartingHistory")
    def karting_history():
        cur = db.get_db()
        cur.execute("SELECT * FROM karting_event")
        columns = [col[0] for col in cur.description]
        rows = cur.fetchall()

        def serialize(value):
            if isinstance(value, datetime):
                return value.isoformat()
            return value

        events = [
            {col: serialize(val) for col, val in zip(columns, row)} for row in rows
        ]
        return jsonify(events)

    return app
