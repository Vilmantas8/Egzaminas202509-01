# Roadmap - 8 dienų vystymo planas

## Diena 1: Projektų paruošimas ir dokumentacija
**Data: 2025-09**  
**Branch: initial-setup**

### Užduotys:
- ✅ Sukurti projektų katalogą
- ✅ Paruošti README.md
- ✅ Sukurti story-map.md  
- ✅ Sukurti roadmap.md
- 🔄 Inicijuoti Git repozitoriją
- 🔄 Sukurti GitHub repozitoriją "Frontend"
- 🔄 Paruošti .gitignore
- 🔄 Sukurti bazinį React projektą su Tailwind
- 🔄 Supaprastinti dizainą iš esamo maketo

**Commit'ai:**
```
feat: add project documentation (README, story-map, roadmap)
feat: initialize React project with Tailwind CSS
feat: create simplified equipment rental UI design
```

**PR:** "Initial project setup and documentation"

---

## Diena 2: Autentifikacijos sistema
**Data: 2024-12-11**
**Branch: feature/auth**

### Užduotys:
- Sukurti prisijungimo/registracijos formas
- Implementuoti JWT autentifikaciją frontend'e  
- Sukurti protected route'us
- Pradėti backend Express server'ą
- Sukurti User MongoDB schemą
- Implementuoti auth API endpoint'us

**Commit'ai:**
```
feat: add login and registration forms
feat: implement JWT authentication in React
feat: create protected routes with role-based access
feat: setup Express server with MongoDB connection
feat: create User model and auth endpoints
```

**PR:** "Authentication system implementation"

---

## Diena 3: Įrangos valdymo sistema
**Data: 2024-12-12**  
**Branch: feature/equipment-management**

### Užduotys:
- Sukurti Equipment MongoDB schemą
- Implementuoti CRUD API endpoint'us įrangai
- Sukurti įrangos sąrašo komponentą (supaprastintą)
- Implementuoti įrangos detalių peržiūrą
- Pridėti admin įrangos kūrimo/redagavimo formas
- Filtravimo funkcionalumas

**Commit'ai:**
```
feat: create Equipment model and API endpoints
feat: implement equipment list with basic filtering  
feat: add equipment details view component
feat: create admin equipment management forms
fix: equipment validation and error handling
```

**PR:** "Equipment management system"

---

## Diena 4: Rezervacijų sistema - pagrindas
**Data: 2024-12-13**
**Branch: feature/reservations-core**

### Užduotys:
- Sukurti Reservation MongoDB schemą
- Implementuoti rezervacijų API endpoint'us
- Sukurti rezervacijos kūrimo formą
- Datų validacijos logika (ne praeityje, ne dubliuojasi)
- Kalendoriaus komponentą rezervacijoms

**Commit'ai:**
```
feat: create Reservation model with date validation
feat: implement reservation API endpoints
feat: add reservation creation form with calendar
feat: date conflict validation logic
test: add reservation validation unit tests
```

**PR:** "Core reservation system"

---

## Diena 5: Vartotojų rezervacijų valdymas
**Data: 2024-12-14**
**Branch: feature/user-reservations**

### Užduotys:
- Sukurti "Mano rezervacijos" puslapį
- Implementuoti rezervacijos redagavimo funkcionalumą
- Rezervacijos atšaukimo funkcija
- Rezervacijos būsenos atvaizdavimas
- Responsive dizaino patobulinimai

**Commit'ai:**
```
feat: create user reservations dashboard
feat: implement reservation editing functionality
feat: add reservation cancellation feature
feat: improve responsive design for mobile
test: add user reservation component tests
```

**PR:** "User reservation management"

---

## Diena 6: Admin rezervacijų valdymas
**Data: 2024-12-15**
**Branch: feature/admin-reservations**

### Užduotys:
- Sukurti admin rezervacijų dashboard'ą
- Implementuoti rezervacijų būsenų keitimą
- Rezervacijų filtravimas ir paieška
- Statistikos komponentai
- Email pranešimų sistema (basic)

**Commit'ai:**
```
feat: create admin reservations dashboard
feat: implement reservation status management
feat: add reservation filtering and search
feat: create basic statistics components
feat: setup email notification system
```

**PR:** "Admin reservation management system"

---

## Diena 7: Testavimas ir optimizacija
**Data: 2024-12-16**
**Branch: feature/testing-optimization**

### Užduotys:
- Rašyti unit testus React komponentams
- Backend API endpoint'ų testavimas
- Performance optimizacija
- UI/UX gerinimas
- Bug'ų taisymas
- Kodo refaktoravimas

**Commit'ai:**
```
test: add comprehensive React component tests
test: implement backend API endpoint tests
perf: optimize component rendering and API calls
fix: resolve reservation date validation issues
refactor: improve code structure and readability
```

**PR:** "Testing implementation and performance optimization"

---

## Diena 8: Deployment ir finalizavimas
**Data: 2024-12-17**
**Branch: feature/deployment**

### Užduotys:
- Paruošti production build'ą
- Sukonfigūruoti deployment (Render/Vercel)
- Atnaujinti README su live URL
- Paskutiniai UI polish'ai
- Demo duomenų paruošimas
- Pristatymo paruošimas

**Commit'ai:**
```
feat: configure production build and deployment
docs: update README with live deployment URL
feat: add demo data and polish UI details
fix: resolve production environment issues
docs: add deployment instructions
```

**PR:** "Production deployment and final polish"

---

## Git workflow taisyklės

### Branch'ų pavadinimai:
- `initial-setup`
- `feature/auth`
- `feature/equipment-management`
- `feature/reservations-core`
- `feature/user-reservations`
- `feature/admin-reservations`
- `feature/testing-optimization`
- `feature/deployment`

### Commit'ų konvencija:
- `feat:` - nauja funkcionalumas
- `fix:` - bug'ų taisymas
- `docs:` - dokumentacijos pakeitimai
- `test:` - testų pridėjimas
- `refactor:` - kodo refaktoravimas
- `perf:` - performance gerinimas

### PR procesas:
1. Sukurti branch'ą nuo main
2. Atlikti commit'us
3. Push'inti į GitHub
4. Sukurti Pull Request
5. Aprašyti kas padaryta
6. Merge'inti į main
7. Pereiti prie kitos užduoties

## Technologijų sąrašas
- React 18 + TypeScript
- Tailwind CSS (supaprastinta)
- Node.js + Express
- MongoDB + Mongoose
- JWT autentifikacija
- Jest + React Testing Library
- Git + GitHub
