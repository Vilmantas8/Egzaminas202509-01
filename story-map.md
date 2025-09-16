# Story Map - Statybinės technikos nuomos sistema Egzaminas 202509-01

## User Stories

### Visi vartotojai

**US-01: Įrangos sąrašo peržiūra**
- Kaip vartotojas, noriu matyti visą turimą įrangą, kad galėčiau pasirinkti man tinkamą
- Priėmimo kriterijai:
  - Matomas įrangos sąrašas su pagrindine informacija
  - Filtravimo galimybės pagal tipą, kainą, lokaciją
  - Responsive dizainas

**US-02: Įrangos detalių peržiūra**  
- Kaip vartotojas, noriu matyti detaliją įrangos informaciją, kad galėčiau priimti sprendimą
- Priėmimo kriterijai:
  - Nuotraukos, specifikacijos, kaina
  - Rezervacijos kalendorius  
  - Kontaktinė informacija

### Administratoriaus funkcijos

**US-03: Įrangos kūrimas**
- Kaip administratorius, noriu sukurti naują įrangos įrašą, kad galėčiau ją pateikti nuomai
- Priėmimo kriterijai:
  - Forma su visais reikiamais laukais
  - Nuotraukų įkėlimas
  - Validacija

**US-04: Įrangos redagavimas**
- Kaip administratorius, noriu redaguoti įrangos informaciją, kad palaikyčiau aktualius duomenis
- Priėmimo kriterijai:
  - Visų laukų redagavimo galimybė
  - Būsenos keitimas (paskelbta/juodraštis)
  - Pakeitimų saugojimas

**US-05: Rezervacijų valdymas**
- Kaip administratorius, noriu matyti ir valdyti visas rezervacijas
- Priėmimo kriterijai:
  - Rezervacijų sąrašas su filtrais
  - Būsenos keitimas (patvirtinta/atmesta/vykdoma)
  - Email pranešimai vartotojams

### Paprastas vartotojas  

**US-06: Rezervacijos kūrimas**
- Kaip vartotojas, noriu rezervuoti įrangą, kad galėčiau ją naudoti reikalingu laiku
- Priėmimo kriterijai:
  - Datų pasirinkimas su validacija
  - Rezervacijos formos užpildymas
  - Patvirtinimo email

**US-07: Savo rezervacijų valdymas**
- Kaip vartotojas, noriu matyti ir valdyti savo rezervacijas
- Priėmimo kriterijai:
  - Savo rezervacijų sąrašas
  - Redagavimo galimybė
  - Atšaukimo funkcija

## Epic skaidymas

### Epic 1: Autentifikacija ir vartotojų valdymas
- Registracija
- Prisijungimas  
- Profilio valdymas
- Rolių priskyrimai

### Epic 2: Įrangos valdymas
- Įrangos CRUD operacijos
- Nuotraukų valdymas
- Kategorijų sistema
- Filtravimas ir paieška

### Epic 3: Rezervacijų sistema
- Rezervacijų kūrimas
- Datų validacija
- Rezervacijų valdymas
- Email pranešimai

### Epic 4: UI/UX ir responsive dizainas
- Tailwind CSS implementacija
- Mobile-first approach
- Accessible design
- Performance optimization

## Task'ų suskaidymas

### Frontend Tasks:
- FE-01: React aplikacijos setup
- FE-02: Routing ir navigacijos komponentas
- FE-03: Autentifikacijos formos
- FE-04: Įrangos sąrašo komponentas
- FE-05: Įrangos detalių komponentas
- FE-06: Rezervacijos forma
- FE-07: Admin dashboard
- FE-08: Responsive dizainas ir Tailwind
- FE-09: Unit testų rašymas

### Backend Tasks:
- BE-01: Express server setup
- BE-02: MongoDB connection
- BE-03: Authentication middleware
- BE-04: Įrangos API endpoints
- BE-05: Rezervacijų API endpoints
- BE-06: File upload functionality
- BE-07: Email notifications
- BE-08: API validation
- BE-09: Backend unit testai

### Database Tasks:
- DB-01: MongoDB schema design
- DB-02: User model
- DB-03: Equipment model  
- DB-04: Reservation model
- DB-05: Seeders ir test data