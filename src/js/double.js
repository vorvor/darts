(function ($, Drupal, cookies) {
  Drupal.behaviors.dartsCounterBehavior = {

    attach: function(context, settings) {

      var game;
      var tip;

        function shake(selector, time = 600) {
          $(selector).addClass('shake');
              setTimeout(function() {
                $(selector).removeClass('shake')
              }, time);
        }

        

        class Game {
          constructor() {
            this.num = 0;
            this.multiple = 0;
            this.score = 0;
            this.dart = 0;
            this.double = 70;
            this.throws = 0;
            this.tip = 0;
          }

          setNum(num) {
            this.num = num;
          }

          setMultiple(multiple) {
            this.multiple = multiple;

            if (multiple == 'S') {
              this.score += this.num * 1;
            }
            if (multiple == 'D') {
              this.score += this.num * 2;
            }
            if (multiple == 'T') {
              this.score += this.num * 3;
            }

            $('#throws').append('<div class="set">' + this.num + this.multiple + '</div>');
            this.num = 0;
            this.multiple = 0;

            
          }

          throwsNumPlus() {
            this.throws++;
            $('.dot-' + this.throws).addClass('active');
            console.log(this.throws);
          }

          setNewDouble() {
            this.double = Math.floor((Math.random() * 130) + 40);
            this.toolTip(this.double);
            $('#double').html(this.double);
          }

          newRoundIf() {

             if (this.dart == 2 || this.score == this.double) {

                if (this.score == this.double) {

                  // new game.
                  shake('#double');

                  this.throws = 0;
                  $('.dot').removeClass('active');
                  this.setNewDouble();

                } else {
                  this.throwsNumPlus();
                }

                if (this.throws == 3) {
                  this.throws = 0;
                  $('.dot').removeClass('active');
                  this.setNewDouble();
                }

                var outerThis = this;
                setTimeout(function() {
                  $('#throws').empty();
                  outerThis.dart = 0;  
                }, 1000);

                
                this.score = 0;

                return true;
              }

              return false;
          }

          toolTip(dbl) {

            var url = '/darts/double/getdouble/' + dbl;
            var ajaxThis = this;

            $.ajax
              ({ 
                url: url,
                type: 'post',
                success: function(result)  {
                  ajaxThis.tip = result;
                  
                }
              });
          }

          showTip() {
              console.log(this.tip);
                  var output = '';
                  for (var c = 0; c < this.tip.length; c++) {
                    output += '<div class="set">' + this.tip[c] + '</div>';
                  }
                  $('#tip').html(output).css('display', 'flex');

                  setTimeout(function() {
                    $('#tip').hide();
                  }, 2000);

          }
        }

        

        $(window).once('dartsCounterBehavior').each(function() {

          // init.
          if (Cookies.get('ddoublegameon') == undefined || Cookies.get('ddoublegameon') == 0) {
            Cookies.set('doublegameon', 0);
          } else {
            $('#player').html(Cookies.get('player'));
            $('#defaults').hide();
            $('#main').show();
            $('#delete-cookies').show();
            $('#dev').hide();
          }

          if (Cookies.get('uid') !== undefined) {
            $('select#players').val(Cookies.get('uid'));
            uid = Cookies.get('uid');
          }


          // get player name.
          $("#start").click(function() {

            var player = $('#player select option:selected').text();
            uid = $('#player select option:selected').val();

            if (uid == 0) {
              shake('#player');
              return false;
            }

            Cookies.set('player', player);            
            Cookies.set('uid', uid);
            Cookies.set('doublegameon', 1);
            //setGameId(uid);

            $('#player').html(player);
            $('#defaults').hide();
            $('#main').show();

            game = new Game();
            game.setNewDouble();
            
          })

          $('.button').click(function() {
            num = $('span', this).html();
            game.setNum(num);
            $('.button').removeClass('active');
            $(this).addClass('active');
          })

          $('.multiple-button').click(function() {
            if (game.num == 0) {
              shake('#numpad');

              return false;
            }

            game.setMultiple($('span', this).html());
            $('.button').removeClass('active');
            
            if (!game.newRoundIf()) {
               game.dart++;
            }
            
          })

          $('#double').click(function() {
            game.showTip();
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
