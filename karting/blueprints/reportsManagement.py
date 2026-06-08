from datetime import date, datetime
from flask import Blueprint, render_template, jsonify, request
from karting.db import get_db

bp = Blueprint("reportsManagement", __name__)


@bp.route("/views/reportsManagement", methods=["GET"])
def view_reports_management():
    return render_template("fragments/reportsManagement.html")


@bp.route("/api/reports/components-faults", methods=["GET"])
def report_components_faults():
    """
    Zwraca raport o podzespołach, ich przebiegach oraz liczbie zgłoszonych awarii.
    """
    cur = get_db()

    query = """
        SELECT 
            c.component_id,
            c.type AS component_type,
            c.engine_hours,
            c.mileage,
            c.status AS component_status,
            g.gokart_id,
            g.name AS gokart_name,
            COUNT(f.fault_id) AS total_faults
        FROM components c
        LEFT JOIN gokarts g ON c.gokart_id = g.gokart_id
        LEFT JOIN faults f ON c.component_id = f.component_id
        GROUP BY c.component_id, g.gokart_id
        ORDER BY total_faults DESC, c.mileage DESC
    """

    cur.execute(query)
    columns = [col[0] for col in cur.description]
    rows = cur.fetchall()

    return jsonify([{col: val for col, val in zip(columns, row)} for row in rows])


@bp.route("/api/reports/gokart-usage", methods=["GET"])
def report_gokart_usage():
    """
    Zwraca raport informujący o tym, kto używał danego gokartu w jakim wyścigu
    na podstawie tabeli 'participations'.
    """
    cur = get_db()

    # Przejście po relacjach: participations -> races -> events
    # Oraz: participations -> competitors -> users
    query = """
        SELECT 
            e.name AS event_name,
            e.date AS event_date,
            r.name AS race_name,
            g.gokart_id,
            g.name AS gokart_name,
            p.starting_position,
            p.finishing_position,
            CONCAT(u.first_name, ' ', u.last_name) AS driver_name,
            u.email AS driver_email
        FROM participations p
        JOIN races r ON p.race_id = r.race_id
        JOIN events e ON r.event_id = e.event_id
        JOIN gokarts g ON p.gokart_id = g.gokart_id
        JOIN competitors c ON p.competitor_id = c.competitor_id
        JOIN users u ON c.user_id = u.user_id
        ORDER BY e.date DESC, r.name ASC
    """

    try:
        cur.execute(query)
        columns = [col[0] for col in cur.description]
        rows = cur.fetchall()

        def serialize(value):
            if isinstance(value, (datetime, date)):
                return value.isoformat()
            return value

        return jsonify([{col: serialize(val) for col, val in zip(columns, row)} for row in rows])
    except Exception as e:
        return jsonify({"error": "Database query failed.", "details": str(e)}), 500
