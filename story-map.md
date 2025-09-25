# Story Map
## Statybinės Technikos Rezervacijos Sistema

---

## Story Map Overview

Story Map padeda vizualizuoti vartotojų kelionę per sistemą ir nustatyti funkcijų prioritetus. Horizontal'iai išdėstyta vartotojo kelionė, vertikal'iai - funkcijų prioritetai.

---

## User Journey Flow (Horizontal Axis)

```
1. DISCOVERY     2. REGISTRATION    3. BROWSING        4. SELECTION       5. RESERVATION
   & LANDING        & LOGIN            & SEARCH           & DECISION          & BOOKING
      ↓                ↓                  ↓                  ↓                  ↓
6. CONFIRMATION  7. TRACKING       8. MANAGEMENT      9. COMPLETION     10. FEEDBACK
   & WAITING        & MONITORING       & CHANGES          & RETURN            & REVIEW
```

---

## Epic Breakdown by User Journey

### 1. DISCOVERY & LANDING
**Epic:** Pirmas Susipažinimas
- Sistema pristato save aiškiai
- Landing page su informacija
- Mobile-friendly navigacija

**User Stories:**
- Responsive design implementation
- Landing page creation
- Basic navigation structure

**Priority:** Must Have
**Sprint:** Sprint 1

---

### 2. REGISTRATION & LOGIN
**Epic:** Vartotojų Valdymas

**Must Have (MVP):**
- US-001: Vartotojo Registracija
- US-002: Vartotojo Prisijungimas
- Basic JWT authentication

**Should Have:**
- US-003: Profilio Valdymas
- Password reset functionality
- Email verification

**Could Have:**
- Social login (Google, Facebook)
- Two-factor authentication

**Priority:** Must Have
**Sprint:** Sprint 1

---

### 3. BROWSING & SEARCH
**Epic:** Įrangos Katalogas

**Must Have (MVP):**
- US-004: Įrangos Sąrašo Peržiūra
- US-006: Įrangos Detalių Peržiūra
- Basic equipment listing

**Should Have:**
- US-005: Įrangos Paieška ir Filtravimas
- Category navigation
- Sorting options

**Could Have:**
- US-020: Paieškos Optimizavimas
- Advanced filtering
- Saved searches
- Favorites/Wishlist

**Priority:** Must Have
**Sprint:** Sprint 2

---

### 4. SELECTION & DECISION
**Epic:** Produkto Analizė

**Must Have (MVP):**
- Equipment details page
- Image gallery
- Pricing information
- Basic availability check

**Should Have:**
- US-017: Prieinamumo Kalendorius
- Specifications display
- Similar equipment suggestions

**Could Have:**
- Equipment comparison
- Reviews and ratings
- Usage history/popularity

**Priority:** Must Have
**Sprint:** Sprint 2

---

### 5. RESERVATION & BOOKING
**Epic:** Rezervacijos Kūrimas

**Must Have (MVP):**
- US-007: Rezervacijos Kūrimas
- Date selection
- Basic conflict prevention
- Cost calculation

**Should Have:**
- Advanced date picker
- Real-time availability check
- Terms and conditions

**Could Have:**
- Multiple equipment booking
- Recurring reservations
- Group bookings

**Priority:** Must Have
**Sprint:** Sprint 3

---

### 6. CONFIRMATION & WAITING
**Epic:** Rezervacijos Patvirtinimas

**Must Have (MVP):**
- Reservation confirmation
- Basic status tracking

**Should Have:**
- US-018: Email Notifikacijos
- Confirmation email
- Status updates

**Could Have:**
- SMS notifications
- Calendar integration
- Reminder notifications

**Priority:** Should Have
**Sprint:** Sprint 3

---

### 7. TRACKING & MONITORING
**Epic:** Rezervacijos Stebėjimas

**Must Have (MVP):**
- US-008: Mano Rezervacijų Peržiūra
- Basic status display

**Should Have:**
- Real-time status updates
- Progress tracking
- History view

**Could Have:**
- Mobile app notifications
- Real-time chat support
- Status change alerts

**Priority:** Must Have
**Sprint:** Sprint 4

---

### 8. MANAGEMENT & CHANGES
**Epic:** Rezervacijos Valdymas

**Must Have (MVP):**
- US-009: Rezervacijos Redagavimas
- US-010: Rezervacijos Atšaukimas
- Basic modification rules

**Should Have:**
- Change history tracking
- Cancellation policies
- Rescheduling options

**Could Have:**
- Partial cancellation
- Transfer to another user
- Upgrade/downgrade equipment

**Priority:** Must Have
**Sprint:** Sprint 4

---

### 9. COMPLETION & RETURN
**Epic:** Nuomos Pabaiga

**Should Have:**
- Return confirmation
- Final cost calculation
- Damage reporting

**Could Have:**
- Digital return inspection
- Automatic billing
- Return reminders

**Priority:** Should Have
**Sprint:** Sprint 5

---

### 10. FEEDBACK & REVIEW
**Epic:** Atsiliepimai

**Could Have:**
- Equipment rating
- Service feedback
- Review system

**Won't Have (V1):**
- Public reviews
- Photo reviews
- Detailed feedback forms

**Priority:** Could Have
**Sprint:** Sprint 6

---

## Admin Journey (Separate Flow)

### A. ADMIN DASHBOARD
**Epic:** Administravimas

**Must Have (MVP):**
- US-014: Visų Rezervacijų Peržiūra
- Basic admin interface

**Should Have:**
- US-019: Administracijos Ataskaitos
- Dashboard with statistics
- Quick actions

**Priority:** Must Have
**Sprint:** Sprint 5

---

### B. EQUIPMENT MANAGEMENT
**Epic:** Įrangos Administravimas

**Must Have (MVP):**
- US-011: Įrangos Sukūrimas
- US-012: Įrangos Redagavimas
- US-013: Įrangos Šalinimas

**Should Have:**
- Bulk operations
- Image management
- Category management

**Priority:** Must Have
**Sprint:** Sprint 2

---

### C. RESERVATION MANAGEMENT
**Epic:** Rezervacijų Administravimas

**Must Have (MVP):**
- US-015: Rezervacijos Patvirtinimas/Atmetimas
- US-016: Rezervacijos Būsenos Valdymas

**Should Have:**
- Bulk status updates
- Advanced filtering
- Export functionality

**Priority:** Must Have
**Sprint:** Sprint 4

---

## Release Planning

### **MVP Release (Minimum Viable Product)**
**Timeline:** 6-8 weeks
**Features:**
- User registration and login
- Equipment listing and details
- Basic reservation system
- Admin equipment management
- Basic admin reservation management
- Conflict prevention
- Responsive design

### **Version 1.0 Release**
**Timeline:** 10-12 weeks
**Additional Features:**
- Advanced search and filtering
- Email notifications
- Comprehensive admin dashboard
- Availability calendar
- Enhanced UI/UX

### **Version 1.1 Release**
**Timeline:** 14-16 weeks
**Additional Features:**
- Advanced reporting
- Performance optimizations
- Enhanced security features
- Mobile app considerations

---

## Priority Matrix

### **Must Have (Critical for MVP)**
1. User authentication system
2. Equipment CRUD (admin)
3. Equipment browsing (users)
4. Basic reservation system
5. Conflict prevention
6. Responsive design
7. Basic admin interface

### **Should Have (Important for V1.0)**
1. Advanced search and filtering
2. Email notifications
3. Availability calendar
4. Comprehensive admin dashboard
5. Reservation management (edit/cancel)
6. Status tracking

### **Could Have (Nice to have)**
1. Advanced analytics
2. Mobile-specific optimizations
3. Social features
4. Integration capabilities
5. Performance enhancements

### **Won't Have (Future versions)**
1. Mobile native app
2. Payment processing
3. Multi-language support
4. Advanced reporting
5. API for third parties

---

## Story Estimation (Story Points)

### Sprint 1 (Authentication & Setup)
- Project setup: 2 pts
- User registration: 3 pts
- User login: 2 pts
- Basic routing: 1 pt
- **Total: 8 pts**

### Sprint 2 (Equipment Management)
- Equipment CRUD (admin): 5 pts
- Equipment listing (user): 3 pts
- Equipment details page: 3 pts
- Image upload: 2 pts
- **Total: 13 pts**

### Sprint 3 (Reservations Core)
- Reservation creation: 5 pts
- Conflict prevention: 3 pts
- Basic email notifications: 2 pts
- **Total: 10 pts**

### Sprint 4 (Reservation Management)
- My reservations page: 3 pts
- Edit reservations: 3 pts
- Cancel reservations: 2 pts
- Admin reservation management: 5 pts
- **Total: 13 pts**

### Sprint 5 (Admin Features)
- Admin dashboard: 3 pts
- Reservation status management: 3 pts
- Basic reporting: 2 pts
- **Total: 8 pts**

### Sprint 6 (Polish & Testing)
- Advanced filtering: 3 pts
- Calendar component: 5 pts
- Testing suite: 3 pts
- Bug fixes: 2 pts
- **Total: 13 pts**

---

## Success Metrics per Epic

### Authentication Success
- 100% users can register successfully
- Login time < 2 seconds
- Session management works correctly

### Equipment Browsing Success  
- Page load time < 3 seconds
- Search results accuracy > 90%
- Mobile usability score > 85%

### Reservation Success
- 0% double bookings
- 95%+ successful reservation submissions
- Conflict detection accuracy 100%

### Admin Efficiency
- Reservation approval time < 5 minutes
- Equipment management task completion < 2 minutes
- Report generation time < 10 seconds

---

**Dokumentą parengė:** Product Team  
**Paskutinis atnaujinimas:** 2025-09-24  
**Versija:** 1.0
