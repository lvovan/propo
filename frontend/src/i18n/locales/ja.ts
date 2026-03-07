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
  'questionType.multiItemRatio': '仕分けチャレンジ',
  'questionType.percentageOfWhole': '割合の物語',
  'questionType.complexExtrapolation': 'スケール問題',

  'story.multiItemRatio.backpack': 'リュックに青いフォルダが{a}個（各{b}g）と赤いノートが{c}冊（各{d}g）入っています。青いフォルダの総重量は？',
  'story.multiItemRatio.lunchbox': 'お弁当にりんごが{a}個（各{b}カロリー）とクッキーが{c}個（各{d}カロリー）入っています。りんごのカロリーは？',
  'story.multiItemRatio.toybox': 'おもちゃ箱に車が{a}台（各{b}円）と人形が{c}体（各{d}円）入っています。車の総額は？',
  'story.multiItemRatio.garden': '庭にバラが{a}本（各{b}cm）とひまわりが{c}本（各{d}cm）あります。バラの総高さは？',
  'story.multiItemRatio.shelf': '棚に科学の本が{a}冊（各{b}ページ）と漫画が{c}冊（各{d}ページ）あります。科学の本の総ページ数は？',
  'story.multiItemRatio.art': 'アートセットに絵の具が{a}本（各{b}ml）とのりが{c}本（各{d}ml）入っています。絵の具の総mlは？',

  'story.percentageOfWhole.petshop': 'ペットショップに子猫が{a}匹、子犬が{b}匹、その他の動物—合計{c}匹。子猫は何パーセント？',
  'story.percentageOfWhole.classroom': '教室に男の子が{a}人、女の子が{b}人、先生もいます。合計{c}人。男の子は何パーセント？',
  'story.percentageOfWhole.orchard': '果樹園にりんごの木が{a}本、梨の木が{b}本、さくらんぼの木—合計{c}本。りんごの木は何パーセント？',
  'story.percentageOfWhole.aquarium': '水族館に金魚が{a}匹、エンゼルフィッシュが{b}匹、クマノミ—合計{c}匹。金魚は何パーセント？',
  'story.percentageOfWhole.market': 'お店にオレンジが{a}個、バナナが{b}本、マンゴー—合計{c}個。オレンジは何パーセント？',
  'story.percentageOfWhole.zoo': '動物園にライオンが{a}頭、トラが{b}頭、クマ—合計{c}頭。ライオンは何パーセント？',

  'story.complexExtrapolation.space': '宇宙の晴れた日、{a}人の宇宙飛行士に酸素タンクが{b}個必要です。{c}人なら何個？',
  'story.complexExtrapolation.camping': '湖の近く、{a}人のキャンパーにペグが{b}本必要です。{c}人なら何本？',
  'story.complexExtrapolation.baking': '賀やかな台所で、{a}個のケーキに卵が{b}個必要です。{c}個なら何個？',
  'story.complexExtrapolation.travel': '山道で、{a}台の車に燃料が{b}リットル必要です。{c}台なら何リットル？',
  'story.complexExtrapolation.sports': '雨の午後、{a}チームにボールが{b}個必要です。{c}チームなら何個？',
  'story.complexExtrapolation.school': '美術の授業で、{a}人の生徒に筆が{b}本必要です。{c}人なら何本？',
};

export default ja;
