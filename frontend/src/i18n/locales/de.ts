import type { Dictionary } from '../index';

const de: Dictionary = {
  // ── Willkommensbildschirm / Spielerauswahl ─────────────────────
  'welcome.subtitle': 'Erstelle deinen Spieler, um loszulegen!',
  'welcome.subtitleReturning': 'Wer spielt heute?',
  'welcome.storageWarning': '⚠️ Der Speicher deines Browsers ist nicht verfügbar.',
  'welcome.storageWarningDetail': 'Du kannst trotzdem spielen, aber dein Profil wird nicht gespeichert.',
  'welcome.evictionMessage': 'Wir haben Platz gemacht! {names} wurde entfernt, da wir uns nur 50 Spieler merken können.',
  'welcome.clearError': 'Profile konnten nicht gelöscht werden. Bitte versuche es erneut.',
  'welcome.backToList': '← Zurück zur Spielerliste',
  'welcome.dismissError': 'Fehler schließen',

  // ── Spieler erstellen und verwalten ────────────────────────────
  'player.nameLabel': 'Dein Name',
  'player.namePlaceholder': 'Gib deinen Namen ein...',
  'player.chooseAvatar': 'Wähle deinen Avatar',
  'player.letsGo': "Los geht's! 🚀",
  'player.overwriteConfirm': 'Ein Spieler namens {playerName} existiert bereits. Möchtest du ihn ersetzen?',
  'player.goBack': 'Zurück',
  'player.replace': 'Ersetzen',
  'player.newPlayer': '➕ Neuer Spieler',
  'player.clearAll': 'Alle Profile löschen',
  'player.charCount': '{current}/{max}',
  'player.playAs': 'Spielen als {playerName}',
  'player.avgScore': 'Ø: {score}',
  'player.noScore': '—',
  'player.removePlayer': '{playerName} entfernen',
  'player.replaceDialog': '{playerName} ersetzen',

  // ── Kopfzeile ──────────────────────────────────────────────────
  'header.greeting': 'Hallo, {playerName}',
  'header.switchPlayer': 'Spieler wechseln',
  'header.changeLanguage': 'Sprache ändern',

  // ── Spiel ──────────────────────────────────────────────────────
  'game.readyToPlay': 'Bereit zu spielen?',
  'game.instructions': 'Beantworte 10 Verhältnisaufgaben so schnell du kannst!',
  'game.correct': 'Richtig!',
  'game.incorrect': 'Knapp daneben!',
  'game.incorrectAnswer': 'Die Antwort war {answer}',
  'game.roundOf': 'Runde {current} von {total}',
  'game.roundCompleted': 'Runde {current} von {total} abgeschlossen',
  'game.replay': 'Wiederholung',
  'game.replayCompleted': 'Wiederholung {current} von {total} abgeschlossen',
  'game.scoreLabel': 'Punkte:',
  'game.practice': 'Übung',
  'game.timerDefault': '50,0s',

  // ── Antwort-Eingabe ────────────────────────────────────────────
  'game.answerPlaceholder': '?',
  'game.submit': 'Senden',
  'game.go': 'Los',

  // ── Modusauswahl ───────────────────────────────────────────────
  'mode.play': 'Spielen',
  'mode.playDescription': 'Hol dir den Highscore!',
  'mode.playAriaLabel': 'Spielen — Hol dir den Highscore!',
  'mode.improve': 'Verbessern',
  'mode.improveDescription': 'Übe deine schwierigen Bereiche: {categories}',
  'mode.improveAriaLabel': 'Verbessern — Übe deine schwierigen Bereiche: {categories}',
  'mode.encouragement': 'Keine schwierigen Bereiche gerade — spiel weiter, um den Verbesserungsmodus freizuschalten!',
  'mode.groupLabel': 'Spielmodus-Auswahl',

  // ── Ergebnisübersicht ──────────────────────────────────────────
  'summary.gameOver': 'Spiel vorbei!',
  'summary.totalScore': 'Gesamtpunktzahl',
  'summary.correctCount': 'Du hast {count}/{total} richtig!',
  'summary.practiceHint': 'Weiter üben: {pairs}',
  'summary.playAgain': 'Nochmal spielen',
  'summary.backToMenu': 'Zurück zum Menü',
  'summary.colNumber': '#',
  'summary.colFormula': 'Aufgabe',
  'summary.colAnswer': 'Antwort',
  'summary.colResult': 'Ergebnis',
  'summary.colTime': 'Zeit',
  'summary.colPoints': 'Punkte',

  // ── Letzte Highscores ──────────────────────────────────────────
  'scores.title': 'Letzte Highscores',
  'scores.empty': 'Spiel dein erstes Spiel, um deine Punkte hier zu sehen!',
  'scores.listLabel': 'Letzte Highscores, höchste zuerst',
  'scores.scorePoints': '{score} Punkte',
  'scores.placeScore': '{ordinal} Platz: {score} Punkte',

  // ── Ordnungszahlen ─────────────────────────────────────────────
  'ordinal.1': '1.',
  'ordinal.2': '2.',
  'ordinal.3': '3.',
  'ordinal.4': '4.',
  'ordinal.5': '5.',

  // ── Bestätigungsdialoge ────────────────────────────────────────
  'dialog.removeTitle': '{playerName} entfernen?',
  'dialog.removeMessage': 'Die Punkte gehen verloren.',
  'dialog.cancel': 'Abbrechen',
  'dialog.remove': 'Entfernen',
  'dialog.removeLabel': '{playerName} entfernen',
  'dialog.clearAllTitle': 'Alle Profile löschen?',
  'dialog.clearAllMessage': 'Alle Spieler und Punkte werden gelöscht. Bist du sicher? Das kann nicht rückgängig gemacht werden!',
  'dialog.clearAllLabel': 'Alle Profile löschen',
  'dialog.clearAll': 'Alle löschen',

  // ── Avatare ────────────────────────────────────────────────────
  'avatar.rocket': 'Rakete',
  'avatar.star': 'Stern',
  'avatar.cat': 'Katze',
  'avatar.turtle': 'Schildkröte',
  'avatar.robot': 'Roboter',
  'avatar.dinosaur': 'Dinosaurier',
  'avatar.unicorn': 'Einhorn',
  'avatar.lightning': 'Blitz',

  'avatar.rocketDesc': 'Eine fliegende Rakete',
  'avatar.starDesc': 'Ein leuchtender Stern',
  'avatar.catDesc': 'Eine freundliche Katze',
  'avatar.turtleDesc': 'Eine lächelnde Schildkröte',
  'avatar.robotDesc': 'Ein süßer Roboter',
  'avatar.dinosaurDesc': 'Ein freundlicher Dinosaurier',
  'avatar.unicornDesc': 'Ein magisches Einhorn',
  'avatar.lightningDesc': 'Ein Blitz',

  // ── Barrierefreiheit ───────────────────────────────────────────
  'a11y.gameStatus': 'Spielstatus',
  'a11y.yourAnswer': 'Deine Antwort',
  'a11y.submitAnswer': 'Antwort senden',
  'a11y.currentAnswer': 'Aktuelle Antwort',
  'a11y.digit': 'Ziffer {digit}',
  'a11y.deleteDigit': 'letzte Ziffer löschen',
  'a11y.submitNumpad': 'Antwort senden',
  'a11y.chooseAvatar': 'Wähle deinen Avatar',
  'a11y.formulaWithAnswer': '{question}. Deine Antwort war {answer}.',
  'a11y.formulaWithoutAnswer': '{question}. Finde den fehlenden Wert.',

  'questionType.percentage': 'Prozentrechnung',
  'questionType.ratio': 'Verhältnisse',
  'questionType.fraction': 'Brüche',
  'questionType.multiItemRatio': 'Sortier-Aufgaben',
  'questionType.percentageOfWhole': 'Prozent-Geschichten',
  'questionType.complexExtrapolation': 'Skalierungsaufgaben',

  'story.multiItemRatio.backpack': 'Ein Rucksack hat {a} blaue Ordner ({b}g je) und {c} rote Hefte ({d}g je). Wie schwer sind die blauen Ordner insgesamt?',
  'story.multiItemRatio.lunchbox': 'Eine Brotdose hat {a} Äpfel ({b} kcal je) und {c} Kekse ({d} kcal je). Wie viele Kalorien haben die Äpfel?',
  'story.multiItemRatio.toybox': 'Eine Spielkiste hat {a} Autos ({b} € je) und {c} Puppen ({d} € je). Was kosten die Autos insgesamt?',
  'story.multiItemRatio.garden': 'Ein Garten hat {a} Rosen ({b}cm je) und {c} Sonnenblumen ({d}cm je). Wie hoch sind die Rosen zusammen?',
  'story.multiItemRatio.shelf': 'Ein Regal hat {a} Sachbücher ({b} Seiten je) und {c} Comics ({d} Seiten je). Wie viele Seiten haben die Sachbücher?',
  'story.multiItemRatio.art': 'Ein Malset hat {a} Farbtuben ({b}ml je) und {c} Klebestifte ({d}ml je). Wie viele ml Farbe gibt es insgesamt?',

  'story.percentageOfWhole.petshop': 'Eine Tierhandlung hat {a} Kätzchen, {b} Welpen und andere Tiere — {c} insgesamt. Wie viel Prozent sind die Kätzchen?',
  'story.percentageOfWhole.classroom': 'Ein Klassenzimmer hat {a} Jungen, {b} Mädchen und Lehrer. Es sind {c} Personen insgesamt. Wie viel Prozent sind die Jungen?',
  'story.percentageOfWhole.orchard': 'Ein Obstgarten hat {a} Apfelbäume, {b} Birnbäume und Kirschbäume — {c} Bäume insgesamt. Wie viel Prozent sind Apfelbäume?',
  'story.percentageOfWhole.aquarium': 'Ein Aquarium hat {a} Goldfische, {b} Kaiserfische und Clownfische — {c} Fische insgesamt. Wie viel Prozent sind Goldfische?',
  'story.percentageOfWhole.market': 'Ein Marktstand hat {a} Orangen, {b} Bananen und Mangos — {c} Früchte insgesamt. Wie viel Prozent sind Orangen?',
  'story.percentageOfWhole.zoo': 'Ein Gehege hat {a} Löwen, {b} Tiger und Bären — {c} Tiere insgesamt. Wie viel Prozent sind Löwen?',

  'story.complexExtrapolation.space': 'An einem sonnigen Tag im All: wenn {a} Weltraumpfadfinder {b} Sauerstofftanks brauchen, wie viele brauchen {c} Pfadfinder?',
  'story.complexExtrapolation.camping': 'An einem See: wenn {a} Camper {b} Heringe brauchen, wie viele brauchen {c} Camper?',
  'story.complexExtrapolation.baking': 'In einer Küche: wenn {a} Kuchen {b} Eier brauchen, wie viele brauchen {c} Kuchen?',
  'story.complexExtrapolation.travel': 'Auf einer Bergstraße: wenn {a} Autos {b} Liter brauchen, wie viele brauchen {c} Autos?',
  'story.complexExtrapolation.sports': 'An einem Regentag: wenn {a} Teams {b} Bälle brauchen, wie viele brauchen {c} Teams?',
  'story.complexExtrapolation.school': 'Im Kunstunterricht: wenn {a} Schüler {b} Pinsel brauchen, wie viele brauchen {c} Schüler?',
};

export default de;
