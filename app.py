from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
# Serve static files from the templates folder so /assets/css/main.css works
app = Flask(__name__, static_folder='templates', static_url_path='')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app)

@app.route('/')

def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)