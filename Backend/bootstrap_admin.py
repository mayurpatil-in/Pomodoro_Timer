import sys
import os
from app import create_app, db
from app.models import User

app = create_app()

def bootstrap_superadmin(email, password):
    with app.app_context():
        # Check if user already exists
        user = User.query.filter_by(email=email).first()
        if user:
            print(f"User {email} already exists! Updating role to superadmin...")
            user.role = 'superadmin'
            user.subscription_plan = 'pro'
            user.set_password(password)
        else:
            print(f"Creating superadmin {email}...")
            user = User(email=email, role='superadmin', subscription_plan='pro')
            user.set_password(password)
            db.session.add(user)
        
        db.session.commit()
        print("Success! You can now log in.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python bootstrap_admin.py <email> <password>")
        sys.exit(1)
        
    email = sys.argv[1]
    password = sys.argv[2]
    bootstrap_superadmin(email, password)
