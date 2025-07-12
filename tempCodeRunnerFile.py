@app.route('/map')
def map_view():
    if 'user_id' not in session:
        flash('Please login to view the map', 'warning')
        return redirect(url_for('login'))

    user = User.query.get(session['user_id'])

    if user.role == 'donor':
        recipients = User.query.filter(User.role.in_(['recipient', 'charity'])).all()
        listings = []
    else:
        recipients = []
        listings = FoodListing.query.filter_by(status='available').all()

    # Convert to dicts for JSON serialization in template
    user_dict = user.to_dict()
    recipient_dicts = [r.to_dict() for r in recipients]
    listing_dicts = [l.to_dict() for l in listings]

    return render_template(
        'map.html',
        user=user_dict,
        recipients=recipient_dicts,
        listings=listing_dicts
    )
