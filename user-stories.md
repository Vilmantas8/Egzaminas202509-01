# User Stories
## Statybinės Technikos Rezervacijos Sistema

---

## Epic 1: Vartotojų Valdymas ir Autentifikacija

### US-001: Vartotojo Registracija
**Kaip** naujas vartotojas  
**Noriu** užsiregistruoti sistemoje  
**Kad** galėčiau naudotis įrangos nuomos paslaugomis

**Acceptance Criteria:**
- Galiu įvesti el. paštą, slaptažodį, vardą ir pavardę
- Sistema tikrina el. pašto formato teisingumą
- Slaptažodis turi būti bent 8 simbolių ilgio
- Gavęs registracijos patvirtinimą galiu prisijungti
- Sistema neleidu registruotis su jau egzistuojančiu el. paštu

**Definition of Done:**
- [ ] Frontend registracijos forma
- [ ] Backend API endpoint
- [ ] Duomenų validacija
- [ ] Unit testai
- [ ] UI error handling

### US-002: Vartotojo Prisijungimas
**Kaip** registruotas vartotojas  
**Noriu** prisijungti prie sistemos  
**Kad** galėčiau naudotis savo paskyra

**Acceptance Criteria:**
- Galiu prisijungti su el. paštu ir slaptažodžiu
- Neteisingų duomenų atveju matau aiškų klaidos pranešimą
- Sėkmingo prisijungimo atveju perinukreipiamas į pagrindinį puslapį
- Mano sesija išlieka aktyvi uždarius naršyklę
- Galiu atsijungti bet kuriuo metu

**Definition of Done:**
- [ ] Login forma su validacija
- [ ] JWT token implementation
- [ ] Session management
- [ ] Unit testai
- [ ] Error handling

### US-003: Profilio Valdymas
**Kaip** prisijungęs vartotojas  
**Noriu** peržiūrėti ir redaguoti savo profilį  
**Kad** galėčiau atnaujinti asmeninę informaciją

**Acceptance Criteria:**
- Galiu peržiūrėti savo profilio informaciją
- Galiu keisti vardą, pavardę, telefono numerį
- Negaliu keisti el. pašto adreso
- Galiu keisti slaptažodį įvedus dabartinį
- Visi pakeitimai išsaugomi duomenų bazėje

---

## Epic 2: Įrangos Katalogas

### US-004: Įrangos Sąrašo Peržiūra
**Kaip** vartotojas  
**Noriu** peržiūrėti visą prieinamą įrangą  
**Kad** galėčiau pasirinkti man tinkamą techniką

**Acceptance Criteria:**
- Matau visą publikuotą įrangą kortelių pavidalu
- Kiekviena kortelė rodo pavadinimą, nuotrauką, kainą per dieną
- Galiu spustelėti ant kortelės ir peržiūrėti detalų aprašymą
- Sąrašas kraunamas per puslapius (pagination)
- Sistema rodo įrangos prieinamumo statusą

### US-005: Įrangos Paieška ir Filtravimas
**Kaip** vartotojas  
**Noriu** ieškoti ir filtruoti įrangą  
**Kad** greitai rastau man reikalingą techniką

**Acceptance Criteria:**
- Galiu ieškoti pagal įrangos pavadinimą ar aprašymą
- Galiu filtruoti pagal kategorijas
- Galiu filtruoti pagal kainos intervalą
- Galiu rūšiuoti pagal kainą (didėjančia/mažėjančia tvarka)
- Filtrai veikia kartu (AND logika)
- Paieškos rezultatai atsinaujina real-time

### US-006: Įrangos Detalių Peržiūra
**Kaip** vartotojas  
**Noriu** peržiūrėti detalią įrangos informaciją  
**Kad** galėčiau nuspręsti ar ji man tinka

**Acceptance Criteria:**
- Matau visas įrangos nuotraukas galerijos pavidalu
- Matau detalų aprašymą ir specifikacijas
- Matau kainą per dieną ir depozitą (jei yra)
- Matau įrangos kategoriją
- Matau prieinamumo kalendorių
- Galiu pereiti tiesiai prie rezervacijos kūrimo

---

## Epic 3: Rezervacijos (Vartotojo Pusė)

### US-007: Rezervacijos Kūrimas
**Kaip** vartotojas  
**Noriu** sukurti rezervaciją pasirinktai įrangai  
**Kad** galėčiau ją išsinuomoti reikiamu laikotarpiu

**Acceptance Criteria:**
- Galiu pasirinkti pradžios ir pabaigos datas
- Sistema neleidžia pasirinkti praeities datų
- Sistema tikrina ar pasirinktas laikotarpis yra laisvas
- Galiu įvesti pastabas rezervacijai
- Matau apskaičiuotą bendrą kainą
- Po sukūrimo matau patvirtinimą ir rezervacijos numerį

### US-008: Mano Rezervacijų Peržiūra
**Kaip** vartotojas  
**Noriu** peržiūrėti visas savo rezervacijas  
**Kad** galėčiau sekti jų būsenas ir valdyti jas

**Acceptance Criteria:**
- Matau visų savo rezervacijų sąrašą
- Kiekviena rezervacija rodo įrangos pavadinimą, datas, būseną
- Rezervacijos rūšiuojamos pagal sukūrimo datą (naujausios viršuje)
- Galiu filtruoti pagal rezervacijos būseną
- Galiu spustelėti ant rezervacijos ir matyti visą informaciją
### US-009: Rezervacijos Redagavimas
**Kaip** vartotojas  
**Noriu** redaguoti savo laukiančią rezervaciją  
**Kad** galėčiau pakeisti datas ar pastabas

**Acceptance Criteria:**
- Galiu redaguoti tik laukiančias rezervacijas
- Galiu keisti pradžios ir pabaigos datas
- Sistema tikrina naujų datų prieinamumą
- Galiu keisti pastabas
- Pakeitimai atsinaujina bendram kainai
- Po pakeitimo rezervacija lieka laukiančios būsenos

### US-010: Rezervacijos Atšaukimas
**Kaip** vartotojas  
**Noriu** atšaukti savo rezervaciją  
**Kad** galėčiau ją panaikinti esant poreikiui

**Acceptance Criteria:**
- Galiu atšaukti laukiančias ir patvirtintas rezervacijas
- Negaliu atšaukti rezervacijų per dieną iki pradžios
- Sistema paprašo patvirtinimo prieš atšaukiant
- Atšaukta rezervacija keičia būseną į "atšaukta"
- Gavęs patvirtinimą apie sėkmingą atšaukimą

---

## Epic 4: Administravimas - Įrangos Valdymas

### US-011: Įrangos Sukūrimas (Admin)
**Kaip** administratorius  
**Noriu** sukurti naują įrangos įrašą  
**Kad** vartotojai galėtų ją rezervuoti

**Acceptance Criteria:**
- Galiu įvesti įrangos pavadinimą, aprašymą, kainą
- Galiu pasirinkti kategoriją iš sąrašo
- Galiu įkelti kelias nuotraukas
- Galiu įvesti technines specifikacijas
- Galiu nustatyti įrangos būseną (juodraštis/paskelbta)
- Sukurta įranga atsiranda sistemoje

### US-012: Įrangos Redagavimas (Admin)
**Kaip** administratorius  
**Noriu** redaguoti esamos įrangos informaciją  
**Kad** galėčiau ją atnaujinti ar ištaisyti

**Acceptance Criteria:**
- Galiu keisti visus įrangos laukus
- Galiu pridėti ar pašalinti nuotraukas
- Galiu keisti įrangos būseną
- Pakeitimai išsaugomi ir matomi vartotojams
- Keičiant į juodraštį - įranga pranyksta iš vartotojų sąrašo

### US-013: Įrangos Šalinimas (Admin)
**Kaip** administratorius  
**Noriu** pašalinti įrangą iš sistemos  
**Kad** ji nebūtų matoma vartotojams

**Acceptance Criteria:**
- Galiu pašalinti įrangą tik jei ji neturi aktyvių rezervacijų
- Sistema paprašo patvirtinimo prieš šalinant
- Šalinimas yra "soft delete" - duomenys lieka bazėje
- Pašalinta įranga neberodoma jokiuose sąrašuose
- Istorinės rezervacijos lieka matomos

---

## Epic 5: Administravimas - Rezervacijų Valdymas

### US-014: Visų Rezervacijų Peržiūra (Admin)
**Kaip** administratorius  
**Noriu** peržiūrėti visas sistemos rezervacijas  
**Kad** galėčiau jas administruoti

**Acceptance Criteria:**
- Matau visų vartotojų rezervacijas vienoje lentelėje
- Galiu filtruoti pagal būseną, datas, vartotoją, įrangą
- Rezervacijos rūšiuojamos pagal sukūrimo datą
- Matau vartotojo el. paštą ir kontaktus
- Galiu spustelėti ant rezervacijos ir matyti visą informaciją

### US-015: Rezervacijos Patvirtinimas/Atmetimas (Admin)
**Kaip** administratorius  
**Noriu** patvirtinti arba atmesti laukiančias rezervacijas  
**Kad** galėčiau kontroliuoti įrangos paskirstymą

**Acceptance Criteria:**
- Galiu patvirtinti laukiančią rezervaciją
- Galiu atmesti laukiančią rezervaciją su komentaru
- Sistema automatiškai išsiunčia el. laišką vartotojui
- Patvirtinta rezervacija keičia būseną į "patvirtinta"
- Atmesta rezervacija keičia būseną į "atmesta"

### US-016: Rezervacijos Būsenos Valdymas (Admin)
**Kaip** administratorius  
**Noriu** keisti patvirtintų rezervacijų būsenas  
**Kad** galėčiau sekti nuomos procesą

**Acceptance Criteria:**
- Galiu pažymėti patvirtintą rezervaciją kaip "vykdomą"
- Galiu pažymėti vykdomą rezervaciją kaip "baigtą"
- Galiu atšaukti rezervaciją su komentaru
- Kiekvienas būsenos keitimas fiksuojamas su data ir laiku
- Vartotojas gauna pranešimą apie būsenos keitimą

---

## Epic 6: Sistemos Funkcijos

### US-017: Prieinamumo Kalendorius
**Kaip** vartotojas  
**Noriu** matyti įrangos užimtumo kalendorių  
**Kad** galėčiau pasirinkti laisvas datas

**Acceptance Criteria:**
- Matau kalendoriaus vaizdą su užimtomis ir laisvomis dienomis
- Užimtos dienos pažymėtos skirtinga spalva
- Galiu paspausti ant laisvo laikotarpio ir sukurti rezervaciją
- Kalendorius rodo bent 3 mėnesius į priekį
- Praeities datos yra neaktyvios

### US-018: Notifikacijos
**Kaip** vartotojas  
**Noriu** gauti pranešimus apie mano rezervacijas  
**Kad** būčiau informuotas apie svarbius įvykius

**Acceptance Criteria:**
- Gaunu el. laišką sukūrus rezervaciją
- Gaunu el. laišką kai rezervacija patvirtinama ar atmetama
- Gaunu priminimą prieš dieną iki nuomos pradžios
- Gaunu pranešimą kai rezervacijos būsena keičiasi
- Galiu išjungti tam tikrus pranešimus profilyje

### US-019: Administracijos Ataskaitos (Admin)
**Kaip** administratorius  
**Noriu** generuoti ataskaitas apie sistemos naudojimą  
**Kad** galėčiau analizuoti veiklą

**Acceptance Criteria:**
- Galiu eksportuoti rezervacijų ataskaitas CSV formatu
- Galiu filtruoti ataskaitas pagal laikotarpį
- Ataskaita rodo įrangos populiarumą
- Ataskaita rodo vartotojų aktyvumą
- Matau pagrindinę statistiką dashboard'e

### US-020: Paieškos Optimizavimas
**Kaip** vartotojas  
**Noriu** greitai ir tiksliai rasti reikalingą įrangą  
**Kad** sutaupyčiau laiko

**Acceptance Criteria:**
- Paieška randa rezultatus pagal dalį žodžio
- Paieška veikia ir lietuviškai, ir angliškai
- Populiariausi rezultatai rodomi pirmiau
- Galiu saugoti dažnai naudojamus filtrus
- Sistema siūlo panašią įrangą jei pageidaujama neprieinama

---

## Techniniai User Stories

### US-021: Sistema Performance
**Kaip** vartotojas  
**Noriu** kad sistema veiktų greitai  
**Kad** galėčiau efektyviai ja naudotis

**Acceptance Criteria:**
- Puslapiai įkeliami per mažiau nei 3 sekundes
- API atsakymai gržinami per mažiau nei 200ms
- Duomenų bazės užklausos optimizuotos indeksais
- Frontend naudoja lazy loading dideliems sąrašams

### US-022: Responsive Dizainas
**Kaip** vartotojas  
**Noriu** naudoti sistemą mobiliajame telefone  
**Kad** galėčiau ja naudotis bet kur

**Acceptance Criteria:**
- Sistema prisitaiko prie telefono ekrano
- Visos funkcijos veikia planšetėje
- Navigacija aiški visuose įrenginiuose
- Forma laukai patogūs liesti

### US-023: Sistemos Saugumas
**Kaip** sistemos administratorius  
**Noriu** kad sistema būtų saugi  
**Kad** vartotojų duomenys būtų apsaugoti

**Acceptance Criteria:**
- Visi slaptažodžiai hash'inami
- API endpoint'ai apsaugoti autentifikacija
- Sistema atsispari brute-force atakoms
- Jautrūs duomenys šifruojami duomenų bazėje

---

## Definition of Done - Bendri Kriterijai

**Kiekvienai User Story turi būti:**
- [ ] Frontend komponentas implementuotas
- [ ] Backend API endpoint'as veikia
- [ ] Duomenų validacija įgyvendinta
- [ ] Unit testai parašyti ir praeina
- [ ] Responsive dizainas veikia
- [ ] Error handling įgyvendintas
- [ ] Code review atliktas
- [ ] Funkcionalumas ištestuotas manually

**Techniniai reikalavimai:**
- Kodas atitinka ESLint taisykles
- Git commit'ai aiškūs ir smulkūs
- API dokumentacija atnaujinta
- README failas atnaujintas

---

**Story Points Sistema:**
- **1 punto:** Mažas task, ~2-4 valandos
- **2 punktai:** Vidutinis task, ~4-8 valandos  
- **3 punktai:** Didelis task, ~8-16 valandų
- **5 punktų:** Labai didelis task, reikia skaidyti

**Prioritetų Sistema:**
- **Must Have:** Kritinės funkcijos MVP
- **Should Have:** Svarbios funkcijos pilnai versijai
- **Could Have:** Papildomos funkcijos
- **Won't Have:** Ateities versijos funkcijos
