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
    if "user_id" not in session:
        return render_template("fragments/errorNoLogin.html")

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
        return jsonify({"error": "unauthorized"}), 403

    cur = get_db()
    cur.execute("SELECT role_id FROM users WHERE user_id = %s", (session["user_id"],))
    user = cur.fetchone()
    if not user or user[0] != 1:
        return jsonify({"error": "forbidden"}), 403

    data = request.json
    event_id = data.get("event_id")
    name = data.get("name")
    weather_conditions = data.get("weather_conditions")

    if not event_id or not name:
        return jsonify({"error": "missing_fields"}), 400

    cur.execute("SELECT event_id FROM events WHERE event_id = %s", (event_id,))
    if not cur.fetchone():
        return jsonify({"error": "event_not_found"}), 404

    cur.execute("SELECT race_id FROM races WHERE event_id = %s AND name = %s", (event_id, name))
    if cur.fetchone():
        return jsonify({"error": "race_already_exists"}), 400

    weather = (
        int(weather_conditions) if weather_conditions is not None and str(weather_conditions).strip() != "" else None
    )

    try:
        cur.execute(
            "INSERT INTO races (name, weather_conditions, event_id) VALUES (%s, %s, %s)",
            (name, weather, event_id),
        )
        get_db().connection.commit()
        return jsonify({"ok": True, "race_id": cur.lastrowid}), 201
    except Exception as e:
        get_db().connection.rollback()
        return jsonify({"error": f"Failed to add race: {str(e)}"}), 500


@bp.route("/api/races", methods=["POST"])
def record_race():
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
        get_db().connection.commit()
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


@bp.route("/api/set-weather", methods=["POST"])
def set_weather():
    if "user_id" not in session:
        return jsonify({"error": "unauthorized"}), 403

    cur = get_db()
    cur.execute("SELECT role_id FROM users WHERE user_id = %s", (session["user_id"],))
    user = cur.fetchone()
    if not user or user[0] != 1:
        return jsonify({"error": "unauthorized"}), 403

    data = request.json
    if not data:
        return jsonify({"error": "invalid_data"}), 400

    race_id = data.get("race_id")
    weather_conditions = data.get("weather_conditions")

    if race_id is None or weather_conditions is None:
        return jsonify({"error": "invalid_data"}), 400

    try:
        race_id = int(race_id)
        weather_conditions = int(weather_conditions)
    except (ValueError, TypeError):
        return jsonify({"error": "invalid_data"}), 400

    cur.execute("SELECT race_id FROM races WHERE race_id = %s", (race_id,))
    if not cur.fetchone():
        return jsonify({"error": "invalid_data"}), 400

    try:
        cur.execute(
            "UPDATE races SET weather_conditions = %s WHERE race_id = %s",
            (weather_conditions, race_id),
        )
        get_db().connection.commit()
        return jsonify({"ok": True}), 200
    except Exception:
        get_db().connection.rollback()
        return jsonify({"error": "invalid_data"}), 400


@bp.route("/api/set-finishing-position", methods=["POST"])
def set_finishing_position():
    if "user_id" not in session:
        return jsonify({"error": "unauthorized"}), 403

    cur = get_db()
    cur.execute("SELECT role_id FROM users WHERE user_id = %s", (session["user_id"],))
    user = cur.fetchone()
    if not user or user[0] != 1:
        return jsonify({"error": "unauthorized"}), 403

    data = request.json
    if not data:
        return jsonify({"error": "invalid_data"}), 400

    participation_id = data.get("participation_id")
    competitor_id = data.get("competitor_id")
    race_id = data.get("race_id")
    finishing_position = data.get("finishing_position")

    if finishing_position is None:
        return jsonify({"error": "invalid_data"}), 400

    try:
        finishing_position = int(finishing_position)
    except (ValueError, TypeError):
        return jsonify({"error": "invalid_data"}), 400

    if participation_id is not None:
        try:
            participation_id = int(participation_id)
        except (ValueError, TypeError):
            return jsonify({"error": "invalid_data"}), 400

        cur.execute("SELECT participation_id FROM participations WHERE participation_id = %s", (participation_id,))
        if not cur.fetchone():
            return jsonify({"error": "invalid_data"}), 400
    elif competitor_id is not None and race_id is not None:
        try:
            competitor_id = int(competitor_id)
            race_id = int(race_id)
        except (ValueError, TypeError):
            return jsonify({"error": "invalid_data"}), 400

        cur.execute(
            "SELECT participation_id FROM participations WHERE competitor_id = %s AND race_id = %s",
            (competitor_id, race_id),
        )
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "invalid_data"}), 400
        participation_id = row[0]
    else:
        return jsonify({"error": "invalid_data"}), 400

    try:
        cur.execute(
            "UPDATE participations SET finishing_position = %s WHERE participation_id = %s",
            (finishing_position, participation_id),
        )
        get_db().connection.commit()
        return jsonify({"ok": True}), 200
    except Exception:
        get_db().connection.rollback()
        return jsonify({"error": "invalid_data"}), 400


@bp.route("/api/insert-lap", methods=["POST"])
def insert_lap():
    if "user_id" not in session:
        return jsonify({"error": "unauthorized"}), 403

    cur = get_db()
    cur.execute("SELECT role_id FROM users WHERE user_id = %s", (session["user_id"],))
    user = cur.fetchone()
    if not user or user[0] != 1:
        return jsonify({"error": "unauthorized"}), 403

    data = request.json
    if not data:
        return jsonify({"error": "invalid_data"}), 400

    participation_id = data.get("participation_id")
    competitor_id = data.get("competitor_id")
    race_id = data.get("race_id")
    lap_number = data.get("lap_number")
    lap_time = data.get("lap_time")

    if lap_number is None or lap_time is None:
        return jsonify({"error": "invalid_data"}), 400

    try:
        lap_number = int(lap_number)
        lap_time = float(lap_time)
    except (ValueError, TypeError):
        return jsonify({"error": "invalid_data"}), 400

    if participation_id is not None:
        try:
            participation_id = int(participation_id)
        except (ValueError, TypeError):
            return jsonify({"error": "invalid_data"}), 400

        cur.execute("SELECT participation_id FROM participations WHERE participation_id = %s", (participation_id,))
        if not cur.fetchone():
            return jsonify({"error": "invalid_data"}), 400
    elif competitor_id is not None and race_id is not None:
        try:
            competitor_id = int(competitor_id)
            race_id = int(race_id)
        except (ValueError, TypeError):
            return jsonify({"error": "invalid_data"}), 400

        cur.execute(
            "SELECT participation_id FROM participations WHERE competitor_id = %s AND race_id = %s",
            (competitor_id, race_id),
        )
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "invalid_data"}), 400
        participation_id = row[0]
    else:
        return jsonify({"error": "invalid_data"}), 400

    try:
        cur.execute(
            "INSERT INTO laps (lap_number, lap_time, participation_id) VALUES (%s, %s, %s)",
            (lap_number, lap_time, participation_id),
        )
        get_db().connection.commit()
        return jsonify({"ok": True}), 200
    except Exception:
        get_db().connection.rollback()
        return jsonify({"error": "invalid_data"}), 400


@bp.route("/api/user-races", methods=["GET"])
def get_user_races():
    if "user_id" not in session:
        return jsonify({"error": "unauthorized"}), 401

    cur = get_db()

    query = """
        SELECT
            e.name AS event_name,
            r.name AS race_name,
            e.date,
            p.starting_position,
            p.finishing_position
        FROM participations p
        JOIN races r ON p.race_id = r.race_id
        JOIN events e ON r.event_id = e.event_id
        JOIN competitors c ON p.competitor_id = c.competitor_id
        WHERE c.user_id = %s
        ORDER BY e.date DESC
    """

    try:
        cur.execute(query, (session["user_id"],))
        rows = cur.fetchall()
        columns = [col[0] for col in cur.description]
        result = []
        for row in rows:
            row_dict = dict(zip(columns, row))
            if row_dict.get("date"):
                row_dict["date"] = row_dict["date"].isoformat()
            result.append(row_dict)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
