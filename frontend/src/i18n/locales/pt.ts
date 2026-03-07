import type { Dictionary } from '../index';

const pt: Dictionary = {
  // ── Tela de Boas-vindas / Seleção de Jogador ───────────────────

  'welcome.subtitle': 'Crie seu jogador para começar!',
  'welcome.subtitleReturning': 'Quem vai jogar hoje?',
  'welcome.storageWarning': '⚠️ O armazenamento do seu navegador não está disponível.',
  'welcome.storageWarningDetail': 'Você ainda pode jogar, mas seu perfil não será salvo para a próxima vez.',
  'welcome.evictionMessage': 'Abrimos espaço para você! {names} foi removido porque só podemos lembrar de 50 jogadores.',
  'welcome.clearError': 'Não foi possível limpar os perfis. Tente novamente.',
  'welcome.backToList': '← Voltar para a lista de jogadores',
  'welcome.dismissError': 'Fechar erro',

  // ── Criação e Gerenciamento de Jogador ─────────────────────────

  'player.nameLabel': 'Seu nome',
  'player.namePlaceholder': 'Digite seu nome...',
  'player.chooseAvatar': 'Escolha seu avatar',
  'player.letsGo': 'Vamos lá! 🚀',
  'player.overwriteConfirm': 'Já existe um jogador chamado {playerName}. Quer substituí-lo?',
  'player.goBack': 'Voltar',
  'player.replace': 'Substituir',
  'player.newPlayer': '➕ Novo jogador',
  'player.clearAll': 'Limpar todos os perfis',
  'player.charCount': '{current}/{max}',
  'player.playAs': 'Jogar como {playerName}',
  'player.avgScore': 'Média: {score}',
  'player.noScore': '—',
  'player.removePlayer': 'Remover {playerName}',
  'player.replaceDialog': 'Substituir {playerName}',

  // ── Cabeçalho ──────────────────────────────────────────────────

  'header.greeting': 'Oi, {playerName}',
  'header.switchPlayer': 'Trocar jogador',
  'header.changeLanguage': 'Mudar idioma',

  // ── Jogabilidade ───────────────────────────────────────────────

  'game.readyToPlay': 'Pronto para jogar?',
  'game.instructions': 'Responda 10 perguntas de proporções o mais rápido que puder!',
  'game.correct': 'Correto!',
  'game.incorrect': 'Não foi dessa vez!',
  'game.incorrectAnswer': 'A resposta era {answer}',
  'game.roundOf': 'Rodada {current} de {total}',
  'game.roundCompleted': 'Rodada {current} de {total} concluída',
  'game.replay': 'Replay',
  'game.replayCompleted': 'Replay {current} de {total} concluído',
  'game.scoreLabel': 'Pontos:',
  'game.practice': 'Treino',
  'game.timerDefault': '50,0s',

  // ── Entrada de Resposta ────────────────────────────────────────

  'game.answerPlaceholder': '?',
  'game.submit': 'Enviar',
  'game.go': 'Vai',

  // ── Seletor de Modo ────────────────────────────────────────────

  'mode.play': 'Jogar',
  'mode.playDescription': 'Busque a maior pontuação!',
  'mode.playAriaLabel': 'Jogar — Busque a maior pontuação!',
  'mode.improve': 'Melhorar',
  'mode.improveDescription': 'Treine suas áreas difíceis: {categories}',
  'mode.improveAriaLabel': 'Melhorar — Treine suas áreas difíceis: {categories}',
  'mode.encouragement': 'Nenhuma área difícil por enquanto — continue jogando para desbloquear o modo Melhorar!',
  'mode.groupLabel': 'Seleção de modo de jogo',

  // ── Resumo de Pontuação ────────────────────────────────────────

  'summary.gameOver': 'Fim de Jogo!',
  'summary.totalScore': 'Pontuação Total',
  'summary.correctCount': 'Você acertou {count}/{total}!',
  'summary.practiceHint': 'Continue treinando: {pairs}',
  'summary.playAgain': 'Jogar novamente',
  'summary.backToMenu': 'Voltar ao menu',
  'summary.colNumber': '#',
  'summary.colFormula': 'Fórmula',
  'summary.colAnswer': 'Resposta',
  'summary.colResult': 'Resultado',
  'summary.colTime': 'Tempo',
  'summary.colPoints': 'Pontos',

  // ── Melhores Pontuações Recentes ───────────────────────────────

  'scores.title': 'Melhores Pontuações Recentes',
  'scores.empty': 'Jogue sua primeira partida para ver suas pontuações aqui!',
  'scores.listLabel': 'Melhores pontuações recentes, da maior para a menor',
  'scores.scorePoints': '{score} pontos',
  'scores.placeScore': '{ordinal} lugar: {score} pontos',

  // ── Ordinais ───────────────────────────────────────────────────

  'ordinal.1': '1º',
  'ordinal.2': '2º',
  'ordinal.3': '3º',
  'ordinal.4': '4º',
  'ordinal.5': '5º',

  // ── Diálogos de Confirmação ────────────────────────────────────

  'dialog.removeTitle': 'Remover {playerName}?',
  'dialog.removeMessage': 'As pontuações serão perdidas.',
  'dialog.cancel': 'Cancelar',
  'dialog.remove': 'Remover',
  'dialog.removeLabel': 'Remover {playerName}',
  'dialog.clearAllTitle': 'Limpar todos os perfis?',
  'dialog.clearAllMessage': 'Isso vai apagar todos os jogadores e pontuações. Tem certeza? Não dá para desfazer!',
  'dialog.clearAllLabel': 'Limpar todos os perfis',
  'dialog.clearAll': 'Limpar todos',

  // ── Rótulos de Avatar ──────────────────────────────────────────

  'avatar.rocket': 'Foguete',
  'avatar.star': 'Estrela',
  'avatar.cat': 'Gato',
  'avatar.turtle': 'Tartaruga',
  'avatar.robot': 'Robô',
  'avatar.dinosaur': 'Dinossauro',
  'avatar.unicorn': 'Unicórnio',
  'avatar.lightning': 'Raio',

  // ── Descrições de Avatar ───────────────────────────────────────

  'avatar.rocketDesc': 'Um foguete voando',
  'avatar.starDesc': 'Uma estrela brilhante',
  'avatar.catDesc': 'Um gato simpático',
  'avatar.turtleDesc': 'Uma tartaruga sorridente',
  'avatar.robotDesc': 'Um robô fofo',
  'avatar.dinosaurDesc': 'Um dinossauro amigável',
  'avatar.unicornDesc': 'Um unicórnio mágico',
  'avatar.lightningDesc': 'Um raio',

  // ── Acessibilidade (somente leitor de tela) ────────────────────

  'a11y.gameStatus': 'Estado do jogo',
  'a11y.yourAnswer': 'Sua resposta',
  'a11y.submitAnswer': 'Enviar resposta',
  'a11y.currentAnswer': 'Resposta atual',
  'a11y.digit': 'dígito {digit}',
  'a11y.deleteDigit': 'apagar último dígito',
  'a11y.submitNumpad': 'enviar resposta',
  'a11y.chooseAvatar': 'Escolha seu avatar',
  'a11y.formulaWithAnswer': '{question}. Sua resposta foi {answer}.',
  'a11y.formulaWithoutAnswer': '{question}. Encontre o valor que falta.',

  'questionType.percentage': 'Porcentagens',
  'questionType.ratio': 'Razões',
  'questionType.fraction': 'Frações',
  'questionType.multiItemRatio': 'Desafios de classificação',
  'questionType.percentageOfWhole': 'Histórias de porcentagem',
  'questionType.complexExtrapolation': 'Problemas de escala',

  'story.multiItemRatio.backpack': 'Uma mochila tem {a} pastas azuis ({b}g cada) e {c} cadernos vermelhos ({d}g cada). Qual o peso total das pastas azuis?',
  'story.multiItemRatio.lunchbox': 'Uma lancheira tem {a} maçãs ({b} cal cada) e {c} biscoitos ({d} cal cada). Quantas calorias têm as maçãs?',
  'story.multiItemRatio.toybox': 'Uma caixa de brinquedos tem {a} carros (R${b} cada) e {c} bonecas (R${d} cada). Qual o custo total dos carros?',
  'story.multiItemRatio.garden': 'Um jardim tem {a} rosas ({b}cm cada) e {c} girassóis ({d}cm cada). Qual a altura total das rosas?',
  'story.multiItemRatio.shelf': 'Uma estante tem {a} livros de ciências ({b} páginas cada) e {c} quadrinhos ({d} páginas cada). Quantas páginas têm os livros de ciências?',
  'story.multiItemRatio.art': 'Um kit de arte tem {a} tubos de tinta ({b}ml cada) e {c} bastoes de cola ({d}ml cada). Quantos ml de tinta no total?',

  'story.percentageOfWhole.petshop': 'Uma pet shop tem {a} gatinhos, {b} filhotes e outros animais — {c} no total. Qual a porcentagem de gatinhos?',
  'story.percentageOfWhole.classroom': 'Uma sala tem {a} meninos, {b} meninas e professores. São {c} pessoas no total. Qual a porcentagem de meninos?',
  'story.percentageOfWhole.orchard': 'Um pomar tem {a} macieiras, {b} pereiras e cerejeiras — {c} árvores no total. Qual a porcentagem de macieiras?',
  'story.percentageOfWhole.aquarium': 'Um aquário tem {a} peixinhos dourados, {b} acaras e palhaços — {c} peixes no total. Qual a porcentagem de dourados?',
  'story.percentageOfWhole.market': 'Uma barraca tem {a} laranjas, {b} bananas e mangas — {c} frutas no total. Qual a porcentagem de laranjas?',
  'story.percentageOfWhole.zoo': 'Uma ala do zoo tem {a} leões, {b} tigres e ursos — {c} animais no total. Qual a porcentagem de leões?',

  'story.complexExtrapolation.space': 'Num dia ensolarado no espaço, se {a} exploradores precisam de {b} tanques de oxigênio, quantos precisam {c} exploradores?',
  'story.complexExtrapolation.camping': 'Perto de um lago, se {a} campistas precisam de {b} estacas, quantas precisam {c} campistas?',
  'story.complexExtrapolation.baking': 'Numa cozinha movimentada, se {a} bolos precisam de {b} ovos, quantos precisam {c} bolos?',
  'story.complexExtrapolation.travel': 'Numa estrada de montanha, se {a} carros usam {b} litros, quantos usam {c} carros?',
  'story.complexExtrapolation.sports': 'Numa tarde chuvosa, se {a} times precisam de {b} bolas, quantas precisam {c} times?',
  'story.complexExtrapolation.school': 'Na aula de arte, se {a} alunos precisam de {b} pincéis, quantos precisam {c} alunos?',
} as const;

export default pt;
