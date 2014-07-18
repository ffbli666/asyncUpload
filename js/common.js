/**
 * 
 * 
 *
 */



(function($) {
    $.asyncSend = function (options) {
        var dfd = $.Deferred();     
        var send_xhr = {};
        var xhr = function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener('progress', function(evt) {             
                var percentComplete = (evt.loaded / evt.total) * 100;
                dfd.notify(percentComplete);
            }, false);
            return xhr;
        };

        var options = $.extend({
            xhr:xhr,
            type: 'POST',
            dataType: 'json',
            cache: false,
            processData: false,
            contentType: false,
            url: undefined,
            data: undefined
        }, options);
        
        if (options.url == undefined || options.data == undefined) {
            console.log('need url or data');
            return false;
        }

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
        progressObject: function() {
            var self = this;
            var item = self.find('[var=item_template]')
            self.empty();
            var fileProgress = function (file) {
                var file = file;
                var new_item = item.clone();                   
                new_item.find('[var=filename]').html(file.name);
                self.append(new_item);
                var progress = function (percentComplete) {                               
                    new_item.find('[var=progress-bar]').css('width', percentComplete + '%');
                    new_item.find('[var=progress-value]').html(parseInt(percentComplete) + '%');
                };
                var done = function(response) {
                    new_item.find('[var=cancel]').off('click').html('Completed');
                };
                var fail = function(response, status, error) {  

                };
                var always = function(always) {

                };
                var setCancel = function (asyncSend) {                  
                    new_item.find('[var=cancel]').on('click', function() {
                        asyncSend.abort();
                        new_item.find('[var=cancel]').html("Canceled");
                        new_item.find('[var=progress-bar]').css('width', '0%');
                        new_item.find('[var=progress-value]').html('');
                    });
                };
                return {
                    file : file,
                    progress : progress,
                    setCancel : setCancel,
                    done : done,
                    fail : progress,
                    always : always
                };
            }


            return {    
                fileProgress : fileProgress,                            
            };
        },  

        asyncUpload: function(options) {
            var self = this;            
            var options = $.extend({
                url: undefined,
                name: self.attr('name'),
                multiple: (self.attr('multiple') == 'multiple') ? true : false,
                preCheck: function (files) { return true; },
                //preSend: function (file) {},
                progress: function (percentComplete) { console.log('[upload] default progress. ' + percentComplete + '%'); },
                done: function (response){ console.log('[upload] Need implement done'); },
                fail: function (response, status, error){ console.log('[upload] Need implement fail. status: ' + status + ', error: ' + error); },
                abort: function(asyncSend) { console.log('[upload abort]') },
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

            if (options.progressObject != undefined)
            {
                //options.preCheck = options.progressObject.preCheck;
                //options.progress = options.progressObject.progress;
                //options.preSend = options.progressObject.preSend;
            }

            self_input.on('change', {}, function(evt) { 
                evt.preventDefault();

                if (!options.preCheck.call(self, self_input[0].files)) {
                    console.log("[upload] preCheck error");
                    return; 
                }                               
                var up;
                for(var i=0; i<self_input[0].files.length; i++) {
                    //pre send
                    //options.preSend.call(self, self_input[0].files[i]);
                    var fileProgress = options.progressObject.fileProgress(self_input[0].files[i]);
                    console.log(fileProgress);
                    //create fomedata
                    var formdata = new FormData();                  
                    formdata.append(options.name, self_input[0].files[i]);
                    //init asyncSend
                    var asyncSend = $.asyncSend({
                        url: options.url,
                        data: formdata
                    });
                    //register asyncSend event
                    asyncSend.getDeferred()
                    .progress(fileProgress.progress)
                    .done(fileProgress.done)
                    .fail(fileProgress.fail)
                    .always(fileProgress.always)


                    //triggle upload                    
                    asyncSend.send();
                    //options.abort.call(self, asyncSend);
                    //options.progressObject.setCancel.call(self, asyncSend);
                    fileProgress.setCancel.call(self, asyncSend);
                }
                self_input[0].value = '';
            });
            return this;
        }
    });
})(jQuery)