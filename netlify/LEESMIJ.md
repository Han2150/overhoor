# Overhoor online zetten

## Wat zit erin

- `public/index.html` is de website met uitleg, prijs en betaalknop.
- `public/app/` is de app zelf (Latijn + Geschiedenis, zonder uitleg-agent). Die is alleen te openen na betaling.
- `public/bedankt.html` is de pagina waar je na het betalen terugkomt, met de toegangscode.
- `netlify/functions/` bevat de serverfuncties die met Mollie praten.
- `netlify/edge-functions/gate.js` is het slot dat `/app` afschermt.

## Stappen

1. **Mollie-account aanmaken** op mollie.com. Je hebt een KvK-nummer en een zakelijke rekening nodig. Zet iDEAL aan.
2. **API-sleutels opzoeken** in Mollie onder *Developers > API keys*. Je ziet een testsleutel (`test_...`) en een live-sleutel (`live_...`). Begin met de testsleutel.
3. **Netlify-account aanmaken** op netlify.com (gratis).
4. **Node.js installeren** via nodejs.org (de LTS-versie).
5. **Netlify-programma installeren.** Open Terminal (Mac) of PowerShell (Windows) en typ:
   `npm install -g netlify-cli`
6. **Inloggen:** `netlify login`
7. **Naar deze map gaan:** typ `cd ` (met spatie), sleep de map `overhoor` in het venster en druk op Enter.
8. **Site aanmaken en online zetten:** `netlify deploy --prod`
   Kies "Create & configure a new site". De vraag naar de publish-map beantwoord je met `public`.
9. **Twee geheime instellingen toevoegen.** Ga in Netlify naar je site, dan *Site configuration > Environment variables*, en voeg toe:
   - `MOLLIE_API_KEY`: je Mollie-testsleutel.
   - `ACCESS_SECRET`: een lange willekeurige reeks van minstens 40 tekens. Typ in Terminal `openssl rand -base64 32` en plak de uitkomst. Verander deze later nooit meer, anders werken alle verkochte codes niet meer.
10. **Opnieuw online zetten** zodat de instellingen actief worden: `netlify deploy --prod`
11. **Testen.** Open je site en betaal. In testmodus toont Mollie een testpagina waar je "Paid" kiest. Je komt terug op de bedankpagina met een code en kunt de app openen. Test ook de code op een ander apparaat.
12. **Live gaan.** Vervang `MOLLIE_API_KEY` door je live-sleutel en doe nog één keer `netlify deploy --prod`.

## Nog invullen voor je live gaat

- `[JOUW-EMAIL]` onderaan `public/index.html`.
- De gegevens tussen [haken] in `public/voorwaarden.html` en `public/privacy.html`. Laat deze teksten even controleren.
- Toestemming van de uitgever voor de Disco-woordenlijsten, of haal Latijn eruit tot dat geregeld is.

## Goed om te weten

- Van elke €2 gaat ongeveer €0,35 btw af en €0,32 naar Mollie. Er blijft ongeveer €1,33 over.
- Voortgang (welke woorden je kent) wordt in de browser van de leerling bewaard, niet op de server.
- Een eigen domeinnaam (bijv. overhoor.nl) koppel je in Netlify onder *Domain management*.
