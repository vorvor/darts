(function ($, Drupal, cookies) {
  Drupal.behaviors.dartsCounterBehavior = {

    attach: function(context, settings) {

      var undodata = [];

        function setCurrentUser() {

          $.ajax
            ({ 
              url: '/darts/currentuser',
              type: 'post',
              success: function(result)  {
                Cookies.set('uid', result);
                setGameId(result);
              }
            });

        }

        function setGameId(uid) {

          $.ajax
            ({ 
              url: '/darts/getgameid/' + uid,
              type: 'post',
              success: function(result)  {
                if ($.isEmptyObject(result)) {
                  result = 1;
                }

                Cookies.set('gameid', result * 1 + 1);
              }
            });

        }

        function write(data) {
          $.ajax
            ({ 
              url: '/darts/write/' + $('#player').html() + '/' + data + ':' + getDate(),
              type: 'post',
              success: function(result)  {

              }
            });
        }

        function writedb(score) {
          $.ajax
            ({ 
              url: '/darts/writedb/' + Cookies.get('uid') + '/' + Cookies.get('gameid') + '/' + score,
              type: 'post',
              success: function(result)  {
                backupForUndo(result);
              }
            });
        }

        function deletedb(id) {
          $.ajax
            ({ 
              url: '/darts/deletedb/' + id,
              type: 'post',
              success: function(result)  {

              }
            });
        }

        function shake(selector) {
          $(selector).addClass('shake');
              setTimeout(function() {
                $(selector).removeClass('shake')
              }, 600);
        }

        function getDate() {
          var d = new Date();
           return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ':' + d.getSeconds();

        }

        function backupForUndo(id) {
          undodata.push(id);
          console.log(undodata);
        }

        function updateStatusBar(state, dartsnum, avg, last) {
              $('#general-round').html('round: ' 
                + state
                + ' | darts: ' + dartsnum
                + ' | avg: ' + avg
                + ' | last:' + last
              );
            }

        $(window).once('dartsCounterBehavior').each(function() {

          // defaults.
          var actRound = 1;
          var roundLimit = 16;
          var generalround = 1;
          var scoreboard = [];
          var gameon = 0;

          // init.
          if (Cookies.get('gameon') == undefined || Cookies.get('gameon') == 0) {
            Cookies.set('gameon', 0);
          } else {
            $('#player').html(Cookies.get('player'));
            $('#defaults').hide();
            $('#main').show();
            $('#delete-cookies').show();
          }

          if (Cookies.get('uid') !== undefined) {
            $('select#players').val(Cookies.get('uid'));
          }

          if (Cookies.get('scoreboard') !== undefined) {
            scoreboard = Cookies.get('scoreboard').split(',');
          }

          if (Cookies.get('score') !== undefined) {
            $('#score').html(Cookies.get('score'));
          }

          if (Cookies.get('actRound') !== undefined) {
            actRound = Cookies.get('actRound') * 1;

            if (actRound > roundLimit) {
                $('#dashboard').hide();
                $('#log').show();
                $('#delete-cookies').show();
              }

          }

          

          if (Cookies.get('generalround') !== undefined) {
            console.log('wut??');
            generalround = Cookies.get('generalround') * 1;
            $('#general-round').html('round: ' 
              + generalround);
          }

          // get player name.
          $("#start").click(function() {



            var player = $('#player select option:selected').text();
            var uid = $('#player select option:selected').val();

            if (uid == 0) {
              shake('#player');
              return false;
            }

            Cookies.set('player', player);            
            Cookies.set('uid', uid);
            Cookies.set('gameon', 1);
            setGameId(uid);

            $('#player').html(player);
            $('#defaults').hide();
            $('#main').show();
            

            // Start to log to file.
            write('start');

            if ($('#darts-limit').val() !== undefined && $('#darts-limit').val() !== '' && $('#darts-limit').val() > 0) {
              roundLimit = $('#darts-limit').val();
            }            
            
          })

          // num buttons.
          // NUM BUTTON CLICKED.
          $('.button:not(".function")').click(function() {

            $('#current').append($('span', this).html());

             // Predefined score button.
            if ($(this).hasClass('predefined-score')) {
              $('.button.send').trigger('click');
            }

          })

          // clear button.
          $('.button.clear').click(function() {
            $('#current').html($('#current').html().slice(0, -1));

          })

          // undo button.
          $('.button.undo').click(function() {

            if (generalround > 1) {

              var total = 0;
              for (var i = 0; i < scoreboard.length - 1; i++) {
                  total += scoreboard[i] << 0;
              }

              scoreboard.pop();
              Cookies.set('scoreboard', scoreboard);

              console.log(scoreboard);

              lastundo = undodata.pop();
              deletedb(lastundo);
              console.log(undodata);

              generalround--;
              Cookies.set('generalround', generalround);

              updateStatusBar(generalround + ' / ' + roundLimit, (generalround - 1) * 3, (Math.round(total / (generalround - 1) * 100)) / 100, scoreboard[scoreboard.length - 1]);

              $('#score').html(total);
            }

          })

          // send value typed.
          // VALUE SENT.
          $('.button.send').click(function() {

            // Current number.
            current = $('#current').html() * 1;
            scoreboard.push(current);
            Cookies.set('scoreboard', scoreboard);

            if (current > 180 || current == 0) {
              shake('#current');
              return false;
            }

            $('#current').html('');

            // Sum of score.
            score = $('#score').html() * 1 + current;
            $('#score').html(score);

            write(score);
            writedb(current);

            // LOG ================================================================
            logrow = $('#log .log-row').html();
            logrow = logrow.replace('###round-score###', current);
            logrow = logrow.replace('###round-sum###', score);

            if (current < 50) {
              style = 'width: ' + current + 'px; background: red;'
            } else if (current < 70) {
              style = 'width: ' + current + 'px; background: orange;'
            } else {
              style = 'width: ' + current + 'px; background: green;'
            }

            logrow = logrow.replace('###bar-length###', 'style="' + style + '"');
            $('#log').append('<div class="log-row">' + logrow + '</div>');

            // LOG ========================================================================
            Cookies.set('score', score);

            generalround++;
            Cookies.set('generalround', generalround);
            
            updateStatusBar(generalround + ' / ' + (roundLimit), (generalround - 1) * 3, (Math.round(score / (generalround - 1) * 100)) / 100, current);

            

            // How many legs.
          
            if (generalround > roundLimit) {


              // Save data to DB.

              $('#log-data').html('AVG: ' + (Math.round(score / (generalround - 1) * 100)) / 100);

              $('#score').css(
                {
                  'font-size': '30px',
                  'font-weight': 'bold',
                });
              $('#dashboard').hide();
              $('#log').show();
              $('#delete-cookies').show();
              Cookies.remove('generalround');
              Cookies.remove('gameon');
              Cookies.remove('score');
              Cookies.remove('scoreboard');
            }

          })

          $('#delete-cookies').click(function() {
            Cookies.remove('player');
            Cookies.remove('score');
            Cookies.remove('generalround');
            Cookies.remove('gameon');
            Cookies.remove('scoreboard');
            location.reload();
          })

        })
    },
    detach: function(context, settings, trigger) {
      $('.example', context).removeOnce('example-behavior').each(function() {
        // Undo stuff.
      });
    }

  };
}(jQuery, Drupal, drupalSettings));
