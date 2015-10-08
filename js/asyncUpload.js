/**
 * 
 * 
 *  Zong-Ying Lyu : ffbli666@gmail.com
 */



(function($) {
    $.asyncSend = function (options) {
        var self = this;
        var dfd = $.Deferred();
        var send_xhr = {};

        var settings = $.extend({
            type: 'POST',
            dataType: 'json',
            cache: false,
            processData: false,
            contentType: false,
            url: undefined,
            data: undefined
        }, options);

        if (settings.url === undefined || settings.data === undefined) {
            console.log('need url or data');
            return false;
        }

        settings.xhr = function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener('progress', function(evt) {
                var percentComplete = (evt.loaded / evt.total) * 100;
                dfd.notify(percentComplete);
            }, false);
            return xhr;
        };

        var send = function() {
            send_xhr = $.ajax(settings);
            send_xhr.pipe(function(response) {
                return response;
            })
            .fail(function(xhr, status, error) {
                dfd.reject(xhr, status, error);
            })
            .done(function(response) {
                dfd.resolve(response);
            });
            return send_xhr;
        };

        var getDeferred = function() {
            return dfd.promise();
        };

        var abort = function() {
            if (send_xhr && send_xhr.readystate != 4) {
                send_xhr.abort();
            }           
        };

        return {
            getDeferred: getDeferred,
            send: send,
            abort: abort
        };
    };  

    $.fn.extend({     
        asyncUpload: function(options) {
            var self = this;
            var self_input;
            var settings = $.extend( {
                dataType: 'json',
                url: undefined,
                name: self.attr('name'),
                multiple: (self.attr('multiple') == 'multiple') ? true : false,
                accept: undefined,
                manual: false,
                preCheck: function (files) { return true; },
                preSend: function (file, asyncSend) { return true;},
                allDone: function () {},
                someFail: function () {}
            }, options);
            
            if (settings.url === undefined) {
                console.log('need url');
                return false;
            }
            
            if (self.is('input')) {
                self_input = self;
            }
            else {
                var new_input = document.createElement('input');
                new_input.setAttribute('type','file');
                self_input = $(new_input);
                //
                // ie & safari hack
                //
                new_input.setAttribute('style','width:0px; height:0px');
                $('body').append(self_input);
                
                self.on('click', function(evt) {
                    self_input.trigger('click');
                });
            }

            //multiple
            if (settings.multiple) {
                if (self_input.attr('multiple') != 'multiple') {
                    self_input.attr('multiple', 'multiple');
                }
            }

            if (settings.accept) {
                if (self_input.attr('accept') !== '') {
                    self_input.attr('accept', settings.accept);
                }
            }

            self_input.on('change', {}, function(evt) { 
                
                evt.preventDefault();

                if (!settings.preCheck.call(self, self_input[0].files)) {
                    return; 
                }                               
                var i;
                var asyncSends = [];
                var file_counts = self_input[0].files.length;
                for(i=0; i<file_counts; i++) {
                    //create fomedata
                    var formdata = new FormData();
                    formdata.append(settings.name, self_input[0].files[i]);
                    
                    //init asyncSend
                    var asyncSend = new $.asyncSend({
                        dataType: settings.dataType,
                        url: settings.url,
                        data: formdata,
                        file: self_input[0].files[i],
                    });

                    if (!settings.preSend.call(self, self_input[0].files[i], asyncSend)) {
                        continue;
                    }
                    if (!settings.manual) {
                        asyncSend.send();
                    }
                    asyncSends.push(asyncSend.getDeferred());
                }
                
                $.when.apply($, asyncSends).then(settings.allDone, settings.someFail);
                self_input[0].value = '';
            });
            return this;
        }
    });
})(jQuery);