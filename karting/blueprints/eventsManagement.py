from datetime import date, datetime
from flask import (
    Blueprint,
    render_template,
    request,
    session,
    jsonify,
)

from karting.db import get_db

bp = Blueprint("eventsManagement", __name__)


@bp.route("/views/eventsManagement", methods=["GET"])
def view_events_management():
    return render_template("fragments/eventsManagement.html")


@bp.route("/api/events", methods=["GET", "POST"])
def manage_events():
    cur = get_db()

    if request.method == "POST":
        if "user_id" not in session:
            return jsonify({"error": "Unauthorized: Please log in."}), 403

        cur.execute("SELECT role_id FROM users WHERE user_id = %s", (session["user_id"],))
        user = cur.fetchone()
        if not user or user[0] != 1:
            return jsonify({"error": "forbidden: only admins can add events"}), 403

        data = request.json
        cur.execute(
            "INSERT INTO events (name, date, type, track_id) VALUES (%s, %s, %s, %s)",
            (data.get("name"), data.get("date"), data.get("type"), data.get("track_id")),
        )
        get_db().connection.commit()
        return jsonify({"message": "Event added", "id": cur.lastrowid}), 201

    cur.execute("SELECT * FROM events")
    columns = [col[0] for col in cur.description]
    rows = cur.fetchall()

    def serialize(value):
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value

    return jsonify([{col: serialize(val) for col, val in zip(columns, row)} for row in rows])


@bp.route("/api/add-race", methods=["POST"])
def add_race():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized: Please log in."}), 403

    cur = get_db()

    cur.execute("SELECT role_id FROM users WHERE user_id = %s", (session["user_id"],))
    user = cur.fetchone()
    if not user or user[0] != 1:
        return jsonify({"error": "Forbidden: Only admins can record races."}), 403

    data = request.json

    event_id = data.get("event_id")
    race_duration = data.get("race_duration", 0)
    track_length = data.get("track_length", 0)
    participations = data.get("participations", [])
    name = data.get("name")
    weather_conditions = data.get("weather_conditions")

    if not event_id or not name or weather_conditions is None:
        return jsonify({"error": "missing_fields"}), 400

    cur.execute("SELECT event_id FROM events WHERE event_id = %s", (event_id,))
    if not cur.fetchone():
        return jsonify({"error": "event_not_found"}), 404

    try:
        cur.execute(
            "INSERT INTO races (name, weather_conditions, event_id) VALUES (%s, %s, %s)",
            (name, weather_conditions, event_id),
        )
        get_db().connection.commit()

        race_id = cur.lastrowid
        for part in participations:
            gokart_id = part.get("gokart_id")
            competitor_id = part.get("competitor_id")
            start_position = part.get("start_position")
            end_position = part.get("end_position")
            cur.execute(
                """INSERT INTO participations (starting_position, finishing_position, competitor_id, gokart_id, race_id)
                   VALUES (%s, %s, %s, %s, %s)""",
                (start_position, end_position, competitor_id, gokart_id, race_id),
            )
            if gokart_id:
                cur.execute(
                    """UPDATE components
                       SET engine_hours = engine_hours + %s, mileage = mileage + %s
                       WHERE gokart_id = %s""",
                    (race_duration, track_length, gokart_id),
                )

        return jsonify({"message": "Race recorded and components updated successfully", "race_id": race_id}), 201
    except Exception as e:
        get_db().connection.rollback()
        return jsonify({"error": f"Failed to record race: {str(e)}"}), 500


@bp.route("/api/get-races", methods=["GET"])
def get_races():
    cur = get_db()
    event_id = request.args.get("event_id")
    weather_conditions = request.args.get("weather_conditions")

    query = "SELECT race_id, name, weather_conditions, event_id FROM races"
    filters = []
    params = []

    if event_id:
        filters.append("event_id = %s")
        params.append(event_id)
    if weather_conditions:
        filters.append("weather_conditions = %s")
        params.append(weather_conditions)

    if filters:
        query += " WHERE " + " AND ".join(filters)

    cur.execute(query, tuple(params))
    rows = cur.fetchall()

    races = []
    for row in rows:
        races.append(
            {
                "race_id": row[0],
                "name": row[1],
                "weather_conditions": row[2],
                "event_id": row[3],
            }
        )

    return jsonify({"data": races}), 200
