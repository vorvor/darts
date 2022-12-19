(function ($, Drupal, cookies) {
  Drupal.behaviors.dartsGameBehavior = {

    attach: function(context, settings) {

      //$('#player-a select').val(3);
      //$('#player-b select').val(5);

      var game;
      var noDB = 0; // if 1 no write to db.
      var setupFromScratch = 1; // if 1 setup after browser reload

      function shake(selector) {
          $(selector).addClass('shake');
              setTimeout(function() {
                $(selector).removeClass('shake')
              }, 600);
        }

      $('.change-starter-player').click(function() {
          playerA = $('#player-a select').val();
          playerB = $('#player-b select').val();
          $('#player-a select').val(playerB);
          $('#player-b select').val(playerA);
        })

      class Game {
        constructor(playerA, playerB) {
          this.playerA = playerA;
          this.playerB = playerB;
          //this.setCurrentPlayer(playerA);
          this.throws = [];
          this.winner = 0;
          this.gameId = 0;
          this.currentLeg = 1;

          this.switchScreenToGameplay();
        }

        async getGameId() {
          const result = await $.ajax({
            url: '/darts/game/lastgameid',
            type: 'post'
          });

          return result;
        }

        writedb(score) {
          $.ajax
            ({ 
              async: false,
              url: '/darts/game/writedb/' + this.currentPlayer.uid + '/' + this.gameId + '/' + score,
              type: 'post',
              success: function(result)  {
                return result;
              }
            });
        }

        deleteLastScore(gameid) {
          $.ajax
            ({ 
              async: false,
              url: '/darts/deletelastscore/' + gameid,
              type: 'post',
              success: function(result)  {
                
              }
            });
        }

        switchScreenToGameplay() {
          $('#players').hide();
          $('#leg-set').hide();
          $('#defaults').hide();
          $('#main').show();
          $('#delete-cookies').show();
          $('#scoreboard').show();
          $('#player-stats').show();

          $('#player-a-status .name').html(playerA.name);
          $('#player-b-status .name').html(playerB.name);
        }

        switchScreenToFinish() {
          $('#main').remove();
          $('#log').show();
          $('.points').hide();
          $('.player').removeClass('.active-player');
        }

        logWonLeg() {

          $('#log').append('<div id="player-a-scores-'+ this.currentLeg + '"></div>');
          $('#log').append('<div id="player-b-scores-'+ this.currentLeg + '"></div>');

          if (this.currentLeg % 2 == 0) {
            var playerBBlock = $('#player-a-scores-'+ this.currentLeg);
            var playerABlock = $('#player-b-scores-'+ this.currentLeg);
          } else {
            var playerABlock = $('#player-a-scores-'+ this.currentLeg);
            var playerBBlock = $('#player-b-scores-'+ this.currentLeg);
          }

          playerABlock.append('<div class="label">' + this.playerA.name + '</div>');
          playerBBlock.append('<div class="label">' + this.playerB.name + '</div>');

          var sum = 0;
          var currentLeg = this.currentLeg;
          $.each(this.playerA.throws, function() {
            sum += this;
            playerABlock.append('<div>' + this + '(' + (501 - sum) + ')</div>');
          })

          sum = 0;
          $.each(this.playerB.throws, function() {
            sum += this;
            playerBBlock.append('<div>' + this + '(' + (501 - sum) + ')</div>');
          })
        }

        setCurrentPlayer(player) {
          this.currentPlayer = player;

          $('.player').removeClass('active-player');
          $('#' + this.currentPlayer.nickname + '-status').addClass('active-player');
        }

        addScore(score) {

          var gameId;

          if (this.validateScore(score) == false) {
            return false;
          }

          this.throws.push(score);
          this.currentPlayerAddThrow(score);

          if (this.currentPlayer.sum == 501) {

            this.currentPlayer.wonleg++;
            this.logWonLeg();
            this.gameRestart();
          }

          this.updateScoreStatuses();

          if (noDB == 0) {
            if (this.gameId == 0) {
              var _this = this;
              this.getGameId().then( data => {
                _this.gameId = data;
                _this.writedb(score);

                // must be here to run after ajax db write.
                _this.changeCurrentPlayer();
                Cookies.set('game', JSON.stringify(this));
              });

            } else {
              this.writedb(score);
              this.changeCurrentPlayer();
              Cookies.set('game', JSON.stringify(this));
            }
          }

          console.log(this);

          
          
        }

        gameRestart() {

          if (this.currentPlayer.wonleg == 2) {
            this.setWinner(this.currentPlayer);
            this.switchScreenToFinish();
            Cookies.remove('game');
            return false;
          }

          this.playerA.throws = [];
          this.playerA.sum = 0;

          this.playerB.throws = [];
          this.playerB.sum = 0;

          this.currentLeg++;
        }

        setWinner(player) {
          this.winner = 1;

          $('.player').removeClass('active-player');
          $('#' + player.nickname + '-status').addClass('winner');
        }


        undoThrow() {
          if (this.throws.length > 0) {
            this.throws.pop();
            this.changeCurrentPlayer();
            
            this.currentPlayer.throws.pop();
            this.currentPlayer.sum = this.currentPlayer.throws.reduce(function(a, b) {
              return a + b;
            }, 0)

            this.deleteLastScore(this.gameId);

            this.updateScoreStatuses();
          }

          console.log(game);
        }

        currentPlayerAddThrow(score) {
          this.currentPlayer.throws.push(score);
          this.currentPlayer.sum = this.currentPlayer.throws.reduce(function(a, b) {
            return a + b;
          }, 0)
        }

        validateScore(score) {

          if (this.currentPlayer.sum + score > 501 || score > 180) {
            shake('#score');
            return false;
          }
        }

        updateScoreStatuses() {
          $('#score').html(501 - this.currentPlayer.sum);

          $('#player-a-status .points').html(501 - this.playerA.sum);
          $('#player-a-status .won-leg').html(this.playerA.wonleg);
          $('#player-a-status .avg').html(Math.round(this.playerA.sum / this.playerA.throws.length * 100) / 100);

          $('#player-b-status .points').html(501 - this.playerB.sum);
          $('#player-b-status .won-leg').html(this.playerB.wonleg);
          $('#player-b-status .avg').html(Math.round(this.playerB.sum / this.playerB.throws.length * 100) / 100);
        }

        changeCurrentPlayer() {
          // Change to next player.
          if (this.currentPlayer === this.playerA) {
            this.setCurrentPlayer(this.playerB);
          } else {
            this.setCurrentPlayer(this.playerA);
          }
        }

        setupFromScratch(data) {

          this.playerA = data.playerA;
          this.playerB = data.playerB;

          if (data.currentPlayer.nickname == 'player-a') {
            this.currentPlayer = this.playerA;  
          } else {
            this.currentPlayer = this.playerB;
          }
          
          this.throws = data.throws;
          this.gameId = data.gameId;

          this.setCurrentPlayer(this.currentPlayer);
          this.updateScoreStatuses();
          this.switchScreenToGameplay();

          return this;
        }

      }

      class Player {
        constructor(uid, name, nickname) {
          this.uid = uid;
          this.name = name;
          this.throws = [];
          this.sum = 0;
          this.nickname = nickname;
          this.wonleg = 0;
        }
      }


      $(window).once('dartsGameBehavior').each(function() {

        var test;
        $('#score').click(function() {
          test.run();
        })

        if (setupFromScratch == 1) {
          if (Cookies.get('game') !== undefined) {
            data = JSON.parse(Cookies.get('game'));
            console.log(data);

            playerA = new Player(data.playerA.uid, data.playerA.name, 'player-a');
            playerB = new Player(data.playerA.uid, data.playerB.name, 'player-b');

            game = new Game(playerA, playerB);


            if (data.currentPlayer.nickname == 'player-b') {
              game.setCurrentPlayer(playerB);
            } else {
              game.setCurrentPlayer(playerA);
            }

            console.log(data);
            game.setupFromScratch(data);


          }
        }
        

        $('#start').click(function() {

          playerA = new Player(
            $('#player-a select').val(), 
            $('#player-a select option:selected').text(),
            'player-a'
          );

          playerB = new Player(
            $('#player-b select').val(), 
            $('#player-b select option:selected').text(),
            'player-b'
          );

          game = new Game(playerA, playerB);
          game.setCurrentPlayer(playerA);
          console.log(game);
          
          test = new Test(game);
          //test.run();

      

        })

        // number
        $('.button:not(".function")').click(function() {

          score = $('span', this).html();
          currentScore = $('#current').html();
          if ($(this).hasClass('predefined-score')) {
            game.addScore(parseInt(score));
          } else {
            if (parseInt(currentScore + score) < 181) {
              $('#current').html(currentScore + score);
            }
          }
        })

        $('.button.clear').click(function() {
          $('#current').html('');
        })

        $('#send').click(function() {
          game.addScore(parseInt($('#current').html()));
          $('#current').html('');
        })

        $('.button.undo').click(function() {
          game.undoThrow();
        })

        $('#delete-cookies').click(function() {
          Cookies.remove('game');
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
