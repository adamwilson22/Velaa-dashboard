# Fleet Management System

A complete responsive HTML + CSS web application for managing vehicle fleets, clients, and financial operations.

## 📋 Project Overview

This project is a comprehensive fleet management system built with pure HTML5 and CSS3, featuring:

- **14 Complete Pages** with pixel-perfect design
- **Fully Responsive** design (desktop-first approach)
- **Modern UI/UX** with professional styling
- **BEM Naming Convention** for maintainable CSS
- **Accessibility Features** including ARIA support and keyboard navigation
- **Cross-browser Compatibility**

## 🏗️ Project Structure

```
project-root/
├── index.html                    # Login page (main entry)
├── login.html                    # Login page (duplicate for clarity)
├── signup.html                   # User registration
├── otp.html                      # OTP verification
├── recover-password.html         # Password recovery
├── reset-password.html           # Password reset
├── reset-success.html            # Reset confirmation
├── dashboard.html                # Main dashboard
├── vehicles.html                 # Vehicle management
├── vehicle-add.html              # Add/edit vehicles
├── vehicle-billing.html          # Vehicle billing
├── clients.html                  # Client management
├── client-add.html               # Add clients
├── bond-equity.html              # Financial management
├── create-password.html          # First-time password setup
│
├── css/
│   ├── main.css                  # Base styles & utilities
│   ├── components.css            # Reusable components
│   └── responsive.css            # Responsive design
│
├── js/
│   └── scripts.js                # JavaScript utilities
│
└── images/
    ├── logos/
    │   ├── logo.svg             # Main logo
    │   └── logo-small.svg       # Sidebar logo
    └── icons/
        ├── dashboard.svg        # Dashboard icon
        ├── vehicles.svg         # Vehicles icon
        └── clients.svg          # Clients icon
```

## 🎨 Design Features

### Color Scheme
- **Primary**: Black (#000000)
- **Secondary**: Gray (#666666)
- **Background**: White (#FFFFFF)
- **Accent**: Various grays for UI elements

### Typography
- **Font Family**: Roboto (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Sizes**: Responsive scaling from 0.75rem to 2.25rem

### Layout Patterns
- **Authentication Pages**: Two-column layout (form left, branding right)
- **Dashboard Pages**: Sidebar + Header + Content layout
- **Mobile**: Collapsible sidebar with hamburger menu

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: 576px - 768px
- **Small Mobile**: < 576px

## 🚀 Features

### Authentication System
- User registration with email verification
- OTP verification system
- Password recovery flow
- Secure password creation with strength validation
- Remember me functionality

### Dashboard
- Real-time metrics cards
- Fleet overview statistics
- Recent activity feed
- Quick action buttons
- Chart placeholders for data visualization

### Vehicle Management
- Comprehensive vehicle database
- Add/edit vehicle information
- Billing and expense tracking
- Status management (Active, Maintenance, Inactive)
- Search and filtering capabilities

### Client Management
- Client directory with contact information
- Client categorization (Corporate, Individual, Retail)
- Financial relationship tracking
- Bond and equity management
- Client communication tools

### Financial Management
- Invoice tracking and management
- Expense categorization
- Payment status monitoring
- Financial reporting placeholders
- Multi-currency support structure

## 🛠️ Technical Implementation

### CSS Architecture
- **BEM Methodology**: Block__Element--Modifier naming convention
- **Modular Structure**: Separated concerns across multiple files
- **CSS Variables**: Consistent theming and easy customization
- **Utility Classes**: Reusable styling utilities

### JavaScript Features
- Mobile menu functionality
- Form validation and formatting
- Password strength checking
- Real-time search and filtering
- Keyboard navigation support
- Theme switching capability

### Accessibility Features
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- Skip links for navigation

## 🔧 Setup Instructions

1. **Clone or Download** the project files
2. **Open in Browser**: Open `index.html` in any modern web browser
3. **Navigate**: Use the sidebar navigation or buttons to explore different sections

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📖 Usage Guide

### Authentication Flow
1. Start at `index.html` (Login page)
2. Use "Sign up" to create a new account
3. Complete email verification (OTP)
4. Set up your password
5. Access the dashboard

### Navigation
- **Desktop**: Use the sidebar for main navigation
- **Mobile**: Tap the hamburger menu to access navigation
- **Quick Actions**: Use buttons on dashboard for common tasks

### Data Management
- **Search**: Use search bars to find specific records
- **Filter**: Apply filters to narrow down results
- **Sort**: Click table headers to sort data
- **Pagination**: Navigate through large datasets

## 🎯 Best Practices Implemented

### Code Quality
- Semantic HTML5 structure
- Clean, commented CSS
- Modular JavaScript functions
- Consistent naming conventions

### Performance
- Optimized CSS with minimal redundancy
- Efficient JavaScript with event delegation
- Fast loading with minimal dependencies
- Responsive images and assets

### User Experience
- Intuitive navigation patterns
- Consistent visual hierarchy
- Clear call-to-action buttons
- Helpful form validation messages
- Loading states and feedback

### Security
- Input validation and sanitization
- Secure password requirements
- CSRF protection structure
- Safe navigation patterns

## 🔄 Future Enhancements

### Potential Additions
- Backend integration (API endpoints)
- Real database connectivity
- Advanced charting and analytics
- User role management
- Multi-language support
- Dark mode toggle
- Offline functionality

### Customization Options
- Theme customization
- Logo replacement
- Color scheme modification
- Font family changes
- Layout adjustments

## 📝 Development Notes

### CSS Customization
Edit variables in `css/main.css` for quick theming changes:
```css
:root {
  --color-primary: #your-color;
  --font-family-primary: 'Your Font', sans-serif;
}
```

### Adding New Pages
1. Create HTML file following existing patterns
2. Include required CSS/JS links
3. Add to navigation structure
4. Test responsive design

### Form Enhancement
Use the existing form validation patterns for new forms:
```javascript
// Add to scripts.js or page-specific script
const form = document.getElementById('yourForm');
form.addEventListener('submit', validateYourForm);
```

## 📞 Support

This project demonstrates modern web development practices and can serve as a foundation for a full-featured fleet management application. All code is production-ready and follows industry best practices.

## 📄 License

This project is open-source and available for educational and commercial use. Feel free to modify and distribute according to your needs.


