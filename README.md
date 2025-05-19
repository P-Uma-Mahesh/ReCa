# ReCa – Cart for Reusables

Welcome to **ReCa** (Cart for Reusables)!  
ReCa is a web platform designed to foster sustainability and community among college students by providing a marketplace for buying and selling used products. Through ReCa, students can declutter, save money, and contribute to a greener campus by reusing goods rather than discarding them.

---

## 🌱 What is ReCa?

At ReCa, our mission is to reduce waste and promote the reuse of everyday items, making it easy for students to list products they no longer need and discover affordable, pre-loved items from their peers.  
Whether you want to sell your old books, gadgets,or are looking for a great deal, ReCa is your go-to sustainable marketplace.

---

## ✨ Features

- **User Authentication**: Sign up and log in securely to manage your listings and cart.
- **Product Listings**: Browse, filter, and search for available products by category and branch.
- **Sell Used Items**: List your reusable products with descriptions, categories, and images.
- **Shopping Cart**: Add items to your cart and manage your intended purchases.
- **Order Management**: Seamlessly purchase items and track your orders.
- **Secure Payments**: Integrated payment gateway (Razorpay) for safe transactions.
- **User Profile**: View your purchases, sales, and order history.
- **Admin Panel**: For administrators to manage users, orders, and listings.
- **Responsive UI**: Mobile-friendly design using Bootstrap and custom CSS.
- **Team and About Us**: Learn more about the team and the mission behind ReCa.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (with Mongoose)
- **Frontend**: EJS templating, Bootstrap 5, CSS, JavaScript
- **Authentication**: JWT, Cookies
- **Payments**: Razorpay Integration
- **File Uploads**: Cloudinary and Multer (for product images)
- **Other Libraries**: Various npm packages for security, validation, and middleware

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm
- MongoDB (local or Atlas)
- Razorpay account (for payment integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/P-Uma-Mahesh/reca.git
   cd reca
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Create a `.env` file in the root directory.
   - Add the following:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     RAZORPAY_KEY_ID=your_razorpay_key
     RAZORPAY_KEY_SECRET=your_razorpay_secret
     ```

4. **Start the application**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000` (or the port specified).

---

## 🖥️ Deployment

**Demo Link:**  
[Live Demo](https://reca-21ve.onrender.com/reca)
---

## 📚 Usage

- **Browse Products**: Go to the products page and explore by category or branch.
- **Sign Up/Sign In**: Create an account or log in.
- **Add Products**: Use the "Sell" feature to list your own reusable items.
- **Manage Cart**: Add, view, or remove items from your cart.
- **Checkout**: Use Razorpay for secure payment and order placement.
- **Profile**: Track your purchases and sales in your user profile.

---

## 📦 Project Structure

```
reca/
├── app.js                  # Main application server
├── models/                 # Mongoose models (User, Product, Order, etc.)
├── public/                 # Static assets (CSS, JS)
├── routes/                 # Express routes
├── views/                  # EJS templates (pages, layouts)
├── .env.example            # Example environment config
└── README.md               # This file
```

---

## 👨‍💻 Team

- **G. Abhishek**        - abhishekgajula2018@gmail.com
- **S. Siddharth**       - siddharth.s2404@gmail.com
- **B. Sainadha Reddy**  - sainadhareddybusireddy2004@gmail.com
- **T.P.S. Uma Mahesh**  - tpoornamahesh@gmail.com
---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to fork the repo, open issues, or submit pull requests.

---

## 🙏 Acknowledgements

- Razorpay for payment gateway APIs
- Bootstrap for UI components
- MongoDB & Mongoose for database management

---

## 💡 Inspiration

Together, let's create a more sustainable future—one reusable item at a time!

