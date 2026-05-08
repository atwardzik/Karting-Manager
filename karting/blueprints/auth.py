import functools
import MySQLdb.cursors

from flask import (
    Blueprint,
    render_template,
    request,
    session,
    jsonify,
)

from werkzeug.security import generate_password_hash, check_password_hash

from karting.db import get_db

bp = Blueprint("auth", __name__)


@bp.route("/views/login", methods=["GET"])
def view_login():
    return render_template("fragments/login.html")


@bp.route("/login", methods=["POST"])
def login():
    email = request.form["email"]
    password = request.form["password"]

    conn = get_db().connection
    cur = conn.cursor(MySQLdb.cursors.DictCursor)
    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cur.fetchone()

    if user is None:
        return jsonify({"error": "incorrect_email"}), 401

    if user["password"] != password:
        return jsonify({"error": "incorrect_password"}), 401

    session["user_id"] = user["user_id"]
    session["rola_id"] = user["role_id"]
    session["name"] = user["first_name"]
    session["surname"] = user["last_name"]

    return jsonify({"ok": True})


"""
@bp.route("/register", methods=["POST"])
def register():
    email = request.form["email"]
    password = request.form["password"]
    db = get_db()
    error = None
    user = db.execute("SELECT * FROM user WHERE email = ?", (email,)).fetchone()

    if user is None:
        error = "Incorrect email
."
    elif not check_password_hash(user["password"], password):
        error = "Incorrect password."

    if error is None:
        session.clear()
        session["user_id"] = user["id"]
        return redirect(url_for("index"))

    flash(error)
"""
