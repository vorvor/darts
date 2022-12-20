

      class Test {

        constructor(game) {
          this.game = game;
          this.test = [];
          this.row = 0;
          this.speed = 300;
        }

        add(row) {
          this.test.push(row);
        }

        randScore() {
          var score;

          if (this.game.playerA.sum < 420 && this.game.playerB.sum < 420) {
            score = parseInt((Math.random() * 200) + 1);
          } else {
            score = 501 - this.game.currentPlayer.sum;
          }

          return score;
        }

        typeScore(score) {
          var scoreS = score.toString();
          for (var i = 0; i < scoreS.length; i++) {
            this.test.push("jQuery('.button-" + scoreS.charAt(i) + "').trigger('click');");
          }
        }

        sendScore() {
          this.test.push("jQuery('.button.send').trigger('click');");
        }

        checkout() {
          this.test.push("jQuery('#current').html(jQuery('.active-player .points').html());"); 
          this.test.push("jQuery('.button.send').trigger('click');");
        }

        reload() {
         this.test.push("location.reload;"); 
        }


        getRow() {
          eval(this.test[this.row]);
          console.log(this.test[this.row]);
          this.row++;
        }

        run() {
          for (var c = 0; c < 100; c++) {
            this.typeScore(this.randScore());
            this.sendScore();

            if (c > 0 && c % 10 == 0) {
              this.checkout();
            }

            if (c > 0 && c % 7 == 0) {
              this.reload();
            }
          }

          var that = this;
          for (c = 1; c < this.test.length; c++) {

            setTimeout(() => {
              this.getRow();
            }, c * this.speed);

            
          }

        }
      }     

