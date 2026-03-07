import type { Dictionary } from '../index';

const es: Dictionary = {
  // ── Pantalla de bienvenida / Selección de jugador ──────────────
  'welcome.subtitle': '¡Crea tu jugador para empezar!',
  'welcome.subtitleReturning': '¿Quién juega hoy?',
  'welcome.storageWarning': '⚠️ El almacenamiento de tu navegador no está disponible.',
  'welcome.storageWarningDetail': 'Puedes seguir jugando, pero tu perfil no se guardará.',
  'welcome.evictionMessage': '¡Te hicimos espacio! {names} fue eliminado porque solo podemos recordar 50 jugadores.',
  'welcome.clearError': 'No se pudieron borrar los perfiles. Inténtalo de nuevo.',
  'welcome.backToList': '← Volver a la lista de jugadores',
  'welcome.dismissError': 'Cerrar error',

  // ── Creación y gestión de jugadores ────────────────────────────
  'player.nameLabel': 'Tu nombre',
  'player.namePlaceholder': 'Escribe tu nombre...',
  'player.chooseAvatar': 'Elige tu avatar',
  'player.letsGo': '¡Vamos! 🚀',
  'player.overwriteConfirm': 'Ya existe un jugador llamado {playerName}. ¿Quieres reemplazarlo?',
  'player.goBack': 'Volver',
  'player.replace': 'Reemplazar',
  'player.newPlayer': '➕ Nuevo jugador',
  'player.clearAll': 'Borrar todos los perfiles',
  'player.charCount': '{current}/{max}',
  'player.playAs': 'Jugar como {playerName}',
  'player.avgScore': 'Prom: {score}',
  'player.noScore': '—',
  'player.removePlayer': 'Eliminar a {playerName}',
  'player.replaceDialog': 'Reemplazar a {playerName}',

  // ── Encabezado ─────────────────────────────────────────────────
  'header.greeting': '¡Hola, {playerName}!',
  'header.switchPlayer': 'Cambiar jugador',
  'header.changeLanguage': 'Cambiar idioma',

  // ── Juego ──────────────────────────────────────────────────────
  'game.readyToPlay': '¿Listo para jugar?',
  'game.instructions': '¡Responde 10 preguntas de proporciones lo más rápido que puedas!',
  'game.correct': '¡Correcto!',
  'game.incorrect': '¡Casi!',
  'game.incorrectAnswer': 'La respuesta era {answer}',
  'game.roundOf': 'Ronda {current} de {total}',
  'game.roundCompleted': 'Ronda {current} de {total} completada',
  'game.replay': 'Repetir',
  'game.replayCompleted': 'Repetición {current} de {total} completada',
  'game.scoreLabel': 'Puntos:',
  'game.practice': 'Práctica',
  'game.timerDefault': '50,0s',

  // ── Entrada de respuesta ───────────────────────────────────────
  'game.answerPlaceholder': '?',
  'game.submit': 'Enviar',
  'game.go': 'Ok',

  // ── Selector de modo ───────────────────────────────────────────
  'mode.play': 'Jugar',
  'mode.playDescription': '¡Consigue la mejor puntuación!',
  'mode.playAriaLabel': 'Jugar — ¡Consigue la mejor puntuación!',
  'mode.improve': 'Mejorar',
  'mode.improveDescription': 'Practica tus áreas difíciles: {categories}',
  'mode.improveAriaLabel': 'Mejorar — Practica tus áreas difíciles: {categories}',
  'mode.encouragement': '¡No hay áreas difíciles ahora — sigue jugando para desbloquear el modo Mejorar!',
  'mode.groupLabel': 'Selección de modo de juego',

  // ── Resumen de puntuación ──────────────────────────────────────
  'summary.gameOver': '¡Fin del juego!',
  'summary.totalScore': 'Puntuación total',
  'summary.correctCount': '¡Acertaste {count}/{total}!',
  'summary.practiceHint': 'Sigue practicando: {pairs}',
  'summary.playAgain': 'Jugar de nuevo',
  'summary.backToMenu': 'Volver al menú',
  'summary.colNumber': '#',
  'summary.colFormula': 'Fórmula',
  'summary.colAnswer': 'Respuesta',
  'summary.colResult': 'Resultado',
  'summary.colTime': 'Tiempo',
  'summary.colPoints': 'Puntos',

  // ── Mejores puntuaciones recientes ─────────────────────────────
  'scores.title': 'Mejores puntuaciones recientes',
  'scores.empty': '¡Juega tu primera partida para ver tus puntuaciones aquí!',
  'scores.listLabel': 'Mejores puntuaciones recientes, de mayor a menor',
  'scores.scorePoints': '{score} puntos',
  'scores.placeScore': '{ordinal} lugar: {score} puntos',

  // ── Ordinales ──────────────────────────────────────────────────
  'ordinal.1': '1.º',
  'ordinal.2': '2.º',
  'ordinal.3': '3.º',
  'ordinal.4': '4.º',
  'ordinal.5': '5.º',

  // ── Diálogos de confirmación ───────────────────────────────────
  'dialog.removeTitle': '¿Eliminar a {playerName}?',
  'dialog.removeMessage': 'Se perderán sus puntuaciones.',
  'dialog.cancel': 'Cancelar',
  'dialog.remove': 'Eliminar',
  'dialog.removeLabel': 'Eliminar a {playerName}',
  'dialog.clearAllTitle': '¿Borrar todos los perfiles?',
  'dialog.clearAllMessage': 'Esto eliminará todos los jugadores y puntuaciones. ¿Estás seguro? ¡No se puede deshacer!',
  'dialog.clearAllLabel': 'Borrar todos los perfiles',
  'dialog.clearAll': 'Borrar todo',

  // ── Avatares ───────────────────────────────────────────────────
  'avatar.rocket': 'Cohete',
  'avatar.star': 'Estrella',
  'avatar.cat': 'Gato',
  'avatar.turtle': 'Tortuga',
  'avatar.robot': 'Robot',
  'avatar.dinosaur': 'Dinosaurio',
  'avatar.unicorn': 'Unicornio',
  'avatar.lightning': 'Rayo',

  'avatar.rocketDesc': 'Un cohete volando',
  'avatar.starDesc': 'Una estrella brillante',
  'avatar.catDesc': 'Un gato simpático',
  'avatar.turtleDesc': 'Una tortuga sonriente',
  'avatar.robotDesc': 'Un robot simpático',
  'avatar.dinosaurDesc': 'Un dinosaurio amigable',
  'avatar.unicornDesc': 'Un unicornio mágico',
  'avatar.lightningDesc': 'Un rayo',

  // ── Accesibilidad ──────────────────────────────────────────────
  'a11y.gameStatus': 'Estado del juego',
  'a11y.yourAnswer': 'Tu respuesta',
  'a11y.submitAnswer': 'Enviar respuesta',
  'a11y.currentAnswer': 'Respuesta actual',
  'a11y.digit': 'dígito {digit}',
  'a11y.deleteDigit': 'borrar último dígito',
  'a11y.submitNumpad': 'enviar respuesta',
  'a11y.chooseAvatar': 'Elige tu avatar',
  'a11y.formulaWithAnswer': '{question}. Tu respuesta fue {answer}.',
  'a11y.formulaWithoutAnswer': '{question}. Encuentra el valor que falta.',

  'questionType.percentage': 'Porcentajes',
  'questionType.ratio': 'Razones',
  'questionType.fraction': 'Fracciones',
  'questionType.multiItemRatio': 'Desafíos de clasificación',
  'questionType.percentageOfWhole': 'Historias de porcentaje',
  'questionType.complexExtrapolation': 'Problemas de escala',

  'story.multiItemRatio.backpack': 'Una mochila tiene {a} carpetas azules ({b}g cada una) y {c} cuadernos rojos ({d}g cada uno). ¿Cuál es el peso total de las carpetas azules?',
  'story.multiItemRatio.lunchbox': 'Una lonchera tiene {a} manzanas ({b} cal cada una) y {c} galletas ({d} cal cada una). ¿Cuántas calorías hay en las manzanas?',
  'story.multiItemRatio.toybox': 'Una caja de juguetes tiene {a} coches (${b} cada uno) y {c} muñecas (${d} cada una). ¿Cuál es el costo total de los coches?',
  'story.multiItemRatio.garden': 'Un jardín tiene {a} rosas ({b}cm cada una) y {c} girasoles ({d}cm cada uno). ¿Cuál es la altura total de las rosas?',
  'story.multiItemRatio.shelf': 'Un estante tiene {a} libros de ciencias ({b} páginas cada uno) y {c} cómics ({d} páginas cada uno). ¿Cuántas páginas hay en los libros de ciencias?',
  'story.multiItemRatio.art': 'Un kit de arte tiene {a} tubos de pintura ({b}ml cada uno) y {c} barras de pegamento ({d}ml cada una). ¿Cuántos ml de pintura hay en total?',

  'story.percentageOfWhole.petshop': 'Una tienda de mascotas tiene {a} gatitos, {b} cachorros y otros animales — {c} en total. ¿Qué porcentaje son los gatitos?',
  'story.percentageOfWhole.classroom': 'Un aula tiene {a} niños, {b} niñas y profesores. Hay {c} personas en total. ¿Qué porcentaje son los niños?',
  'story.percentageOfWhole.orchard': 'Un huerto tiene {a} manzanos, {b} perales y cerezos — {c} árboles en total. ¿Qué porcentaje son manzanos?',
  'story.percentageOfWhole.aquarium': 'Un acuario tiene {a} peces dorados, {b} peces ángel y peces payaso — {c} peces en total. ¿Qué porcentaje son peces dorados?',
  'story.percentageOfWhole.market': 'Un puesto tiene {a} naranjas, {b} plátanos y mangos — {c} frutas en total. ¿Qué porcentaje son naranjas?',
  'story.percentageOfWhole.zoo': 'Una sección del zoo tiene {a} leones, {b} tigres y osos — {c} animales en total. ¿Qué porcentaje son leones?',

  'story.complexExtrapolation.space': 'En un día soleado en el espacio, si {a} exploradores necesitan {b} tanques de oxígeno, ¿cuántos necesitan {c} exploradores?',
  'story.complexExtrapolation.camping': 'Cerca de un lago, si {a} campistas necesitan {b} estacas, ¿cuántas necesitan {c} campistas?',
  'story.complexExtrapolation.baking': 'En una cocina ocupada, si {a} pasteles necesitan {b} huevos, ¿cuántos necesitan {c} pasteles?',
  'story.complexExtrapolation.travel': 'En una carretera de montaña, si {a} coches usan {b} litros, ¿cuántos usan {c} coches?',
  'story.complexExtrapolation.sports': 'Una tarde lluviosa, si {a} equipos necesitan {b} balones, ¿cuántos necesitan {c} equipos?',
  'story.complexExtrapolation.school': 'En clase de arte, si {a} estudiantes necesitan {b} pinceles, ¿cuántos necesitan {c} estudiantes?',
};

export default es;
