from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, CreditCard, MoneyTransaction, AssetAllocation, LendingRecord, LendingTransaction

bp = Blueprint('money', __name__, url_prefix='/api/money')

@bp.route('/summary', methods=['GET'])
@jwt_required()
def get_money_summary():
    """
    Returns high-level money data (cards, assets, lending, and monthly totals)
    without loading all transactions into memory.
    """
    user_id = get_jwt_identity()
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    
    cards = CreditCard.query.filter_by(user_id=user_id).order_by(CreditCard.created_at.desc()).all()
    assets = AssetAllocation.query.filter_by(user_id=user_id).all()
    
    # Initialize defaults if the user has no assets yet to prevent frontend crash
    if not assets:
        default_assets = [
            AssetAllocation(user_id=user_id, type='fixedDeposits', label='Fixed Deposits', amount=0, color='bg-emerald-500'),
            AssetAllocation(user_id=user_id, type='mutualFunds', label='Mutual Funds', amount=0, color='bg-indigo-500'),
            AssetAllocation(user_id=user_id, type='stocks', label='Stocks', amount=0, color='bg-rose-500'),
            AssetAllocation(user_id=user_id, type='lending', label='Lending', amount=0, color='bg-amber-500')
        ]
        db.session.add_all(default_assets)
        db.session.commit()
        assets = default_assets

    total_income = 0
    total_expense = 0
    category_breakdown = []
    
    # Calculate monthly totals and breakdown if month/year are provided
    if month and year:
        month_prefix = f"{year}-{month:02d}"
        monthly_txs = MoneyTransaction.query.filter(
            MoneyTransaction.user_id == user_id,
            MoneyTransaction.date.startswith(month_prefix)
        ).all()
        
        total_income = sum(t.amount for t in monthly_txs if t.type == 'income')
        total_expense = sum(t.amount for t in monthly_txs if t.type == 'expense')
        
        # Calculate category breakdown for expenses
        breakdown_dict = {}
        for t in monthly_txs:
            if t.type == 'expense':
                # Remove payment method suffix for aggregation (e.g. "Food (Cash)" -> "Food")
                import re
                cat = re.sub(r'\s\([^)]+\)$', '', t.category)
                breakdown_dict[cat] = breakdown_dict.get(cat, 0) + t.amount
        
        category_breakdown = [
            {'name': name, 'value': amount} 
            for name, amount in sorted(breakdown_dict.items(), key=lambda x: x[1], reverse=True)
        ]

    return jsonify({
        'totalIncome': total_income,
        'totalExpense': total_expense,
        'categoryBreakdown': category_breakdown,
        'creditCards': [{
            'id': c.id,
            'name': c.name,
            'limit': c.limit,
            'used': c.used,
            'total_spend': c.total_spend,
            'color': c.color,
            'due_date': c.due_date
        } for c in cards],
        'assets': [{
            'id': a.id,
            'type': a.type,
            'label': a.label,
            'amount': a.amount,
            'color': a.color
        } for a in assets],
        'lendingRecords': [{
            'id': r.id,
            'borrower': r.borrower,
            'total_lent': r.total_lent,
            'returned': r.returned,
            'due_date': r.due_date,
            'notes': r.notes,
            'outstanding': round(r.total_lent - r.returned, 2),
            'history': [{
                'id': h.id,
                'amount': h.amount,
                'type': h.type,
                'date': h.date,
                'notes': h.notes
            } for h in r.transactions.order_by(LendingTransaction.date.desc(), LendingTransaction.created_at.desc()).all()]
        } for r in LendingRecord.query.filter_by(user_id=user_id).order_by(LendingRecord.created_at.desc()).all()]
    }), 200

@bp.route('/transactions/paginated', methods=['GET'])
@jwt_required()
def get_paginated_transactions():
    """
    Returns a paginated list of transactions, optionally filtered by month/year.
    """
    user_id = get_jwt_identity()
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    skip = request.args.get('skip', default=0, type=int)
    limit = request.args.get('limit', default=50, type=int)
    
    query = MoneyTransaction.query.filter_by(user_id=user_id)
    
    if month and year:
        month_prefix = f"{year}-{month:02d}"
        query = query.filter(MoneyTransaction.date.startswith(month_prefix))
        
    txs = query.order_by(MoneyTransaction.date.desc(), MoneyTransaction.created_at.desc()).offset(skip).limit(limit).all()
    # Also return total count to let the frontend know if there's more data to load
    total_count = query.count()
    
    return jsonify({
        'total': total_count,
        'transactions': [{
            'id': t.id,
            'type': t.type,
            'category': t.category,
            'amount': t.amount,
            'date': t.date,
            'icon': t.id, 
            'color': 'default', 
            'bg': 'default' 
        } for t in txs]
    }), 200

@bp.route('/data', methods=['GET'])
@jwt_required()
def get_all_money_data():
    """
    [DEPRECATED] Returns all money data in one go. 
    Maintained for backward compatibility with older pages (e.g. TrackReportPage).
    """
    user_id = get_jwt_identity()
    
    cards = CreditCard.query.filter_by(user_id=user_id).order_by(CreditCard.created_at.desc()).all()
    transactions = MoneyTransaction.query.filter_by(user_id=user_id).order_by(MoneyTransaction.date.desc(), MoneyTransaction.created_at.desc()).all()
    assets = AssetAllocation.query.filter_by(user_id=user_id).all()
    lending = LendingRecord.query.filter_by(user_id=user_id).order_by(LendingRecord.created_at.desc()).all()
    
    return jsonify({
        'creditCards': [{
            'id': c.id,
            'name': c.name,
            'limit': c.limit,
            'used': c.used,
            'total_spend': c.total_spend,
            'color': c.color,
            'due_date': c.due_date
        } for c in cards],
        'transactions': [{
            'id': t.id,
            'type': t.type,
            'category': t.category,
            'amount': t.amount,
            'date': t.date
        } for t in transactions],
        'assets': [{
            'id': a.id,
            'type': a.type,
            'label': a.label,
            'amount': a.amount,
            'color': a.color
        } for a in assets],
        'lendingRecords': [{
            'id': r.id,
            'borrower': r.borrower,
            'total_lent': r.total_lent,
            'returned': r.returned,
            'due_date': r.due_date,
            'notes': r.notes,
            'outstanding': round(r.total_lent - r.returned, 2),
            'history': [{
                'id': h.id,
                'amount': h.amount,
                'type': h.type,
                'date': h.date,
                'notes': h.notes
            } for h in r.transactions.order_by(LendingTransaction.date.desc(), LendingTransaction.created_at.desc()).all()]
        } for r in lending]
    }), 200

# ── Lending Records ──
def _lending_dict(r):
    return {
        'id': r.id,
        'borrower': r.borrower,
        'total_lent': r.total_lent,
        'returned': r.returned,
        'due_date': r.due_date,
        'notes': r.notes,
        'outstanding': round(r.total_lent - r.returned, 2),
        'history': [{
            'id': h.id,
            'amount': h.amount,
            'type': h.type,
            'date': h.date,
            'notes': h.notes
        } for h in r.transactions.order_by(LendingTransaction.date.desc(), LendingTransaction.created_at.desc()).all()]
    }

@bp.route('/lending', methods=['POST'])
@jwt_required()
def create_lending():
    user_id = get_jwt_identity()
    data = request.get_json()
    rec = LendingRecord(
        user_id=user_id,
        borrower=data.get('borrower'),
        total_lent=float(data.get('total_lent', 0)),
        returned=float(data.get('returned', 0)),
        due_date=data.get('due_date'),
        notes=data.get('notes')
    )
    db.session.add(rec)
    db.session.flush() # Get id for transaction
    
    # Log initial lending
    logtx = LendingTransaction(
        lending_id=rec.id,
        amount=rec.total_lent,
        type='lend',
        date=data.get('date', datetime.now(timezone.utc).strftime('%Y-%m-%d')),
        notes="Initial lending"
    )
    db.session.add(logtx)
    db.session.commit()
    return jsonify(_lending_dict(rec)), 201

@bp.route('/lending/<rec_id>', methods=['PUT'])
@jwt_required()
def update_lending(rec_id):
    user_id = get_jwt_identity()
    rec = LendingRecord.query.filter_by(id=rec_id, user_id=user_id).first()
    if not rec: return jsonify({'msg': 'Not found'}), 404
    data = request.get_json()
    
    # Track differences for history logging
    old_total = rec.total_lent
    old_returned = rec.returned
    
    if 'borrower' in data: rec.borrower = data['borrower']
    if 'total_lent' in data: rec.total_lent = float(data['total_lent'])
    if 'returned' in data: rec.returned = float(data['returned'])
    if 'due_date' in data: rec.due_date = data['due_date']
    if 'notes' in data: rec.notes = data['notes']
    
    # Log transaction if significant change occurred
    diff_lent = round(rec.total_lent - old_total, 2)
    diff_returned = round(rec.returned - old_returned, 2)
    
    if diff_lent > 0:
        logtx = LendingTransaction(
            lending_id=rec.id,
            amount=diff_lent,
            type='lend',
            date=data.get('date', datetime.now(timezone.utc).strftime('%Y-%m-%d')),
            notes=data.get('notes', "Additional lending")
        )
        db.session.add(logtx)
    
    if diff_returned > 0:
        logtx = LendingTransaction(
            lending_id=rec.id,
            amount=diff_returned,
            type='return',
            date=data.get('date', datetime.now(timezone.utc).strftime('%Y-%m-%d')),
            notes=data.get('notes', "Repayment received")
        )
        db.session.add(logtx)

    db.session.commit()
    return jsonify(_lending_dict(rec)), 200

@bp.route('/lending/<rec_id>/return', methods=['POST'])
@jwt_required()
def record_return(rec_id):
    user_id = get_jwt_identity()
    rec = LendingRecord.query.filter_by(id=rec_id, user_id=user_id).first()
    if not rec: return jsonify({'msg': 'Not found'}), 404
    data = request.get_json()
    amount = float(data.get('amount', 0))
    rec.returned = min(rec.total_lent, rec.returned + amount)
    
    # Log repayment
    logtx = LendingTransaction(
        lending_id=rec.id,
        amount=amount,
        type='return',
        date=data.get('date', datetime.now(timezone.utc).strftime('%Y-%m-%d')),
        notes=data.get('notes', "Repayment received")
    )
    db.session.add(logtx)
    db.session.commit()
    return jsonify(_lending_dict(rec)), 200

@bp.route('/lending/<rec_id>', methods=['DELETE'])
@jwt_required()
def delete_lending(rec_id):
    user_id = get_jwt_identity()
    rec = LendingRecord.query.filter_by(id=rec_id, user_id=user_id).first()
    if not rec: return jsonify({'msg': 'Not found'}), 404
    db.session.delete(rec)
    db.session.commit()
    return jsonify({'msg': 'Deleted'}), 200

# ── Asset Allocation ──
@bp.route('/assets', methods=['PUT'])
@jwt_required()
def update_assets():
    user_id = get_jwt_identity()
    data = request.get_json() # Expecting a list of {"type": "...", "amount": ...}
    
    if not isinstance(data, list):
        return jsonify({"msg": "Expected a list of assets"}), 400
        
    updated_assets = []
    for item in data:
        asset = AssetAllocation.query.filter_by(user_id=user_id, type=item.get('type')).first()
        if asset and 'amount' in item:
            asset.amount = float(item['amount'])
            updated_assets.append(asset)
            
    db.session.commit()
    
    return jsonify([{
        'id': a.id,
        'type': a.type,
        'label': a.label,
        'amount': a.amount,
        'color': a.color
    } for a in updated_assets]), 200

# ── Credit Cards ──
@bp.route('/cards', methods=['POST'])
@jwt_required()
def create_card():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    new_card = CreditCard(
        user_id=user_id,
        name=data.get('name'),
        limit=data.get('limit', 0),
        used=data.get('used', 0),
        total_spend=data.get('total_spend', 0),
        color=data.get('color', 'from-slate-500 to-slate-700'),
        due_date=data.get('due_date')
    )
    
    db.session.add(new_card)
    db.session.commit()
    
    return jsonify({
        'id': new_card.id,
        'name': new_card.name,
        'limit': new_card.limit,
        'used': new_card.used,
        'total_spend': new_card.total_spend,
        'color': new_card.color,
        'due_date': new_card.due_date
    }), 201

@bp.route('/cards/<card_id>', methods=['PUT'])
@jwt_required()
def update_card(card_id):
    user_id = get_jwt_identity()
    card = CreditCard.query.filter_by(id=card_id, user_id=user_id).first()
    
    if not card:
        return jsonify({"msg": "Card not found"}), 404
        
    data = request.get_json()
    if 'name' in data: card.name = data['name']
    if 'limit' in data: card.limit = data['limit']
    if 'used' in data: card.used = data['used']
    if 'total_spend' in data: card.total_spend = data['total_spend']
    if 'due_date' in data: card.due_date = data['due_date']
    
    db.session.commit()
    
    return jsonify({
        'id': card.id,
        'name': card.name,
        'limit': card.limit,
        'used': card.used,
        'total_spend': card.total_spend,
        'color': card.color,
        'due_date': card.due_date
    }), 200

@bp.route('/cards/<card_id>', methods=['DELETE'])
@jwt_required()
def delete_card(card_id):
    user_id = get_jwt_identity()
    card = CreditCard.query.filter_by(id=card_id, user_id=user_id).first()
    
    if not card:
        return jsonify({"msg": "Card not found"}), 404
        
    db.session.delete(card)
    db.session.commit()
    
    return jsonify({"msg": "Card deleted"}), 200

# ── Transactions ──
@bp.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    new_tx = MoneyTransaction(
        user_id=user_id,
        type=data.get('type'),
        category=data.get('category'),
        amount=data.get('amount', 0),
        date=data.get('date')
    )
    
    db.session.add(new_tx)
    db.session.commit()
    
    return jsonify({
        'id': new_tx.id,
        'type': new_tx.type,
        'category': new_tx.category,
        'amount': new_tx.amount,
        'date': new_tx.date
    }), 201

@bp.route('/transactions/<tx_id>', methods=['PUT'])
@jwt_required()
def update_transaction(tx_id):
    user_id = get_jwt_identity()
    tx = MoneyTransaction.query.filter_by(id=tx_id, user_id=user_id).first()
    
    if not tx:
        return jsonify({"msg": "Transaction not found"}), 404
        
    data = request.get_json()
    if 'type' in data: tx.type = data['type']
    if 'category' in data: tx.category = data['category']
    if 'amount' in data: tx.amount = data['amount']
    if 'date' in data: tx.date = data['date']
    
    db.session.commit()
    
    return jsonify({
        'id': tx.id,
        'type': tx.type,
        'category': tx.category,
        'amount': tx.amount,
        'date': tx.date
    }), 200

@bp.route('/transactions/<tx_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(tx_id):
    user_id = get_jwt_identity()
    tx = MoneyTransaction.query.filter_by(id=tx_id, user_id=user_id).first()
    
    if not tx:
        return jsonify({"msg": "Transaction not found"}), 404
        
    db.session.delete(tx)
    db.session.commit()
    
    return jsonify({"msg": "Transaction deleted"}), 200
