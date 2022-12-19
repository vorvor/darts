(function ($, Drupal, cookies) {
  Drupal.behaviors.dartsGameBehavior = {

    attach: function(context, settings) {

      $(window).once('dartsGameBehavior').each(function() {

        $('.change-starter-player').click(function() {
          playerA = $('#player-a select').val();
          playerB = $('#player-b select').val();
          $('#player-a select').val(playerB);
          $('#player-b select').val(playerA);
        })

        var players = {num: 0};
        var game = {};
        var letters = ['a', 'b'];
        var currentplayer = { value: 0};
        var sets = [];
        var legLimit;
        var finale = 0;
        var gameId = {value: 0};
        var lastscore;

        Object.defineProperty(currentplayer, "setValue", {
            set : function (value) {
                this.value = value;
                Cookies.set('currentplayer', JSON.stringify(value));
            }
        });

        Object.defineProperty(gameId, "setValue", {
            set : function (value) {
                this.value = value;
                Cookies.set('gameid', JSON.stringify(value));
            }
        });

        function shake(selector) {
          $(selector).addClass('shake');
              setTimeout(function() {
                $(selector).removeClass('shake')
              }, 600);
        }

        function isEmpty(obj) { 
           for (var x in obj) { return false; }
           return true;
        }

        function getPlayerPoints(aorb) {

          i = 0;
          for (key in game) {
            if (aorb == 'A' && i == 0) {
              return game[key]['points'];
            }

            if (aorb == 'B' && i == 1) {
              return game[key]['points'];
            }

            i++;
          }
        }

        function Player(selector) {

          element = $('#' + selector)

          if ($('select option:selected', element).val() == 0) {
            shake(element);

            return false;
          }

          if (players[selector] == undefined) {
            players[selector] = {
              name: $('select option:selected', element).text(), 
              uid: $('select option:selected', element).val(),
              letter: letters[players['num']]
            };

            uid = players[selector]['uid'];

            game[uid] = { points: 0, list: [], letter: letters[players['num']] };


            players['num']++;
          }

          this.uid = uid;

        }

        function setCurrentPlayer() {


          $('.player').removeClass('active-player');
          if (currentplayer.value == undefined) {
            $('#player-a-status').addClass('active-player');
          } else {
            $('#player-' + game[currentplayer.value]['letter'] + '-status').addClass('active-player');
          }
        }

        function changeCurrentPlayer() {
          $('.player').removeClass('active-player');

          if (currentplayer.value == undefined) {
            $('#player-a-status').addClass('active-player');
          } else {

            for (var key in game) {
              if (key !== currentplayer.value) {
                currentplayer.setValue = key;
                $('#player-' + game[currentplayer.value]['letter'] + '-status').addClass('active-player');
                break;
              }
            }
          }

          $('#score').html(501 - game[currentplayer.value]['points']);
        }

        function getAvg(uid) {
          i = 0;
          sum = 0;
          for (key in game[uid]['list']) {
            sum += game[uid]['list'][key];
            i++;
          }

          return Math.floor(sum / i * 100) / 100;
        }

        function updatePlayerPoints() {
          for (key in game) {
            $('.player-' + key + ' .points').html(501 - game[key]['points']);
            $('.player-' + key + ' .avg').html(getAvg(key));
          }
        }

        function updateWonSets() {

          wonLeg = [];
          winner = 0;



          for (key in sets) {

            for (uid in sets[key]) {

              if (sets[key][uid]['points'] == 501) {
                if (wonLeg[uid] == undefined) {
                  wonLeg[uid] = 1;
                } else {
                  wonLeg[uid]++;
                }
              }
            }
          }



          for (key in wonLeg) {
            $('.player-' + key + ' .won-leg').html(wonLeg[key]);

            if (wonLeg[key] == legLimit) {
              winner = key;
            }
          }

          return winner;

        }

        function startGame() {
          Cookies.set('gamedebugon', 1);
  
          $('#player-a-status').addClass('player-' + players['player-a']['uid']);
          $('#player-a-status .name').html(players['player-a']['name']);

          $('#player-b-status').addClass('player-' + players['player-b']['uid']);
          $('#player-b-status .name').html(players['player-b']['name']);
          
          updatePlayerPoints();
          setCurrentPlayer();
          updateWonSets();
          
          

          $('#score').html(501 - game[currentplayer.value]['points']);

          $('#players').hide();
          $('#leg-set').hide();
          $('#defaults').hide();
          $('#main').show();
          $('#delete-cookies').show();
          $('#scoreboard').show();
          $('#player-stats').show();
        }

        function restartGame() {

          sets.push(JSON.parse(JSON.stringify(game)));
          Cookies.set('sets', JSON.stringify(sets));

          won = updateWonSets();

          if ( won > 0) {
            // FINALE.
            $('.player-' + won).addClass('winner');
            $('.player').removeClass('active-player');
            gameFinale();
          };

          for (key in game) {
            game[key]['points'] = 0;
            game[key]['list'] = [];
          }


          $('.player .points').html(501);
          $('.player .avg').html(0);

        }

        function restoreVariables() {
          // Set back variables values from scratch if browser reloaded.
          if (players.num == 0) {
            players = JSON.parse(Cookies.get('players'));
          }

          if (currentplayer.value == 0) {
            currentplayer.setValue = JSON.parse(Cookies.get('currentplayer'));
          }

          if (isEmpty(game)) {
            game = JSON.parse(Cookies.get('game'));
          }

          if (sets.length == 0 && Cookies.get('sets') !== undefined) {
            sets = JSON.parse(Cookies.get('sets'));
          }

          if (legLimit == undefined) {
            legLimit = JSON.parse(Cookies.get('leglimit'));
          }

          // =======
        }

        function gameFinale() {
          $('#finale').show();
          $('#score').hide();
          $('#dashboard').hide();
          $('.player').removeClass('active-player');

          finale = 1;
          Cookies.set('gamedebugon', 0);
        }

        function setGameId() {
          $.ajax
            ({ 
              async: false,
              url: '/darts/game/lastgameid',
              type: 'post',
              success: function(result)  {
                gameId.setValue = result;
              }
            });
        }

        function writedb(score) {

          $.ajax
            ({ 
              async: false,
              url: '/darts/game/writedb/' + currentplayer.value + '/' + gameId.value + '/' + score,
              type: 'post',
              success: function(result)  {
                return result;
              }
            });
        }

        function deleteLastScore(gameid) {
          $.ajax
            ({ 
              async: false,
              url: '/darts/deletelastscore/' + gameid,
              type: 'post',
              success: function(result)  {
                
              }
            });
        }

        function otherPlayer(uid) {
          if (players['player-a']['uid'] == uid) {
            return players['player-b']['uid'];
          } else {
            return players['player-a']['uid'];
          }
        }
        

        // continue game.

        if (Cookies.get('gamedebugon') == 1) {
          restoreVariables();
          startGame();
        }

        $("#start").click(function() {

          playera = new Player('player-a');
          playerb = new Player('player-b');

          currentplayer.setValue = playera.uid;

          Cookies.set('players', JSON.stringify(players));
          Cookies.set('game', JSON.stringify(game));

          legLimit = $('#leg-set select').val();
          Cookies.set('leglimit', JSON.stringify(legLimit));

          if (players.num == 2) {
            startGame();
          }

        })

        $('#send').click(function() {

          if (gameId.value == 0) {
            setGameId();
          }

          current = $('#current').html() * 1;

          if (current > 180 || 501 - game[currentplayer.value]['points'] - current < 0 || 501 - game[currentplayer.value]['points'] - current == 1) {
            

              shake('#current');
              return false;

          }

          score = $('#current').html() * 1;
          if (game[currentplayer.value]['points'] == undefined) {
            game[currentplayer.value]['points'] = score;
          } else {
            game[currentplayer.value]['points'] += score;
          }

          game[currentplayer.value]['list'].push(score);
          Cookies.set('game', JSON.stringify(game));

          lastscore = writedb(score);
          console.log(lastscore);





          $('#current').html('');

          // FINALE ===========================================.

          if (game[currentplayer.value]['points'] == 501) {
            shake('body');

            restartGame();

          }

          if (finale == 0) {
            updatePlayerPoints();
            changeCurrentPlayer();
          }
          
          console.log(game);

        })

        // num buttons.
        // NUM BUTTON CLICKED.
        $('.button:not(".function")').click(function() {



          $('#current').append($('span', this).html());

          if (501 - game[currentplayer.value]['points'] - $('#current').html() > -1 && 501 - game[currentplayer.value]['points'] - $('#current').html() !== 1) {
            $('#score').html(501 - game[currentplayer.value]['points'] - $('#current').html());  
          } else {
            shake('#current');
            $('#current').html($('#current').html().slice(0, -1));
          }

          

           // Predefined score button.
          if ($(this).hasClass('predefined-score')) {
            $('#current').html($('span', this).html());

            if (501 - game[currentplayer.value]['points'] - $('#current').html() > -1 && 501 - game[currentplayer.value]['points'] - $('#current').html() !== 1) {
              $('.button.send').trigger('click');
              } else {
                shake('#current');
                $('#current').html('');
              }

            
          }

        }) // send.

        // clear button.
        $('.button.clear').click(function() {
          $('#current').html($('#current').html().slice(0, -1));
          if ($('#score').html() - $('#current').html() > 2) {
            $('#score').html(501 - game[currentplayer.value]['points'] - $('#current').html());  
          } else {
            shake('#current');
          }
        })

        // undo button.
        $('.button.undo').click(function() {
          otherP = otherPlayer(currentplayer.value);

          if (game[otherP]['list'].length > 0) {
            last = game[otherP]['list'].pop();
            game[otherP]['points'] -= last;

            $('.player').removeClass('active-player');
            $('.player-' + otherP + ' .points').html(501 - game[otherP]['points']);
            $('.player-' + otherP).addClass('active-player');

            currentplayer.setValue = otherP;

            deleteLastScore(gameId.value);

            console.log(game);
            console.log(last);
          }

        })

        $('#delete-cookies').click(function() {
          Cookies.remove('gamedebugon');
          Cookies.remove('currentplayer');
          Cookies.remove('game');
          Cookies.remove('players');
          Cookies.remove('sets');
          Cookies.remove('gameid');
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
