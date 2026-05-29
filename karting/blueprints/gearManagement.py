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


@bp.route("/api/report-fault", methods=["POST"])
def report_fault():
    if "user_id" not in session:
        return jsonify({"error": "unauthorized"}), 403

    cur = get_db()
    cur.execute("SELECT role_id FROM users WHERE user_id = %s", (session["user_id"],))
    user_role = cur.fetchone()

    if not user_role or user_role[0] not in [2, 3]:
        return jsonify({"error": "unauthorized"}), 403

    data = request.json
    description = data.get("description")

    if not description:
        return jsonify({"error": "missing_description"}), 400

    component_id = data.get("component_id")

    try:
        cur.execute(
            "INSERT INTO faults (description, detection_date, status, component_id) VALUES (%s, %s, %s, %s)",
            (description, date.today(), 1, component_id),
        )

        get_db().connection.commit()
        return jsonify({"ok": True}), 201
    except Exception as e:
        get_db().connection.rollback()
        return jsonify({"error": str(e)}), 500


@bp.route("/api/get-faults", methods=["GET"])
def get_faults():
    cur = get_db()
    gokart_id = request.args.get("gokart_id")
    status = request.args.get("status")

    query = "SELECT f.* FROM faults f"
    params = []

    if gokart_id:
        query += " JOIN components c ON f.component_id = c.component_id WHERE c.gokart_id = %s"
        params.append(gokart_id)
        if status:
            query += " AND f.status = %s"
            params.append(status)
    else:
        if status:
            query += " WHERE f.status = %s"
            params.append(status)

    cur.execute(query, tuple(params))
    columns = [col[0] for col in cur.description]
    rows = cur.fetchall()

    def serialize(value):
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value

    return jsonify([{col: serialize(val) for col, val in zip(columns, row)} for row in rows])


@bp.route("/api/add-service", methods=["POST"])
def add_service():
    if "user_id" not in session:
        return jsonify({"error": "unauthorized"}), 403

    cur = get_db()
    cur.execute("SELECT role_id FROM users WHERE user_id = %s", (session["user_id"],))
    user_role = cur.fetchone()

    if not user_role or user_role[0] != 3:
        return jsonify({"error": "unauthorized"}), 403

    data = request.json
    fault_id = data.get("fault_id")
    service_type = data.get("type")
    description = data.get("description", "")

    try:
        cur.execute("SELECT component_id FROM faults WHERE fault_id = %s", (fault_id,))
        fault = cur.fetchone()

        if not fault:
            return jsonify({"error": "fault_not_found"}), 404

        component_id = fault[0]

        if service_type == "replacements":
            cur.execute("UPDATE faults SET status = 3 WHERE fault_id = %s", (fault_id,))
            cur.execute(
                "INSERT INTO replacements (replacement_date, description, component_id, user_id) VALUES (%s, %s, %s, %s)",
                (date.today(), description, component_id, session["user_id"]),
            )

            cur.execute(
                "UPDATE components SET status = 0, mileage = 0 WHERE component_id = %s",
                (component_id,),
            )
        else:
            cur.execute("UPDATE faults SET status = 2 WHERE fault_id = %s", (fault_id,))
            cur.execute(
                "INSERT INTO services (service_date, description, type, component_id, user_id) VALUES (%s, %s, %s, %s, %s)",
                (date.today(), description, 1, component_id, session["user_id"]),
            )

        get_db().connection.commit()
        return jsonify({"ok": True}), 201

    except Exception as e:
        get_db().connection.rollback()
        return jsonify({"error": str(e)}), 500


@bp.route("/api/get-services", methods=["GET"])
def get_services():
    cur = get_db()
    gokart_id = request.args.get("gokart_id")
    service_type = request.args.get("type")

    query = "SELECT s.* FROM services s"
    params = []

    if gokart_id:
        query += " JOIN components c ON s.component_id = c.component_id WHERE c.gokart_id = %s"
        params.append(gokart_id)
        if service_type:
            query += " AND s.type = %s"
            params.append(service_type)
    else:
        if service_type:
            query += " WHERE s.type = %s"
            params.append(service_type)

    cur.execute(query, tuple(params))
    columns = [col[0] for col in cur.description]
    rows = cur.fetchall()

    def serialize(value):
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value

    return jsonify([{col: serialize(val) for col, val in zip(columns, row)} for row in rows])


@bp.route("/api/get-replacements", methods=["GET"])
def get_replacements():
    cur = get_db()
    gokart_id = request.args.get("gokart_id")

    query = "SELECT r.* FROM replacements r"
    params = []

    if gokart_id:
        query += " JOIN components c ON r.component_id = c.component_id WHERE c.gokart_id = %s"
        params.append(gokart_id)

    cur.execute(query, tuple(params))
    columns = [col[0] for col in cur.description]
    rows = cur.fetchall()

    def serialize(value):
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value

    return jsonify([{col: serialize(val) for col, val in zip(columns, row)} for row in rows])