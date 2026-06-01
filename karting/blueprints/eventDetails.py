from datetime import date, datetime
from flask import (
    Blueprint,
    json,
    render_template,
    request,
    session,
    jsonify,
)

from karting.db import get_db

bp = Blueprint("eventDetails", __name__)


@bp.route("/views/eventDetails", methods=["GET"])
def view_events_management():
    return render_template("fragments/eventDetails.html")


@bp.route("/api/subevents", methods=("GET",))
def manage_events():
    cur = get_db()
    event_id = request.args.get("id")

    cur.execute("SELECT * FROM races WHERE event_id=%s", (event_id,))
    columns = [col[0] for col in cur.description]
    rows = cur.fetchall()

    def serialize(value):
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value

    return jsonify([{col: serialize(val) for col, val in zip(columns, row)} for row in rows])


@bp.route("/api/laps", methods=["GET"])
def get_laps():
    race_id = request.args.get("race_id")
    if not race_id:
        return jsonify({"error": "race_id is required"}), 400
    cur = get_db()
    cur.execute(
        """
        SELECT
            p.participation_id,
            p.competitor_id,
            p.starting_position,
            p.finishing_position,
            COALESCE(
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'lap_number', l.lap_number,
                            'time', l.lap_time
                        )
                    )
                    FROM (
                        SELECT *
                        FROM laps l2
                        WHERE l2.participation_id = p.participation_id
                        ORDER BY l2.lap_number
                    ) l
                ),
                JSON_ARRAY()
            ) AS laps
        FROM participations p
        WHERE p.race_id = %s
        GROUP BY
            p.participation_id,
            p.competitor_id,
            p.starting_position,
            p.finishing_position
        ORDER BY p.starting_position
        """,
        (race_id,),
    )
    rows = cur.fetchall()
    columns = [col[0] for col in cur.description]
    result = []
    for row in rows:
        record = dict(zip(columns, row))
        # MySQL returns JSON columns as strings — parse them
        if isinstance(record["laps"], str):
            record["laps"] = json.loads(record["laps"])
        result.append(record)
    return jsonify(result)
