/**
 * 
 * 
 *
 */



(function($) {
    $.asyncSend = function (options) {
        var self = this;
        var dfd = $.Deferred();     
        var send_xhr = {};
        var file;

        var options = $.extend({
            type: 'POST',
            dataType: 'json',
            cache: false,
            processData: false,
            contentType: false,
            url: undefined,
            data: undefined
        }, options);

        //console.log(options);
        if (options.url == undefined || options.data == undefined) {
            console.log('need url or data');
            return false;
        }

        options.xhr = function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener('progress', function(evt) {             
                var percentComplete = (evt.loaded / evt.total) * 100;
                dfd.notify(percentComplete);
            }, false);
            return xhr;
        };

        var send = function() {             
            send_xhr = $.ajax(options);
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
            var options = $.extend({
                url: undefined,
                name: self.attr('name'),
                multiple: (self.attr('multiple') == 'multiple') ? true : false,
                preCheck: function (files) { return true; },
                preSend: function (file) { return true; },
                progress: function (file, percentComplete) {},
                done: function (response) {},
                fail: function (response, status, error) {},
                abort: function(asyncSend) {},
                always: function () {},
                progressObject: undefined
            }, options);
            
            
            if (options.url == undefined) {
                console.log('need url');
                return false;
            }
            
            var self_input = undefined;         

            if (!self.is('input')) {
                var new_input = document.createElement('input')                             
                new_input.setAttribute('type','file');                  
                self_input = $(new_input);
                self.on('click', function(evt){
                    self_input.trigger('click');
                })
            }
            else {
                self_input = self;
            }           

            //multiple
            if (options.multiple) {
                if (self_input.attr('multiple') != 'multiple') {
                    self_input.attr('multiple', 'multiple');
                }
            }

            self_input.on('change', {}, function(evt) { 
                evt.preventDefault();

                if (!options.preCheck.call(self, self_input[0].files)) {                        
                    return; 
                }                               

                for(var i=0; i<self_input[0].files.length; i++) {
                    //create fomedata
                    var formdata = new FormData();                  
                    formdata.append(options.name, self_input[0].files[i]);
                    //init asyncSend
                    var asyncSend = new $.asyncSend({
                        url: options.url,
                        data: formdata,
                        file: self_input[0].files[i],
                    });

                    if (!options.preSend.call(self, self_input[0].files[i], asyncSend)) {
                        continue;
                    } 
                }
                self_input[0].value = '';
            });
            return this;
        }
    });
})(jQuery)