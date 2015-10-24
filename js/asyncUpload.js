'use strict';
var DefaultFileUpload = function(customize) {
    return {
        check: function (file) {return true},
        progress: function (e) {},
        success: function (response) {},
        error: function (e) {}
    };
};

var AsyncSend = function (url, file, FileUpload) {
    if (!url) {
        throw new Error('Need url!');
    }

    if (!file) {
        throw new Error('Need file!');
    }
    var FUpolod = FileUpload || DefaultFileUpload;
    var formData = new FormData();
    formData.append(file.name, file);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    var send = function() {
        xhr.send(formData);
    };

    var abort = function() {
        xhr.abort();
    };
    //need use let, but firefox not support
    var object = {
        xhr: xhr,
        file: file,
        url: url,
        send: send,
        abort: abort
    };

    var fileUpload = new FUpolod();
    if (typeof fileUpload.check === 'function') {
        if (!fileUpload.check.call(object, file)) {
            return undefined;
        }
    }

    if (typeof fileUpload.progress === 'function') {
        xhr.upload.onprogress = fileUpload.progress.bind(object);
    }

    if (typeof fileUpload.success === 'function') {
        xhr.onload = function() {
            if (this.readyState == 4 && this.status == 200) {
                fileUpload.success.call(object, xhr.response);
            }
        };
    }

    if (typeof fileUpload.error === 'function') {
        xhr.onerror = fileUpload.error.bind(object);
    }

    return {
        send: send,
        abort: abort
    };
};

var AsyncUpload = function (selector, options) {
    var elements = document.querySelectorAll(selector);
    if (elements.length == 0) {
        throw new Error('Can not select any element');
    }

    var settings = {
        url: options.url || undefined,
        accept: options.accept || undefined,
        multiple: options.multiple || false,
        manualSend: options.manualSend || false,
        FileUpload: options.FileUpload || DefaultFileUpload,
    };

    if (!options.url) {
        throw new Error('Need url!');
    }

    var asList = [];
    for(var i=0; i<elements.length; i++) {
        var element = elements[i];
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        element.onclick = function() {
            input.click();
        };
        element.input = input;

        if (settings.multiple) {
            input.multiple = 'multiple';
        }
        if (settings.accept) {
            input.accept = settings.accept;
        }
        input.onchange = function () {
            for (var j=0; j<input.files.length; j++) {
                var asyncSend = AsyncSend(settings.url, input.files[j], settings.FileUpload);
                asList.push(asyncSend);
                if (!settings.manualSend) {
                    asyncSend.send();
                }
            };
        };
    }

    // var send = function () {
    //     asList.forEach(function (asyncSend) {
    //         asyncSend.send();
    //     });
    // };

    // var abort = function () {
    //     asList.forEach(function (asyncSend) {
    //         asyncSend.abort();
    //     });
    // };

    // return {
    //     send: send,
    //     abort: abort
    // };
};