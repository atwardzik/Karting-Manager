from datetime import date, datetime
import functools
import MySQLdb.cursors

from flask import (
    Blueprint,
    render_template,
    request,
    session,
    jsonify,
)


from karting.db import get_db

bp = Blueprint("gearManagement", __name__)


@bp.route("/views/gearManagement", methods=["GET"])
def view_gear_management():
    return render_template("fragments/gearManagement.html")


@bp.route("/api/gokarts", methods=["GET", "POST"])
def manage_gokarts():
    cur = get_db()

    if request.method == "POST":
        data = request.json
        name = data.get("name")
        status = data.get("status", 1)

        cur.execute("INSERT INTO gokarts (name, status) VALUES (%s, %s)", (name, status))
        get_db().connection.commit()
        return jsonify({"message": "Kart added", "gokart_id": cur.lastrowid}), 201

    cur.execute("SELECT * FROM gokarts")
    columns = [col[0] for col in cur.description]
    rows = cur.fetchall()

    return jsonify([{col: val for col, val in zip(columns, row)} for row in rows])


@bp.route("/api/components", methods=["GET", "POST"])
def manage_components():
    cur = get_db()

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
                INSERT INTO components (type, engine_hours, mileage, installation_date, status, gokart_id)
                VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (type, engine_hours, mileage, installation_date, status, gokart_id),
        )
        get_db().connection.commit()
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
