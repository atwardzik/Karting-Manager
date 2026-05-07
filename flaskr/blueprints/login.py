import functools

from flask import (
    Blueprint,
    render_template,
)

from flaskr.db import get_db

bp = Blueprint("login", __name__)


@bp.route("/views/login")
def view_login():
    return render_template("fragments/login.html")
