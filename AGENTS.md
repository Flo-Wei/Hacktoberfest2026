# AGENTS.md

Gemeinsame Infos für alle Coding-Agents und alle 4 Teammitglieder. Wenn sich eine Entscheidung ändert, hier anpassen, damit alle denselben Stand haben.

## Projekt

Grabby ist ein Hackathon-Projekt: Essensempfehlungen auf Basis von Rabattaktionen, dem eigenen Profil und dem, was ähnlichen Usern gefällt. Krabby ist der Chat-Assistent in der App.

Das Repo und der Ordner heißen `Hacktoberfest2026`, das Projekt heißt `grabby`.

## Features

### 1. Onboarding

Registrierung mit kurzen Infos zur Person: Name, Alter, Präferenzen und Ziele (z.B. abnehmen, Fitness).

### 2. Swipe

User swipen durch Produkte. Gezeigt werden Produkte, die ähnlichen Usern gefallen haben. Solange es noch keine Swipes gibt, richtet sich die Auswahl nach den Zielen und Präferenzen aus dem Onboarding.

### 3. Chat mit Krabby

Läuft mit Gemma und kann Text, Bild und Audio verarbeiten:

- **Angebote abfragen:** "Ich gehe gerade zum Hofer, gib mir alle Angebote" liefert die Produkte, die dort im Angebot sind.
- **Produktfoto:** Das fotografierte Produkt wird zu den Präferenzen hinzugefügt.
- **Vorschlag und Roasting:** Krabby gibt Vorschläge oder roastet den User, gesprochen über ElevenLabs (z.B. "Zu wenig Proteine!").

Die Roasting-Stimme ist eine fiktive Bodybuilder-Figur mit einer Stimme aus der ElevenLabs-Library. Keine echten Personen nennen oder ihre Stimmen klonen, das verbieten die ElevenLabs-Regeln.

### 4. Infoboard

Zeigt, welche Angebote es in welchem Laden in der Nähe gibt, mit Filtern nach Laden, Kategorie und Entfernung.

## Festgelegte Entscheidungen

- **Alles läuft in Lovable:** Frontend, Login, Datenbank und Serverlogik (Chat, Recommender) werden im Lovable-Projekt gebaut und gehostet. Python wird nicht für Features verwendet, das Paket in `src/grabby` ist nur das ursprüngliche Grundgerüst.
- **Angebote und Läden sind Mock-Daten:** Keine echten Scraper bauen. Läden (z.B. Hofer, Billa, Spar) und Angebote kommen aus einem festen Datensatz in der Datenbank.
- **Kein echtes GPS:** Die Stadt und die Entfernung zum Laden stehen in den Mock-Daten.

## Zusammenarbeit

- Für jedes Feature einen eigenen Branch anlegen, z.B. `feature/swipe` oder `feature/krabby-chat`.
- Wer fertig ist, merged den Branch selbst nach `main`, ohne Pflicht-Review. `main` muss danach weiter funktionieren.
- Vor dem Mergen den aktuellen Stand von `main` in den eigenen Branch holen.
- Lovable-Projekte liegen in Lovable und nicht automatisch in diesem Repo. Mit dem Lovable MCP arbeiten alle am selben Projekt und nicht auf Git-Branches, also Änderungen dort im Team absprechen.
- Geheimnisse wie `.env` nie committen.

## Externe Dienste

Die Keys stehen in `.env.example`. Neue Keys dort ebenfalls eintragen. Keys, die die App zur Laufzeit braucht, gehören in die Secrets des Lovable-Projekts und dürfen nie im Frontend-Code landen.

- **Gemma:** läuft über die gehostete Gemini API mit `GEMINI_API_KEY`. Verfügbare Modelle sind `gemma-4-26b-a4b-it` und `gemma-4-31b-it`. Vor dem Bauen testen, ob sie Bild und Audio wie benötigt verarbeiten.
- **ElevenLabs:** verwendet `ELEVENLABS_API_KEY`.
- **Lovable:** läuft über den `lovable` MCP-Server und den `lovable-mcp` Skill. Der Server nutzt OAuth pro Person und braucht keinen Key.
- **Lovable REST API:** `LOV_PUBLIC_API_KEY` ist optional und braucht einen Business- oder Enterprise-Workspace. Lovable reserviert Secret-Namen mit dem Präfix `LOVABLE_`, also dieses Präfix nicht verwenden.

Vor diesen Lovable-Aktionen immer nachfragen:

- `create_project` und `send_message` verbrauchen Build-Credits.
- `deploy_project` veröffentlicht eine öffentliche URL.
- `query_database` kann Daten und Schema ändern, deshalb das SQL vor jedem Schreibzugriff zeigen.

## Befehle

```bash
uv sync                         # Abhängigkeiten installieren
cp .env.example .env            # nur beim ersten Mal
uv run --env-file .env grabby   # Grundgerüst mit API-Keys starten
uv add <package>                # Abhängigkeit hinzufügen, dann pyproject.toml und uv.lock committen
uv build                        # Paket bauen
```

Es gibt noch keinen Test-Runner und keinen Linter. `.env` wird nicht automatisch geladen, Befehle mit API-Keys brauchen also `--env-file .env`.
