import os
from flask import Flask, render_template, url_for, request, redirect, send_from_directory, abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from datetime import datetime
from sqlalchemy import text

# Serve static files from the templates/assets folder and load templates from templates/
app = Flask(
    __name__,
    template_folder='templates',
    static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates', 'assets'),
    static_url_path='/assets'
)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
TEMPLATES_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CLASS_OPTIONS = [
    'Class 10', 'Class 11', 'Class 12'
]
CLASS_DIR_MAP = {
    'Class 10': '10th',
    'Class 11': '11th',
    'Class 12': '12th'
}
SUBJECT_OPTIONS = [
    'Maths', 'Science', 'English', 'Hindi',
    'Me', 'PYQs', 'SCQPs', 'SST',
    'Physics', 'Chemistry', 'Biology',
    'Accountancy', 'Economics', 'Business Studies',
    'Computer Science', 'History', 'Political Science',
    'Artificial Intelligence', 'Banking', 'Commerce',
    'Data Science', 'Entrepreneurship', 'Humanities',
    'Legal Studies', 'Micro Economics', 'Multimedia',
    'PCB', 'PCM', 'Physical Activity Trainer',
    'Psychology', 'Statistical Economics'
]
CLASS_SLUGS = {cls.lower().replace(' ', '-'): cls for cls in CLASS_OPTIONS}
SUBJECT_SLUGS = {sub.lower().replace(' ', '-'): sub for sub in SUBJECT_OPTIONS}
CLASS_DIR_TO_NAME = {v: k for k, v in CLASS_DIR_MAP.items()}

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)

class Notice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    filename = db.Column(db.String(300), nullable=False)
    class_name = db.Column(db.String(100), nullable=False, default='')
    subject_name = db.Column(db.String(100), nullable=False, default='')
    filepath = db.Column(db.String(500), nullable=False, default='')
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<Notice %r>' % self.id

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Integer, default=0)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<Task %r>' % self.id


def ensure_notice_columns():
    inspector = db.inspect(db.engine)
    if 'notice' not in inspector.get_table_names():
        return

    existing_columns = [col['name'] for col in inspector.get_columns('notice')]
    if 'class_name' not in existing_columns:
        db.session.execute(text('ALTER TABLE notice ADD COLUMN class_name VARCHAR(100) DEFAULT ""'))
    if 'subject_name' not in existing_columns:
        db.session.execute(text('ALTER TABLE notice ADD COLUMN subject_name VARCHAR(100) DEFAULT ""'))
    if 'filepath' not in existing_columns:
        db.session.execute(text('ALTER TABLE notice ADD COLUMN filepath VARCHAR(500) DEFAULT ""'))
    db.session.commit()

with app.app_context():
    db.create_all()
    ensure_notice_columns()


def get_save_directories(class_name, subject_name):
    class_dir = CLASS_DIR_MAP.get(class_name)
    if class_dir and subject_name:
        return os.path.join(TEMPLATES_FOLDER, class_dir, 'PDFs', secure_filename(subject_name)), os.path.join(class_dir, 'PDFs', secure_filename(subject_name))
    return os.path.join(UPLOAD_FOLDER, secure_filename(class_name), secure_filename(subject_name)), os.path.join('uploads', secure_filename(class_name), secure_filename(subject_name))


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        file = request.files.get('fileUpload')
        notice_title = request.form.get('noticeTitle', '').strip()
        class_name = request.form.get('className', '').strip()
        subject_name = request.form.get('subjectName', '').strip()

        if not notice_title:
            return 'Notebook title is required', 400
        if not class_name:
            return 'Class selection is required', 400
        if not subject_name:
            return 'Subject selection is required', 400
        if not file or file.filename == '':
            return 'No file uploaded', 400
        if not allowed_file(file.filename):
            return 'File type not allowed', 400

        filename = secure_filename(file.filename)
        target_dir, relative_dir = get_save_directories(class_name, subject_name)
        os.makedirs(target_dir, exist_ok=True)

        filepath = os.path.join(relative_dir, filename)
        save_path = os.path.join(target_dir, filename)
        if os.path.exists(save_path):
            base, ext = os.path.splitext(filename)
            timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
            filename = f'{base}_{timestamp}{ext}'
            filepath = os.path.join(relative_dir, filename)
            save_path = os.path.join(target_dir, filename)

        file.save(save_path)

        notice = Notice(
            title=notice_title,
            filename=filename,
            class_name=class_name,
            subject_name=subject_name,
            filepath=filepath,
        )
        try:
            db.session.add(notice)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return f'Error occurred while saving the notebook: {e}', 500

        return redirect(url_for('index', className=class_name, subjectName=subject_name))

    class_filter = request.args.get('className', '')
    subject_filter = request.args.get('subjectName', '')
    query = Notice.query.order_by(Notice.date_created.desc())
    if class_filter:
        query = query.filter_by(class_name=class_filter)
    if subject_filter:
        query = query.filter_by(subject_name=subject_filter)

    notices = query.all()
    return render_template(
        'index.html',
        notices=notices,
        class_filter=class_filter,
        subject_filter=subject_filter,
        class_options=CLASS_OPTIONS,
        subject_options=SUBJECT_OPTIONS,
    )


@app.route('/recruitment', methods=['POST'])
def recruitment():
    return redirect(url_for('index'))


@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    template_path = os.path.join(TEMPLATES_FOLDER, filename)
    if os.path.exists(template_path):
        return send_from_directory(TEMPLATES_FOLDER, filename)

    upload_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(upload_path):
        return send_from_directory(UPLOAD_FOLDER, filename)

    return abort(404)


@app.route('/<path:page>')
def render_page(page):
    if not page.endswith('.html'):
        return abort(404)

    template_file = page
    template_path = os.path.join(app.template_folder, template_file)
    if not os.path.exists(template_path):
        return abort(404)

    uploads = []
    parts = page.split('/')
    if len(parts) == 2 and parts[0] in CLASS_DIR_TO_NAME:
        class_name = CLASS_DIR_TO_NAME[parts[0]]
        subject_name = os.path.splitext(parts[1])[0]
        uploads = Notice.query.filter_by(
            class_name=class_name,
            subject_name=subject_name
        ).order_by(Notice.date_created.desc()).all()

    return render_template(template_file, uploads=uploads)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        ensure_notice_columns()
    app.run(debug=True)