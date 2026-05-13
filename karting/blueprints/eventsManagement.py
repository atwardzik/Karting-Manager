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
        data = request.json
        cur.execute(
            "INSERT INTO karting_event (name, date, type, track_id) VALUES (%s, %s, %s, %s)",
            (data.get("name"), data.get("date"), data.get("type"), data.get("track_id")),
        )
        get_db().connection.commit()
        return jsonify({"message": "Event added", "id": cur.lastrowid}), 201

    cur.execute("SELECT * FROM karting_event")
    columns = [col[0] for col in cur.description]
    rows = cur.fetchall()

    def serialize(value):
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value

    return jsonify([{col: serialize(val) for col, val in zip(columns, row)} for row in rows])


@bp.route("/api/races", methods=["POST"])
def record_race():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized: Please log in."}), 401
    cur = get_db()
    cur.execute("SELECT rola_id FROM users WHERE user_id = %s", (session["user_id"],))
    user_role = cur.fetchone()

    if not user_role or user_role[0] != 1:
        return jsonify({"error": "Forbidden: Only admins can record races."}), 403
    data = request.json
    event_id = data.get("event_id")
    weather_conditions = data.get("weather_conditions", 1)
    race_duration = data.get("race_duration", 0)
    track_length = data.get("track_length", 0)
    participations = data.get("participations", [])

    try:
        cur.execute(
            "INSERT INTO wyscig (warunki_pogodowe, wydarzenie_id) VALUES (%s, %s)",
            (weather_conditions, event_id)
        )
        race_id = cur.lastrowid

        for part in participations:
            gokart_id = part.get("gokart_id")
            competitor_id = part.get("competitor_id")
            start_position = part.get("start_position")
            end_position = part.get("end_position")
            cur.execute(
                """INSERT INTO udzial (pozycja_startowa, pozycja_koncowa, zawodnik_id, gokart_id, wyscig_id) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (start_position, end_position, competitor_id, gokart_id, race_id)
            )

            if gokart_id:
                cur.execute(
                    """UPDATE component 
                       SET engine_hours = engine_hours + %s, mileage = mileage + %s 
                       WHERE gokart_id = %s""",
                    (race_duration, track_length, gokart_id)
                )

        get_db().connection.commit()
        return jsonify({
            "message": "Race recorded and components updated successfully", 
            "race_id": race_id
        }), 201

    except Exception as e:
        get_db().connection.rollback()
        return jsonify({"error": f"Failed to record race: {str(e)}"}), 500