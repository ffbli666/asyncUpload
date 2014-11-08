# Book Example

asyncUpload
===========
jQuery plugin


兩個主要實作 `$.asyncSend` 和 `$(selector).asyncUpload`

### `$.asyncSend`
是 ajax 強化版，使用了 jQuery dererred 實現了 Ajax 上傳時回傳目前進度和 send、progreee、done、fail、abort 等事件，方便使用者客製化自己的事件

`send`：啟動上傳

`abort`：上傳中強制取消

`progress`：回傳 percentComplete 進度(%)

`done`：成功的事件

`fail`：失敗的事件

`always`：不管成功或失敗的事件

### `$(selector).asyncUpload`
將 selector 後的 html 元表轉變成 input(type=file) 按鈕，便可客制化 input(type=file) 按鈕，並利用 asyncSend 實現 ajax uplaod

`dataType`：return type 可參考 [jquery ajax dataType](http://api.jquery.com/jquery.ajax/)

`url`：上傳 url

`name`：input name

`multiple`：true or false. 是否多選 file

`preCheck`：可取得參數 files，通常用來檢查選取的 file ext or Size

`preSend`：可取得參數 file、asyncSend，用來

`allDone`：全部檔案完成事件

`someFail`：全部檔案完成，但有些失敗的事件

`accept`: filter 副檔名，可參考[HTML input accept Attribute](http://www.w3schools.com/tags/att_input_accept.asp)


## Issue
ayncUpload 建立一次只能 send or cancel 一次

## 關鍵技術
XMLHttpRequest()

jquery Deferred

## TODO
1. 利用 drag 方式上傳檔案

2. 由於 issue1 考慮 asyncUpload 內不包 asyncSend ，讓 user 自己 create asyncSend，使用上會變困難

## Reference

* http://api.jquery.com/category/deferred-object/

* https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Using_FormData_objects
