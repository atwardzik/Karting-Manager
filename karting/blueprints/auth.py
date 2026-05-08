import functools
import MySQLdb.cursors

from flask import (
    Blueprint,
    render_template,
    request,
    session,
    jsonify,
    redirect,
    url_for,
)

from werkzeug.security import generate_password_hash, check_password_hash

from karting.db import get_db

bp = Blueprint("auth", __name__)


@bp.route("/views/login", methods=["GET"])
def view_login():
    return render_template("fragments/login.html")


@bp.route("/views/signup", methods=["GET"])
def view_signup():
    return render_template("fragments/signup.html")


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

    if not check_password_hash(user["password"], password):
        return jsonify({"error": "incorrect_password"}), 401

    session["user_id"] = user["user_id"]
    session["rola_id"] = user["role_id"]
    session["name"] = user["first_name"]
    session["surname"] = user["last_name"]

    return jsonify({"ok": True})


@bp.route("/logout", methods=["GET", "POST"])
def logout():
    session.clear()
    return redirect(url_for("index"))


@bp.route("/register", methods=["POST"])
def register():
    first_name = request.form["first_name"]
    last_name = request.form["last_name"]
    email = request.form["email"]
    password = request.form["password"]

    conn = get_db().connection
    cur = conn.cursor(MySQLdb.cursors.DictCursor)

    cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    if cur.fetchone() is not None:
        return jsonify({"error": "email_taken"}), 409

    hashed = generate_password_hash(password)

    cur.execute(
        "INSERT INTO users (first_name, last_name, email, password, role_id) VALUES (%s, %s, %s, %s, %s)",
        (
            first_name,
            last_name,
            email,
            hashed,
            2,  # competitor
        ),
    )
    conn.commit()

    return jsonify({"ok": True}), 201
