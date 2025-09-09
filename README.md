# Statybinės technikos nuomos sistema

## Projektą aprašymas
Įrangos rezervacijos ir administravimo sistema, skirta statybinės technikos nuomai. Sistema leidžia administratoriui įkelti turimą įrangą, o vartotojams ją rezervuoti ir išsinuomoti su protingais apribojimais.

## Verslo idėja
Statybinės technikos nuoma - krautuvai, betonmaišės, generatoriai, pjovimo įrankiai ir kita profesionali įranga.

## Funkciniai reikalavimai

### Visi vartotojai:
- Peržiūrėti įrangos sąrašą
- Peržiūrėti pasirinktos įrangos informaciją

### Administratorius:
- Sukurti naują įrangą sistemoje
- Atnaujinti įrangos informaciją
- Keisti įrangos būseną (paskelbta, juodraštis)
- Peržiūrėti visas rezervacijas
- Peržiūrėti pasirinktos rezervacijos informaciją
- Keisti rezervacijos būseną (patvirtinta, atmesta, vykdoma, laukianti)

### Paprastas vartotojas:
- Peržiūrėti savo rezervacijas
- Sukurti naują rezervaciją
- Atnaujinti rezervacijos informaciją
- Atšaukti rezervaciją

## Nefunkciniai reikalavimai

### Technologijos:
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Duomenų bazė**: MongoDB
- **Versijų kontrolė**: Git, GitHub
- **Testavimas**: Jest, React Testing Library

### Kiti reikalavimai:
- Vartotojų autentifikacija
- Responsive dizainas
- Unit testai pagrindiniam funkcionalumui
- Protingi rezervacijos apribojimai

## Vartotojų rolės
1. **Administratorius** - valdo įrangą ir rezervacijas
2. **Paprastas vartotojas** - rezervuoja įrangą

## Projekto struktūra
```
├── frontend/          # React aplikacija
├── backend/           # Node.js/Express API
├── docs/              # Dokumentacija
└── tests/             # Testai
```

## Paleidimo instrukcijos

### Lokaliai
1. Klonuokite repozitoriją
2. Įdiekite priklausomybes: `npm install`
3. Sukonfigūruokite MongoDB jungtis
4. Paleiskite backend: `npm run server`
5. Paleiskite frontend: `npm run dev`

### Deployment
Sistema bus išdėstyta į Render/Vercel platformas.

## Vystymo procesas
- Kiekviena funkcija vystoma atskirame Git branch'e
- Pull Request procesas į main branch'ą
- Commit'ų konvencija: feat/fix/docs/test
- Užduočių sekimas per Trello