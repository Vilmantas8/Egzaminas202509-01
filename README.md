# Statybinės Technikos Rezervacijos Sistema

## Aprašymas

MERN technologijų pagrindu sukurta statybinės technikos nuomos ir administravimo sistema. Sistema leidžia administratoriams registruoti ir valdyti įrangą, peržiūrėti ir tvirtinti rezervacijas, o vartotojams – naršyti įrangą, kurti, atnaujinti ir atšaukti rezervacijas.

## Technologijos

- **Frontend**: React.js, React Router, Axios, CSS Modules
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MongoDB Atlas
- **Additional**: bcrypt, Joi/Zod validation, CORS

## Sistemos Funkcionalumas

### Vartotojų Rolės

**Administratorius:**
- Kuria, atnaujina ir keičia įrangos būseną (paskelbta/juodraštis)
- Peržiūri visas rezervacijas ir jų detales
- Tvirtina arba atmeta rezervacijas
- Keičia rezervacijų būsenas (patvirtinta, atmesta, vykdoma, baigta)

**Paprastas Vartotojas:**
- Peržiūri įrangos sąrašą ir detales
- Kuria naujas rezervacijas
- Atnaujina savo rezervacijas
- Atšaukia rezervacijas

### Pagrindinės Funkcijos

- **Autentifikacija**: JWT tokenų sistema su refresh tokenais
- **Įrangos Katalogas**: Paieška, filtravimas pagal kategorijas, kainą, būklę
- **Rezervacijos**: Konfliktų prevencija, automatinis validavimas
- **Pranešimai**: El. pašto arba UI notifikacijos
- **Administravimo Skydelis**: Įrangos CRUD operacijos, ataskaitos
- **Responsyvus Dizainas**: Mobile-first principas

## Projekto Struktūra

```
statybines technikos rezervacijos sistema/
├── frontend/                 # React aplikacija
├── backend/                  # Express.js serveris
├── docs/                     # Projekto dokumentacija
├── README.md                 # Šis failas
└── .gitignore               # Git ignoruojami failai
```

## Reikalavimai

- Node.js 18+
- MongoDB Atlas paskyra
- Git versijų kontrolės sistema

## Diegimas ir Paleidimas

### 1. Klonuoti Repository

```bash
git clone [repository-url]
cd "statybines technikos rezervacijos sistema"
```

### 2. Backend Konfigūracija

```bash
cd backend
npm install
```

Sukurkite `.env` failą backend aplanke:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
PORT=5000
NODE_ENV=development
```

### 3. Frontend Konfigūracija

```bash
cd ../frontend
npm install
```

### 4. Paleisti Projektą

**Backend paleidimas:**
```bash
cd backend
npm run dev
```
Serveris veiks: `http://localhost:5000`

**Frontend paleidimas (naujame terminale):**
```bash
cd frontend
npm start
```
React aplikacija veiks: `http://localhost:3000`

## API Endpoints

### Autentifikacija
- `POST /api/auth/register` - Registracija
- `POST /api/auth/login` - Prisijungimas
- `POST /api/auth/refresh` - Token atnaujinimas
- `POST /api/auth/logout` - Atsijungimas

### Įranga
- `GET /api/equipment` - Įrangos sąrašas
- `GET /api/equipment/:id` - Įrangos detalės
- `POST /api/equipment` - Sukurti įrangą (admin)
- `PUT /api/equipment/:id` - Atnaujinti įrangą (admin)
- `DELETE /api/equipment/:id` - Ištrinti įrangą (admin)

### Rezervacijos
- `GET /api/reservations` - Visos rezervacijos (admin) / Mano rezervacijos (user)
- `GET /api/reservations/:id` - Rezervacijos detalės
- `POST /api/reservations` - Sukurti rezervaciją
- `PUT /api/reservations/:id` - Atnaujinti rezervaciją
- `DELETE /api/reservations/:id` - Atšaukti rezervaciją

## Testavimas

### Unit testų paleidimas:

**Frontend testai:**
```bash
cd frontend
npm test
```

**Backend testai:**
```bash
cd backend
npm test
```

## Deployment

1. **Backend**: Deploy to Render, Heroku arba AWS
2. **Frontend**: Build ir deploy to Vercel, Netlify
3. **Database**: MongoDB Atlas (cloud)

### Build komandos:

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Git Workflow

1. Kiekviena funkcija vysytoma atskirame branch:
   - `feature/auth`
   - `feature/equipment-crud`
   - `feature/reservations`

2. Commit pavyzdžiai:
   - `git commit -m "feat: add login functionality"`
   - `git commit -m "fix: reservation date validation"`

3. Pull Request processo laikymasis

## Saugumas

- Slaptažodžių hash'inimas su bcrypt
- JWT tokenų saugus valdymas
- Rate limiting API endpoints
- CORS konfigūracija
- Input validacija su Joi/Zod

## Veikimo Reikalavimai

- **KPI**: ≥95% sėkmingų rezervacijų be konfliktų
- **Performance**: Puslapio TTI < 3s 4G tinkle
- **BE Response**: <200ms mediana ≤50k įrašų

## Licencija

Šis projektas skirtas mokomųjų tikslų.

## Kontaktai

[Jūsų kontaktinė informacija]

---

**Paskutinis atnaujinimas:** 2025-09-24
