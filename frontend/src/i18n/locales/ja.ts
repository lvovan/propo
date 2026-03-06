import type { Dictionary } from '../index';

const ja: Dictionary = {
  // ── ようこそ画面 / プレイヤー選択 ─────────────────────────────
  'welcome.subtitle': 'プレイヤーを作って始めよう！',
  'welcome.subtitleReturning': '今日はだれが遊ぶ？',
  'welcome.storageWarning': '⚠️ ブラウザのストレージが使えません。',
  'welcome.storageWarningDetail': '遊ぶことはできますが、プロフィールは保存されません。',
  'welcome.evictionMessage': '場所を空けました！{names} は50人までしか覚えられないので削除されました。',
  'welcome.clearError': 'プロフィールの削除に失敗しました。もう一度試してください。',
  'welcome.backToList': '← プレイヤー一覧に戻る',
  'welcome.dismissError': 'エラーを閉じる',

  // ── プレイヤーの作成と管理 ────────────────────────────────────
  'player.nameLabel': 'なまえ',
  'player.namePlaceholder': 'なまえを入力...',
  'player.chooseAvatar': 'アバターを選ぼう',
  'player.letsGo': 'スタート！🚀',
  'player.overwriteConfirm': '{playerName} というプレイヤーがすでにいます。置き換えますか？',
  'player.goBack': '戻る',
  'player.replace': '置き換える',
  'player.newPlayer': '➕ 新しいプレイヤー',
  'player.clearAll': 'すべてのプロフィールを消す',
  'player.charCount': '{current}/{max}',
  'player.playAs': '{playerName} で遊ぶ',
  'player.avgScore': '平均: {score}',
  'player.noScore': '—',
  'player.removePlayer': '{playerName} を削除',
  'player.replaceDialog': '{playerName} を置き換える',

  // ── ヘッダー ──────────────────────────────────────────────────
  'header.greeting': 'やあ、{playerName}',
  'header.switchPlayer': 'プレイヤーを変える',
  'header.changeLanguage': '言語を変更',

  // ── ゲームプレイ ──────────────────────────────────────────────
  'game.readyToPlay': '準備はいい？',
  'game.instructions': '割合の問題10問にできるだけ速く答えよう！',
  'game.correct': '正解！',
  'game.incorrect': 'おしい！',
  'game.incorrectAnswer': '答えは {answer} でした',
  'game.roundOf': 'ラウンド {current} / {total}',
  'game.roundCompleted': 'ラウンド {current} / {total} 完了',
  'game.replay': 'リプレイ',
  'game.replayCompleted': 'リプレイ {current} / {total} 完了',
  'game.scoreLabel': 'スコア:',
  'game.practice': '練習',
  'game.timerDefault': '50.0秒',

  // ── 回答入力 ──────────────────────────────────────────────────
  'game.answerPlaceholder': '?',
  'game.submit': '送信',
  'game.go': 'Go',

  // ── モード選択 ────────────────────────────────────────────────
  'mode.play': 'プレイ',
  'mode.playDescription': 'ハイスコアを目指そう！',
  'mode.playAriaLabel': 'プレイ — ハイスコアを目指そう！',
  'mode.improve': 'トレーニング',
  'mode.improveDescription': '苦手な分野を練習しよう: {categories}',
  'mode.improveAriaLabel': 'トレーニング — 苦手な分野を練習しよう: {categories}',
  'mode.encouragement': '苦手な分野はないよ — 遊び続けてトレーニングモードを解放しよう！',
  'mode.groupLabel': 'ゲームモードの選択',

  // ── スコアまとめ ──────────────────────────────────────────────
  'summary.gameOver': 'ゲーム終了！',
  'summary.totalScore': '合計スコア',
  'summary.correctCount': '{count}/{total} 問正解！',
  'summary.practiceHint': '練習しよう: {pairs}',
  'summary.playAgain': 'もう一度遊ぶ',
  'summary.backToMenu': 'メニューに戻る',
  'summary.colNumber': '#',
  'summary.colFormula': '式',
  'summary.colAnswer': '答え',
  'summary.colResult': '結果',
  'summary.colTime': '時間',
  'summary.colPoints': 'ポイント',

  // ── 最近のハイスコア ──────────────────────────────────────────
  'scores.title': '最近のハイスコア',
  'scores.empty': '最初のゲームを遊んでスコアを見よう！',
  'scores.listLabel': '最近のハイスコア、高い順',
  'scores.scorePoints': '{score} ポイント',
  'scores.placeScore': '{ordinal}: {score} ポイント',

  // ── 序数 ──────────────────────────────────────────────────────
  'ordinal.1': '1位',
  'ordinal.2': '2位',
  'ordinal.3': '3位',
  'ordinal.4': '4位',
  'ordinal.5': '5位',

  // ── 確認ダイアログ ────────────────────────────────────────────
  'dialog.removeTitle': '{playerName} を削除しますか？',
  'dialog.removeMessage': 'スコアは失われます。',
  'dialog.cancel': 'キャンセル',
  'dialog.remove': '削除',
  'dialog.removeLabel': '{playerName} を削除',
  'dialog.clearAllTitle': 'すべてのプロフィールを消しますか？',
  'dialog.clearAllMessage': 'すべてのプレイヤーとスコアが削除されます。本当にいいですか？元に戻せません！',
  'dialog.clearAllLabel': 'すべてのプロフィールを消す',
  'dialog.clearAll': 'すべて消す',

  // ── アバター ──────────────────────────────────────────────────
  'avatar.rocket': 'ロケット',
  'avatar.star': '星',
  'avatar.cat': 'ネコ',
  'avatar.turtle': 'カメ',
  'avatar.robot': 'ロボット',
  'avatar.dinosaur': 'きょうりゅう',
  'avatar.unicorn': 'ユニコーン',
  'avatar.lightning': 'いなずま',

  'avatar.rocketDesc': '飛んでいるロケット',
  'avatar.starDesc': 'キラキラ輝く星',
  'avatar.catDesc': 'なかよしのネコ',
  'avatar.turtleDesc': 'にこにこカメ',
  'avatar.robotDesc': 'かわいいロボット',
  'avatar.dinosaurDesc': 'なかよしきょうりゅう',
  'avatar.unicornDesc': '魔法のユニコーン',
  'avatar.lightningDesc': 'いなずま',

  // ── アクセシビリティ ──────────────────────────────────────────
  'a11y.gameStatus': 'ゲームの状態',
  'a11y.yourAnswer': 'あなたの答え',
  'a11y.submitAnswer': '答えを送信',
  'a11y.currentAnswer': '現在の答え',
  'a11y.digit': '数字 {digit}',
  'a11y.deleteDigit': '最後の数字を消す',
  'a11y.submitNumpad': '答えを送信',
  'a11y.chooseAvatar': 'アバターを選ぼう',
  'a11y.formulaWithAnswer': '{question}。あなたの答えは {answer} でした。',
  'a11y.formulaWithoutAnswer': '{question}。かくれた値を見つけよう。',

  'questionType.percentage': 'パーセント',
  'questionType.ratio': '比',
  'questionType.fraction': '分数',
  'questionType.ruleOfThree': '文章題',

  'ruleOfThree.shopping': '{a} 個のおもちゃが {b} 円なら、{c} 個はいくら？',
  'ruleOfThree.reading': '{a} ページを {b} 分で読むなら、{c} ページは何分？',
  'ruleOfThree.cooking': '{a} 人分のレシピに卵が {b} 個必要です。{c} 人分なら？',
  'ruleOfThree.travel': '{a} km に {b} リットル使う車。{c} km なら何リットル？',
  'ruleOfThree.art': '{a} 枚の絵に鉛筆が {b} 本必要。{c} 枚なら何本？',
  'ruleOfThree.sports': '{a} 試合で {b} ゴール決めた。{c} 試合なら何ゴール？',
};

export default ja;
