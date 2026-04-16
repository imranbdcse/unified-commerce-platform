# Frontend Test Checklist

## POS Frontend (Port 3000)

### Authentication
- [ ] Login with admin credentials
- [ ] JWT token stored in localStorage
- [ ] Protected routes redirect to login

### POS Module
- [ ] Product grid loads with images
- [ ] Barcode search works
- [ ] Add to cart updates badge
- [ ] Cart shows correct totals
- [ ] Payment modal opens with all methods (Cash/Card/bKash/Nagad)
- [ ] Split payment works
- [ ] Change calculation correct
- [ ] Receipt prints with store info and seller code
- [ ] Offline mode: products load from IndexedDB
- [ ] Offline order saved locally
- [ ] Sync on reconnect works

### Seller Module
- [ ] Seller login modal opens
- [ ] Seller code + PIN verified
- [ ] Seller name shown in status bar
- [ ] Commission tracked per sale

### Dashboard
- [ ] All KPIs displayed
- [ ] Zone map shows 8 zones
- [ ] Charts render correctly
- [ ] Real-time updates via Socket.io

### Zone Dashboard
- [ ] 8 zones listed
- [ ] Tabs: Sales / Stock / Online Orders
- [ ] Zone detail page loads

## eCommerce Frontend (Port 3001)

### Authentication
- [ ] Mobile number input
- [ ] OTP sent and verified
- [ ] Customer profile saved

### Product Pages
- [ ] Home page loads with banner
- [ ] Featured products (50) shown
- [ ] Trending section works
- [ ] Personalized recommendations shown

### Product List
- [ ] Filters work (category, price, brand)
- [ ] Sort options work
- [ ] Per-page dropdown: 20/50/100/200
- [ ] Pagination works

### Product Detail
- [ ] Images gallery works
- [ ] Add to cart works
- [ ] Buy Now works
- [ ] Also Bought section shows
- [ ] Similar Products shown
- [ ] Personalized "For You" section

### Cart & Checkout
- [ ] Cart drawer opens
- [ ] Quantity update works
- [ ] Remove item works
- [ ] Address form validates
- [ ] Payment method selected
- [ ] Order placed successfully
- [ ] Order success page shown

### Order History
- [ ] Orders listed
- [ ] Order tracking shown
- [ ] Delivery status updates
