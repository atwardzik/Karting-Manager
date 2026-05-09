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
            "INSERT INTO event (name, date, type, track_id) VALUES (%s, %s, %s, %s)",
            (data.get("name"), data.get("date"), data.get("type"), data.get("track_id")),
        )
        get_db().connection.commit()
        return jsonify({"message": "Event added", "id": cur.lastrowid}), 201

    cur.execute("SELECT * FROM event")
    columns = [col[0] for col in cur.description]
    rows = cur.fetchall()

    def serialize(value):
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value

    return jsonify([{col: serialize(val) for col, val in zip(columns, row)} for row in rows])
