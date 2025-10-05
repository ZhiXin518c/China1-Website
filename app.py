from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import traceback
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Simple in-memory storage for testing
orders = []
order_counter = 1

@app.route('/api/orders', methods=['POST'])
def create_order():
    global order_counter
    
    try:
        # Get raw data for debugging
        raw_data = request.get_data(as_text=True)
        print(f"=== RAW REQUEST DATA ===")
        print(f"Content-Type: {request.content_type}")
        print(f"Raw data: {raw_data}")
        print(f"Raw data type: {type(raw_data)}")
        
        # Parse JSON
        try:
            data = json.loads(raw_data) if raw_data else {}
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            return jsonify({'error': f'Invalid JSON: {str(e)}'}), 400
        
        print(f"=== PARSED DATA ===")
        print(f"Data type: {type(data)}")
        print(f"Data keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
        print(f"Full data: {json.dumps(data, indent=2)}")
        
        # Validate basic structure
        if not isinstance(data, dict):
            return jsonify({'error': f'Expected JSON object, got {type(data).__name__}'}), 400
        
        # Extract and validate required fields with defaults
        customer_name = data.get('customer_name', '')
        customer_phone = data.get('customer_phone', '')
        email = data.get('email', '')
        
        if not customer_name or not customer_phone:
            return jsonify({'error': 'Missing required customer information'}), 400
        
        # Extract order details with defaults
        order_type = data.get('order_type', 'pickup')
        payment_method = data.get('payment_method', 'cash')
        special_instructions = data.get('special_instructions', '')
        
        # Extract financial data with defaults
        subtotal = float(data.get('subtotal', 0))
        tax = float(data.get('tax', 0))
        delivery_fee = float(data.get('delivery_fee', 0))
        total = float(data.get('total', 0))
        
        # Extract and validate items
        items_data = data.get('items', [])
        print(f"=== ITEMS PROCESSING ===")
        print(f"Items type: {type(items_data)}")
        print(f"Items length: {len(items_data) if hasattr(items_data, '__len__') else 'No length'}")
        
        if not isinstance(items_data, list):
            return jsonify({'error': f'Items must be an array, got {type(items_data).__name__}'}), 400
        
        if not items_data:
            return jsonify({'error': 'Order must contain at least one item'}), 400
        
        # Process items
        processed_items = []
        for i, item in enumerate(items_data):
            print(f"Processing item {i}: {type(item)} - {item}")
            
            if not isinstance(item, dict):
                return jsonify({'error': f'Item {i} must be an object, got {type(item).__name__}'}), 400
            
            # Extract item data with safe defaults
            processed_item = {
                'menu_item_id': str(item.get('menu_item_id', item.get('menuItemId', f'item_{i}'))),
                'name': str(item.get('name', 'Unknown Item')),
                'quantity': int(item.get('quantity', 1)),
                'base_price': float(item.get('base_price', item.get('basePrice', 0))),
                'final_price': float(item.get('final_price', item.get('finalPrice', item.get('base_price', item.get('basePrice', 0))))),
                'customizations': item.get('customizations', {}),
                'special_instructions': str(item.get('special_instructions', item.get('specialInstructions', '')))
            }
            
            processed_items.append(processed_item)
            print(f"Processed item {i}: {processed_item}")
        
        # Create order object
        order = {
            'id': order_counter,
            'customer_name': customer_name,
            'customer_phone': customer_phone,
            'email': email,
            'order_type': order_type,
            'payment_method': payment_method,
            'special_instructions': special_instructions,
            'subtotal': subtotal,
            'tax': tax,
            'delivery_fee': delivery_fee,
            'total': total,
            'items': processed_items,
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'estimated_ready_time': datetime.utcnow().isoformat()
        }
        
        # Store order
        orders.append(order)
        order_counter += 1
        
        print(f"=== ORDER CREATED ===")
        print(f"Order ID: {order['id']}")
        print(f"Total items: {len(processed_items)}")
        
        return jsonify({
            'success': True,
            'order': order,
            'message': 'Order placed successfully!'
        }), 201
        
    except Exception as e:
        print(f"=== ERROR ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        
        return jsonify({
            'error': f'Server error: {str(e)}',
            'type': type(e).__name__
        }), 500

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    try:
        order = next((o for o in orders if o['id'] == order_id), None)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        return jsonify({
            'success': True,
            'order': order
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['GET'])
def get_orders():
    try:
        return jsonify({
            'success': True,
            'orders': orders,
            'total': len(orders)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'orders_count': len(orders)
    })

if __name__ == '__main__':
    print("Starting China 1 Backend (Fixed Version)")
    print("CORS enabled for all origins")
    app.run(host='0.0.0.0', port=5000, debug=True)
