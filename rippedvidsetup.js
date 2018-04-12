$(document).ready(function () {
            $("#centerDivVideo").allofthelights({
                'opacity': '0.95',
                'clickable_bg': 'true',
                'callback_turn_off': function() {
                    $('.allofthelights_bg').hide().show(0);
                    $('#switch').hide();
                },
                'callback_turn_on': function() {
                    $('#switch').show();
                }
            });

            
            setTimeout('ReloadIfNeed()', 10000);
            
        });


        $('#selectEpisode').change(function () {
            location.href = 'http://localhost:3000/Anime/Shirobako/' + $(this).val();
        });

        var myPlayer = videojs('my_video_1');
        var savedTime = 0;

        myPlayer.ready(function(){
            this.hotkeys({
                volumeStep: 0.1,
                seekStep: 3,
                enableMute: true,
                enableFullscreen: true,
                enableNumbers: true
              });

            this.progressTips();
        });

        var errorCount = 0;
        var ieMessageAlert = false;

        myPlayer.on('error', function(e){
            try
            {
                console.log('My player threw an error lmao '+errorCount)
                //e.stopImmediatePropogation();
                var tempVar = ovelWrap($('#slcQualix').val());
                console.log(tempVar)
                var currTime = myPlayer.currentTime();

                errorCount++;

                $('#divMessageRetry').html('Retrying ' + errorCount + "/150. Please wait...");
                $('#divMessageRetry').show();

                if (errorCount == 800 && isIE())
                {
                    ieMessageAlert = true;
                    $('#slcQualix').change();
                }

                if (
                        (errorCount == 1000 && !isIE())
                        ||
                        (errorCount == 150 && currTime == 0)
                    )
                {
                    $.ajax(
                        {
                            type: "POST",
                            url: "/External/RPBX",
                            data: "urlRP=" + encodeURIComponent(tempVar) + "&fn=" + encodeURIComponent("") + "&rawUrl=" + encodeURIComponent(window.location.href),
                            success: function (message) {
                                
                            }
                        });
                        
                        if (window.location.href.indexOf("pfail") < 0)
                        {
                            location.href = window.location.href + "&pfail=1";
                            return;
                        }

                        $('#centerDivVideo').html('<div class="clsTempMSg"><div class="clear2"></div><div class="clear2"></div><div style="font-size: 16px; font-weight: bold; text-align:center">Could not load the video, please try again or change server.</div></div>');
                        return;
                }
                console.log(tempVar)
                myPlayer.src({ type: "video/mp4", src: tempVar });

                if (currTime != 0) {
                    myPlayer.currentTime(currTime);
                } else {
                    myPlayer.currentTime(savedTime);
                }

                myPlayer.play();
                           
            }
            catch(err) {}
        });

        // ios
        var bufferFailedCnt = 0;
        var prevCurrentTime = 0;
        var needToSkip = false;
        var skipTo = 0;
        var video = document.getElementById('my_video_1_html5_api');

        var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (iOS) {
            video.addEventListener('loadedmetadata', function () {
                setTimeout(checkBuffered, 15000);
            });

            video.addEventListener('playing', function () {
                if (needToSkip) {
                    video.currentTime = skipTo;
                    needToSkip = false;
                }
            });
        }

        function checkBuffered() {
            try {
                if (!video.paused) {
                    var currTime = video.currentTime;
                    if (prevCurrentTime != currTime) {
                        prevCurrentTime = currTime;
                        bufferFailedCnt = 0;
                    } else if (currTime < video.duration) {
                        throw 'buffer failed';
                    }
                }
            } catch (ex) {
                if (!video.paused) {
                    bufferFailedCnt++;
                    if (bufferFailedCnt >= 5) {
                        bufferFailedCnt = -10;
                        try {
                                var currTime = video.currentTime;
                                video.load();
                                if (currTime != 0) {
                                    skipTo = currTime;
                                } else {
                                    skipTo = savedTime;
                                }

                                needToSkip = true;
                                return;
                        } catch (ex) { }
                    }
                }
            }

            setTimeout(checkBuffered, 1000);
        }
        // end ios

        
        // volume
        myPlayer.on('volumechange', function(){
            SetCookie('videojsVolume', myPlayer.volume(), 365);
        })

        
        // end volume

        var changeQualityTimer = 0;
        $('#slcQualix').change(function(){       
            $('.clsTempMSg').remove();

            var tempVar = ovelWrap($(this).val());

            if (ieMessageAlert)
            {
                $('#centerDivVideo').html('<div class="clsTempMSg"><div class="clear2"></div><div class="clear2"></div><div style="font-size: 16px; font-weight: bold; text-align:center">HTML5 player does not work on Internet Explorer. Please use FLASH player or<br> <a href="' + tempVar + '"> CLICK HERE (' + $('#slcQualix option:selected').text() + ')</a> to use your device\'s player</div></div>');
            }
            else
            {
                if (tempVar.indexOf("video.googleusercontent.com") > 0)
                {
                    $('#centerDivVideo').after('<div class="clsTempMSg"><div class="clear2"></div><div class="clear2"></div><div style="font-size: 14px; font-weight: bold; color:red">This video is broken and could not be fast forwarded, we will fix it soon.</div></div>'); 
                }
                else
                {
                
                    
                }

                SetPlayer(tempVar);
                changeQualityTimer++;    
            }
        });
        $('#slcQualix').change();                                                             

        var whereYouAt = 0;
        function SetPlayer(code){                                               
            whereYouAt = myPlayer.currentTime();            
            myPlayer.src({ type: "video/mp4", src: code });           

            $('#my_video_1').focus();

            if (changeQualityTimer > 0)
            {
                myPlayer.play();

                myPlayer.on("loadedmetadata", function(){                        
                    myPlayer.currentTime(whereYouAt);                                                    
                });
            }
            else
            {
                window.scrollTo(0, 0);
            }
            
            
            if (document.cookie.indexOf("videojsVolume") > 0)
            {
                myPlayer.volume(GetCookie('videojsVolume'));
            }
        }

        setInterval(function() { DoSaveTime(); }, 3000);
        function DoSaveTime() {
            savedTime = myPlayer.currentTime();
            $('#divMessageRetry').hide();
        }


        // firefox fix
        $('#my_video_1').focusout(function() {
            $(this).css("outline", "0px");
        });

        $('#my_video_1').focus(function() {
            $(this).css("outline", "#333333 solid 1px");
        });

        function SetCookie(cookieName,cookieValue,nDays) {
             var today = new Date();
             var expire = new Date();
             if (nDays==null || nDays==0) nDays=1;
             expire.setTime(today.getTime() + 3600000*24*nDays);
             document.cookie = cookieName+"="+escape(cookieValue)
                             + ";expires="+expire.toGMTString() + ';path=/';
        }

        function GetCookie(name) {
          var value = "; " + document.cookie;
          var parts = value.split("; " + name + "=");
          if (parts.length == 2) return parts.pop().split(";").shift();
        }

        function isIE() {
            var ua = window.navigator.userAgent;
            
            var msie = ua.indexOf("MSIE ");
            var edge = ua.indexOf("Edge/");
            var baidu = ua.indexOf("baidubrowser");
            
            if (msie > 0 || edge > 0 || baidu > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
                return true;
            else                 // If another browser, return 0
                return false;
        }