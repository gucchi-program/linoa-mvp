/**
 * Linoa 架電リスト自動セットアップスクリプト
 * Google Apps Script エディタに貼り付けて実行する
 */
function createCallList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // シートを作成（既存があればリセット）
  // 前回の実行が途中で止まった場合、シートIDが壊れていることがあるためtry-catchで対処
  let sheet = ss.getSheetByName('架電リスト');
  if (sheet) {
    try {
      ss.deleteSheet(sheet);
    } catch(e) {
      // IDが壊れている場合は名前で再取得して削除を試みる
      const sheets = ss.getSheets();
      const stale = sheets.find(s => s.getName() === '架電リスト');
      if (stale) ss.deleteSheet(stale);
    }
  }
  sheet = ss.insertSheet('架電リスト');

  // ============================
  // ヘッダー定義
  // ============================
  const headers = [
    'No.',
    '店舗名',
    'エリア',
    '電話番号',
    '業種',
    '架電担当',
    '初回架電日',
    'ステータス',
    '次回アクション日',
    'メモ',
  ];

  // ============================
  // ヘッダー書き込み
  // ============================
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // ============================
  // ヘッダースタイル
  // ============================
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // ============================
  // 列幅調整
  // ============================
  const colWidths = [50, 180, 100, 130, 100, 100, 120, 120, 140, 300];
  colWidths.forEach((width, i) => {
    sheet.setColumnWidth(i + 1, width);
  });

  // ============================
  // ステータスのドロップダウン（H列: 2行目以降）
  // ============================
  const statusList = ['未架電', '架電済', '折り返し待ち', '商談中', '成約', 'NG'];
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusList, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 8, 200, 1).setDataValidation(statusRule);

  // ============================
  // ステータス別の条件付き書式
  // ============================
  const statusColors = {
    '未架電':       { bg: '#f8f9fa', font: '#5f6368' },
    '架電済':       { bg: '#e8f0fe', font: '#1a73e8' },
    '折り返し待ち': { bg: '#fef7e0', font: '#f29900' },
    '商談中':       { bg: '#e6f4ea', font: '#188038' },
    '成約':         { bg: '#34a853', font: '#ffffff' },
    'NG':           { bg: '#fce8e6', font: '#c5221f' },
  };

  // ルールをまとめて作成してから一度だけ適用（個別適用だとタイムアウトする）
  const cfRules = Object.entries(statusColors).map(([status, color]) =>
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(status)
      .setBackground(color.bg)
      .setFontColor(color.font)
      .setRanges([sheet.getRange(2, 8, 200, 1)])
      .build()
  );
  sheet.setConditionalFormatRules(cfRules);

  // ============================
  // 業種のドロップダウン（E列: 2行目以降）
  // ============================
  const categoryList = ['居酒屋', 'ラーメン', 'カフェ', '焼肉', '寿司', 'イタリアン', '中華', 'その他'];
  const categoryRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(categoryList, true)
    .setAllowInvalid(true) // 自由入力も許可
    .build();
  sheet.getRange(2, 5, 200, 1).setDataValidation(categoryRule);

  // ============================
  // 日付列のフォーマット（G列・I列）
  // ============================
  sheet.getRange(2, 7, 200, 1).setNumberFormat('yyyy/MM/dd');
  sheet.getRange(2, 9, 200, 1).setNumberFormat('yyyy/MM/dd');

  // ============================
  // No.列を自動連番（A列）- 配列で一括セット（個別setFormulaはタイムアウトの原因）
  // ============================
  const noFormulas = Array.from({ length: 200 }, (_, i) => [`=IF(B${i + 2}<>"", ${i + 1}, "")`]);
  sheet.getRange(2, 1, 200, 1).setFormulas(noFormulas).setHorizontalAlignment('center').setFontColor('#9aa0a6');

  // ============================
  // 1行目を固定
  // ============================
  sheet.setFrozenRows(1);

  // ============================
  // 交互行カラー（デフォルト）
  // ============================
  const banding = sheet.getRange(1, 1, 201, headers.length).applyRowBanding();
  banding
    .setHeaderRowColor('#1a73e8')
    .setFirstRowColor('#ffffff')
    .setSecondRowColor('#f8f9fa');

  // ============================
  // サマリーシートを作成
  // ============================
  let summarySheet = ss.getSheetByName('サマリー');
  if (summarySheet) ss.deleteSheet(summarySheet);
  summarySheet = ss.insertSheet('サマリー');

  summarySheet.getRange('A1').setValue('架電リスト サマリー');
  summarySheet.getRange('A1').setFontSize(14).setFontWeight('bold');

  const summaryData = [
    ['ステータス', '件数'],
    ['総件数',         `=COUNTA(架電リスト!B2:B)`],
    ['未架電',         `=COUNTIF(架電リスト!H2:H,"未架電")`],
    ['架電済',         `=COUNTIF(架電リスト!H2:H,"架電済")`],
    ['折り返し待ち',   `=COUNTIF(架電リスト!H2:H,"折り返し待ち")`],
    ['商談中',         `=COUNTIF(架電リスト!H2:H,"商談中")`],
    ['成約',           `=COUNTIF(架電リスト!H2:H,"成約")`],
    ['NG',             `=COUNTIF(架電リスト!H2:H,"NG")`],
  ];
  summarySheet.getRange(3, 1, summaryData.length, 2).setValues(summaryData);
  summarySheet.getRange(3, 1, 1, 2).setFontWeight('bold').setBackground('#1a73e8').setFontColor('#ffffff');
  summarySheet.setColumnWidth(1, 150);
  summarySheet.setColumnWidth(2, 80);

  // ============================
  // 架電リストをアクティブに
  // ============================
  ss.setActiveSheet(sheet);

  SpreadsheetApp.getUi().alert('✅ 架電リストのセットアップが完了しました！');
}
