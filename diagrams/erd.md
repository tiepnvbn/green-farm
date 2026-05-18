Users
- id
- name
- email
- role (admin/farmer/retailer)

Farmers
- id
- user_id
- farm_name

Retailers
- id
- user_id
- shop_name

Products
- id
- farmer_id
- name
- price

Orders
- id
- retailer_id
- total_price
- status

OrderItems
- id
- order_id
- product_id
- quantity