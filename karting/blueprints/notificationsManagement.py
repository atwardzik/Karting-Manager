# blueprints/notificationsManagement.py
from datetime import date, datetime
from flask import (
    Blueprint,
    render_template,
    request,
    session,
    jsonify,
)
from karting.db import get_db

bp = Blueprint("notificationsManagement", __name__)


@bp.route("/views/notificationsManagement")
def view_notifications_management():
    if "user_id" not in session:
        return render_template("fragments/errorNoLogin.html")

    return render_template("fragments/notificationsManagement.html")


@bp.route("/api/notifications", methods=["GET", "POST"])
def manage_notifications():
    cur = get_db()

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
        get_db().connection.commit()
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


@bp.route("/api/notifications/<int:notification_id>", methods=["DELETE"])
def delete_notification(notification_id):
    cur = get_db()

    cur.execute("DELETE FROM notifications WHERE notification_id = %s", (notification_id,))
    get_db().connection.commit()

    return jsonify({"message": "Notification deleted"}), 200
