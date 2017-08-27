# feedr2

## 私家版RSS Reader

LDRが失くなる前に動かせるようにする

#### todo

* 操作の全てをキーボードから行えるようにする
* feedリストの並び替えをできるようにする
* cssどうにかせな...
* http clientのリトライ

### keyboard short cut

* a: go to previous feed
* s: go to next feed
* j: go to next entry
* k: go to previous entry
* h: scroll down
* l: scroll up
* v: open link
* c: show article / hide article (description)
* o: show pin list
* p: to pin / remove pin
* r: update feed list
* ?: show help / hide help


### export.xmlからfeedリストをエクスポート

クローラが読み込むfeedリストはexport.xmlより単純なtsvの方が楽なので

```
$ mkdir feeds
$ perl -wnl -e '/title="(.*?)".*?xmlurl="(.*?)"/i and print qq($2\t$1)' eport.xml > feeds/feed.txt
```

### 新たに購読フィードを追加する

```
$ bin/addFeed xmlurl
```
