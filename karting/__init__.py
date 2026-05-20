# __init__.py
import os
from flask import (
    Flask,
    render_template,
    jsonify,
    session,
    redirect,
    url_for,
    request,
)
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

    @app.route("/")
    def root():
        return redirect(url_for("index"))

    @app.route("/index")
    def index():
        return render_template("index.html")

    from .blueprints import auth
    from .blueprints import gearManagement
    from .blueprints import eventsManagement

    app.register_blueprint(auth.bp)
    app.register_blueprint(gearManagement.bp)
    app.register_blueprint(eventsManagement.bp)

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

        return {"users": [{col: serialize(val) for col, val in zip(columns, row)} for row in rows]}

    @app.route("/helloUser")
    def hello_user():
        user_id = session["user_id"]

        if not user_id:
            return "You are not logged in!", 401

        return jsonify({"name": session["name"], "surname": session["surname"]})

    @app.route("/kartingHistory")
    def karting_history():
        cur = db.get_db()
        cur.execute("SELECT * FROM events")
        columns = [col[0] for col in cur.description]
        rows = cur.fetchall()

        def serialize(value):
            if isinstance(value, datetime):
                return value.isoformat()
            return value

        events = [{col: serialize(val) for col, val in zip(columns, row)} for row in rows]
        return jsonify(events)

    @app.route("/api/gokarts", methods=["GET", "POST"])
    def manage_gokarts():
        cur = db.get_db()

        if request.method == "POST":
            data = request.json
            name = data.get("name")
            status = data.get("status", 1)

            cur.execute("INSERT INTO gokarts (name, status) VALUES (%s, %s)", (name, status))
            db.get_db().connection.commit()
            return jsonify({"message": "Kart added", "gokart_id": cur.lastrowid}), 201

        cur.execute("SELECT * FROM gokarts")
        columns = [col[0] for col in cur.description]
        rows = cur.fetchall()

        return jsonify([{col: val for col, val in zip(columns, row)} for row in rows])

    @app.route("/api/components", methods=["GET", "POST"])
    def manage_components():
        cur = db.get_db()

        if request.method == "POST":
            data = request.json
            type = data.get("type")
            engine_hours = data.get("engine_hours", 0)
            mileage = data.get("mileage", 0)
            installation_date = data.get("installation_date")
            status = data.get("status", 1)
            gokart_id = data.get("gokart_id")

            if not gokart_id:
                gokart_id = None

            cur.execute(
                """
                    INSERT INTO componenets (type, engine_hours, mileage, installation_date, status, gokart_id)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (type, engine_hours, mileage, installation_date, status, gokart_id),
            )
            db.get_db().connection.commit()
            return (
                jsonify({"message": "Component added", "component_id": cur.lastrowid}),
                201,
            )

        cur.execute("SELECT * FROM components")
        columns = [col[0] for col in cur.description]
        rows = cur.fetchall()

        def serialize(value):
            if isinstance(value, (datetime, date)):
                return value.isoformat()
            return value

        return jsonify([{col: serialize(val) for col, val in zip(columns, row)} for row in rows])

    @app.route("/views/notificationsManagement")
    def view_notifications_management():
        return render_template("fragments/notificationsManagement.html")

    @app.route("/api/notifications", methods=["GET", "POST"])
    def manage_notifications():
        cur = db.get_db()

        if request.method == "POST":
            data = request.json
            title = data.get("title", "")
            message = data.get("message", "")
            user_id = data.get("target_user_id")

            full_content = f"[{title}] {message}" if title else message

            if not user_id:
                user_id = None

            cur.execute(
                """
                INSERT INTO notifications (content, created_date, status, user_id)
                VALUES (%s, NOW(), 'Active', %s)
                """,
                (full_content, user_id),
            )
            db.get_db().connection.commit()
            return jsonify({"message": "Notification added", "notification_id": cur.lastrowid}), 201

        date_from = request.args.get("from")
        date_to = request.args.get("to")

        query = "SELECT * FROM notifications"
        filters = []
        params = []

        if date_from:
            filters.append("created_date >= %s")
            params.append(date_from)
        if date_to:
            filters.append("created_date <= %s")
            params.append(date_to)

        if filters:
            query += " WHERE " + " AND ".join(filters)

        query += " ORDER BY created_date DESC"

        cur.execute(query, tuple(params))
        columns = [col[0] for col in cur.description]
        rows = cur.fetchall()

        def serialize(value):
            if isinstance(value, (datetime, date)):
                return value.isoformat()
            return value

        return jsonify([{col: serialize(val) for col, val in zip(columns, row)} for row in rows])

    @app.route("/api/notifications/<int:notification_id>", methods=["DELETE"])
    def delete_notification(notification_id):
        cur = db.get_db()

        cur.execute("DELETE FROM notifications WHERE notification_id = %s", (notification_id,))
        db.get_db().connection.commit()

        return jsonify({"message": "Notification deleted"}), 200

    return app
