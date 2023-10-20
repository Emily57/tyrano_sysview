[cm]

[layopt layer="message1" visible="true" width="1000" color=white left=50 top=400 size=24]
[current layer="message1"]
[nowait]
どのセーブ画面を使うか設定を切り替えできます。[r]
とりあえず触ってみよう。[r]
[endnowait]

*select_menu
[button graphic="save_btn.png" role="save" width="100" x=150 y=150]
[button graphic="save_default_btn.png" target="*save_default" width="100" x=250 y=150]
[button graphic="save_switch_btn.png" target="*save_remake" width="100" x=250 y=220]
[s]

*save_default
  [sysview type=save storage="tyrano/html/save.html"]
  [er]
  [nowait]
  デフォセーブに切り替えたよ！
  [endnowait]
  [jump target="*select_menu"]
  [s]

*save_remake
  [sysview type=save storage="data/others/plugin/save_remake.html"]
  [er]
  [nowait]
  リメイクセーブに切り替えたよ！
  [endnowait]
  [jump target="*select_menu"]
  [s]
