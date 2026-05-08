import click
from flask import current_app, g


def get_db():
    if "db" not in g:
        from . import mysql

        g.db = mysql.connection.cursor()
    return g.db


def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    from . import mysql

    conn = mysql.connection
    cursor = conn.cursor()

    with current_app.open_resource("create_tables.ddl") as f:
        sql = f.read().decode("utf8")

    statements = [s.strip() for s in sql.split(";") if s.strip()]
    for statement in statements:
        cursor.execute(statement)

    conn.commit()
    cursor.close()


@click.command("init-db")
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo("Initialized the database.")


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
