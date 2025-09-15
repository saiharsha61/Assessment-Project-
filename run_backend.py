# run_backend.py
# Script to initialize the database and run the Flask backend

import click
from app import create_app
from models import db

app = create_app()

@app.cli.command("init-db")
def init_db_command():
    """Clear existing data and create new tables."""
    db.drop_all()
    db.create_all()
    click.echo("Initialized the database.")

if __name__ == "__main__":
    # To run the app: `flask run`
    # To initialize the db: `flask init-db`
    app.run(debug=True)
