# CRM Dashboard - Full Stack Application

A complete Customer Relationship Management (CRM) system with a modern web interface.

## 🚀 Features

### Backend (Node.js + Express + PostgreSQL)
- **Authentication**: User registration and login with JWT
- **Customer Management**: Full CRUD operations
- **Lead Management**: Track leads through sales pipeline
- **Contact Management**: Multiple contact methods per customer
- **Stage Management**: Lead pipeline stages
- **Communication Hub**: Email, SMS, and call functionality
- **Data Validation**: Comprehensive input validation
- **Security**: Password hashing, JWT authentication

### Frontend (HTML + CSS + JavaScript)
- **Modern UI**: Responsive design with gradient backgrounds
- **Dashboard**: Tabbed interface for different modules
- **Forms**: Modal-based forms for data entry
- **Tables**: Interactive data tables with edit/delete actions
- **Real-time Updates**: Instant data refresh after operations
- **Mobile Responsive**: Works on all device sizes

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Modern web browser

## 🛠️ Installation & Setup

### 1. Clone/Download the project
```bash
git clone <your-repo-url>
cd CRM-Dashboard-1
```

### 2. Install Dependencies
```bash
npm run install-backend
```

### 3. Environment Setup
Create `.env` file in backend directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
PORT=5000

# Optional: Communication settings
EMAIL_MODE=mock
SMS_MODE=mock
CALL_MODE=mock
```

### 4. Initialize Database
```bash
cd backend
node initDatabase.js
node seedData.js
```

### 5. Start the Server
```bash
npm start
```

## 🌐 Access the Application

Open your browser and go to: **http://localhost:5000**

## 👤 Test Credentials

- **Email**: shivani@example.com
- **Password**: Shivani@123

## 📱 How to Use

### 1. **Login/Register**
- Use test credentials or register a new account
- JWT token is stored for session management

### 2. **Customer Management**
- Add customers with name, email, phone, company, address
- Edit existing customer information
- Delete customers (cascades to related data)

### 3. **Lead Management**
- Create leads linked to customers
- Set lead source, status, value, and description
- Track lead progression through pipeline

### 4. **Contact Management**
- Add multiple contact methods per customer
- Support for email, phone, address, social contacts
- Set primary contact for each type

### 5. **Stage Management**
- Create pipeline stages for leads
- Track lead progression through sales process
- Link stages to specific leads

### 6. **Communication Hub**
- Send emails to customers
- Send SMS messages
- Make calls (mock mode by default)
- View communication history

## 🎨 UI Features

### Design Elements
- **Gradient Backgrounds**: Modern purple-blue gradients
- **Card-based Layout**: Clean, organized interface
- **Icon Integration**: Font Awesome icons throughout
- **Responsive Tables**: Mobile-friendly data display
- **Modal Forms**: Overlay forms for data entry
- **Status Badges**: Visual status indicators
- **Hover Effects**: Interactive button animations

### Color Scheme
- **Primary**: Purple-blue gradient (#667eea to #764ba2)
- **Success**: Green (#28a745)
- **Danger**: Red (#dc3545)
- **Background**: Light gray (#f8f9fa)
- **Text**: Dark gray (#333)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Contacts
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/:id` - Get contact by ID
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Stages
- `GET /api/stages` - Get all stages
- `GET /api/stages/:id` - Get stage by ID
- `POST /api/stages` - Create stage
- `PUT /api/stages/:id` - Update stage
- `DELETE /api/stages/:id` - Delete stage

### Communication
- `POST /api/communication/email` - Send email
- `POST /api/communication/sms` - Send SMS
- `POST /api/communication/call` - Make call
- `GET /api/communication/history` - Get communication history

## 🔧 Technical Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **PostgreSQL**: Database
- **JWT**: Authentication
- **bcrypt**: Password hashing
- **CORS**: Cross-origin requests
- **Nodemailer**: Email functionality
- **Twilio**: SMS and call functionality

### Frontend
- **HTML5**: Structure
- **CSS3**: Styling with Flexbox/Grid
- **Vanilla JavaScript**: Functionality
- **Font Awesome**: Icons
- **Fetch API**: HTTP requests

## 📁 Project Structure

```
CRM-Dashboard-1/
├── backend/
│   ├── controllers/     # Business logic
│   ├── routes/         # API routes
│   ├── models/         # Database connection
│   ├── middleware/     # Authentication middleware
│   ├── utils/          # Validation utilities
│   ├── database/       # SQL schema
│   ├── package.json    # Backend dependencies
│   ├── server.js       # Main server file
│   ├── initDatabase.js # Database setup
│   └── seedData.js     # Sample data
├── frontend/
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   └── index.html     # Main HTML file
├── package.json       # Root package.json
└── README.md
```

## 🚀 Deployment

### Render Deployment
1. Connect your GitHub repository to Render
2. Set build command: `npm run install-backend`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy!

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Railway will auto-detect the Node.js app
3. Add environment variables
4. Deploy automatically

### Environment Variables for Production
```env
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=your_production_db_name
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_secure_jwt_secret
PORT=5000
NODE_ENV=production
```

## 🎯 Next Steps

You can extend this CRM with:
- Real email integration (SMTP)
- Real SMS integration (Twilio)
- Advanced analytics and reporting
- File upload functionality
- Calendar integration
- Notification system
- Advanced user roles and permissions

---

**Your CRM Dashboard is now ready to deploy! 🎉**