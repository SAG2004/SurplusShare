from app import app, db, User, FoodListing
from datetime import datetime, timedelta, timezone
from sqlalchemy import text

with app.app_context():
    print("🌱 Resetting database...")

    # Optional: wipe all data
    db.session.execute(
        text('TRUNCATE TABLE food_listing, food_request, message, "user" RESTART IDENTITY CASCADE')
    )
    db.session.commit()

    # Sample Users
    donor1 = User(
        username="bakery_corner",
        email="bakery@example.com",
        role="donor",
        organization="Bakery Corner",
        address="Ameerpet, Hyderabad",
        latitude=17.4375,
        longitude=78.4483
    )
    donor1.set_password("password123")

    donor2 = User(
        username="cafe_delight",
        email="cafe@example.com",
        role="donor",
        organization="Cafe Delight",
        address="Banjara Hills, Hyderabad",
        latitude=17.4123,
        longitude=78.4482
    )
    donor2.set_password("password123")

    charity1 = User(
        username="food_help",
        email="charity@example.com",
        role="charity",
        organization="Food Help Foundation",
        address="Mehdipatnam, Hyderabad",
        latitude=17.3961,
        longitude=78.4398
    )
    charity1.set_password("password123")

    recipient1 = User(
        username="john_doe",
        email="john@example.com",
        role="recipient",
        address="Royal Colony, Asif Nagar, Hyderabad",
        latitude=17.3458,
        longitude=78.3916
    )
    recipient1.set_password("password123")

    db.session.add_all([donor1, donor2, charity1, recipient1])
    db.session.commit()
    print("✅ Users created.")

    # Sample Listings
    listing1 = FoodListing(
        title="Fresh Bread",
        description="Assorted fresh breads from today's baking",
        quantity="20 loaves",
        category="Bakery",
        expiry_date=datetime.now(timezone.utc) + timedelta(days=1),
        donor_id=donor1.id,
        pickup_location="Ameerpet, Hyderabad",
        latitude=17.4375,
        longitude=78.4483
    )

    listing2 = FoodListing(
        title="Sandwiches",
        description="Pre-made sandwiches from today's service",
        quantity="15 sandwiches",
        category="Prepared Meals",
        expiry_date=datetime.now(timezone.utc) + timedelta(days=1),
        donor_id=donor2.id,
        pickup_location="Banjara Hills, Hyderabad",
        latitude=17.4123,
        longitude=78.4482
    )

    listing3 = FoodListing(
        title="Vegetables",
        description="Fresh vegetables surplus from delivery",
        quantity="5 boxes",
        category="Produce",
        expiry_date=datetime.now(timezone.utc) + timedelta(days=3),
        donor_id=donor1.id,
        pickup_location="Golconda, Hyderabad",
        latitude=17.3833,
        longitude=78.4011
    )

    db.session.add_all([listing1, listing2, listing3])
    db.session.commit()
    print("✅ Listings created.")

    print("🌟 Database seeded successfully.")
