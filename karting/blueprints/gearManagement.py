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
        name = data.get("nazwa")
        status = data.get("status", 1)

        cur.execute("INSERT INTO gokart (nazwa, status) VALUES (%s, %s)", (name, status))
        get_db().connection.commit()
        return jsonify({"message": "Kart added", "gokart_id": cur.lastrowid}), 201

    cur.execute("SELECT * FROM gokart")
    columns = [col[0] for col in cur.description]
    rows = cur.fetchall()

    return jsonify([{col: val for col, val in zip(columns, row)} for row in rows])


@bp.route("/api/components", methods=["GET", "POST"])
def manage_components():
    cur = get_db()

    if request.method == "POST":
        data = request.json
        type = data.get("typ")
        engine_hours = data.get("motogodziny", 0)
        mileage = data.get("przebieg", 0)
        installation_date = data.get("data_montazu")
        status = data.get("status", 1)
        gokart_id = data.get("gokart_id")

        if not gokart_id:
            gokart_id = None

        cur.execute(
            """
                INSERT INTO podzespol (typ, motogodziny, przebieg, data_montazu, status, gokart_id)
                VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (type, engine_hours, mileage, installation_date, status, gokart_id),
        )
        get_db().connection.commit()
        return (
            jsonify({"message": "Component added", "podzespol_id": cur.lastrowid}),
            201,
        )

    cur.execute("SELECT * FROM podzespol")
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
    cur.execute("SELECT rola_id FROM users WHERE user_id = %s", (session["user_id"],))
    user_role = cur.fetchone()

    if not user_role or user_role[0] not in [2, 3]:
        return jsonify({"error": "unauthorized"}), 403

    data = request.json
    description = data.get("description")

    if not description:
        return jsonify({"error": "missing_description"}), 400

    component_id = data.get("podzespol_id")

    try:
        cur.execute(
            "INSERT INTO usterka (opis, data_wykrycia, status, podzespol_id) VALUES (%s, %s, %s, %s)",
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

    query = "SELECT u.* FROM usterka u"
    params = []

    if gokart_id:
        query += " JOIN podzespol c ON u.podzespol_id = c.podzespol_id WHERE c.gokart_id = %s"
        params.append(gokart_id)
        if status:
            query += " AND u.status = %s"
            params.append(status)
    else:
        if status:
            query += " WHERE u.status = %s"
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
    cur.execute("SELECT rola_id FROM users WHERE user_id = %s", (session["user_id"],))
    user_role = cur.fetchone()

    if not user_role or user_role[0] != 3:
        return jsonify({"error": "unauthorized"}), 403

    data = request.json
    fault_id = data.get("fault_id")
    service_type = data.get("type")
    description = data.get("description", "")

    try:
        cur.execute("SELECT podzespol_id FROM usterka WHERE usterka_id = %s", (fault_id,))
        fault = cur.fetchone()

        if not fault:
            return jsonify({"error": "fault_not_found"}), 404

        podzespol_id = fault[0]
        new_fault_status = 3 if service_type == "wymiana" else 2
        cur.execute("UPDATE usterka SET status = %s WHERE usterka_id = %s", (new_fault_status, fault_id))
        typ_int = 2 if service_type == "wymiana" else 1
        cur.execute(
            "INSERT INTO serwis (data_serwisu, opis, typ, podzespol_id, user_id) VALUES (%s, %s, %s, %s, %s)",
            (date.today(), description, typ_int, podzespol_id, session["user_id"]),
        )

        if service_type == "wymiana":
            cur.execute(
                "UPDATE podzespol SET status = 0, przebieg = 0 WHERE podzespol_id = %s",
                (podzespol_id,),
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
    service_type = request.args.get("typ")

    query = "SELECT s.* FROM serwis s"
    params = []

    if gokart_id:
        query += " JOIN podzespol c ON s.podzespol_id = c.podzespol_id WHERE c.gokart_id = %s"
        params.append(gokart_id)
        if service_type:
            query += " AND s.typ = %s"
            params.append(service_type)
    else:
        if service_type:
            query += " WHERE s.typ = %s"
            params.append(service_type)

    cur.execute(query, tuple(params))
    columns = [col[0] for col in cur.description]
    rows = cur.fetchall()

    def serialize(value):
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value

    return jsonify([{col: serialize(val) for col, val in zip(columns, row)} for row in rows])
