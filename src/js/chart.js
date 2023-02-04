(function ($, Drupal, cookies) {
  Drupal.behaviors.dartsChartBehavior = {

    attach: function(context, settings) {

      $(window).once('dartsChartBehavior').each(function() {

        var uid;

        if (window.matchMedia("(max-width: 767px)").matches) {
          var mobile = true;
        } else {
          var mobile = false;
        }

        $('.player-wrapper').each(function() {
          $('#player').append('<option value="'+$(this).data('uid')+'">'+$(this).data('name')+'</option>');
        })

        // remember last selected player.
        if (Cookies.get('uid') !== undefined) {
          $('select#player').val(Cookies.get('uid'));
          $('#player-' + $('select#player').val()).show();
          uid = Cookies.get('uid');
          drawDiagram(uid);
          drawDiagram3(uid);
          drawTable(uid);
        }


        // select which player stat to show.
        $('#player').change(function() {
          $('.player-wrapper').hide();
          $('#player-' + $(this).val()).show();
          uid = $(this).val();
          drawDiagram(uid);
          drawDiagram3(uid);
          drawTable(uid);
        })

        // select which day stat to show.
        $('.stat-per-day').click(function() {
          $('.stat-card').hide();
          console.log('.stat-card.day-'+$(this).data('day'));
          $('.stat-card.day-'+$(this).data('day')).show();
        })

        // scroll.
        $("#scrolltotop").click(function() {
            $("html, body").animate({ scrollTop: 0 }, "slow");
            return false;
          });


        function drawDiagram(uid) {
          
          var len = Object.keys(drupalSettings.chart.test[uid]).length;
          //var labels = Object.keys(drupalSettings.chart.test[uid]);
          var labels = [];

          var throws = [];
          var throws2 = [];
          var dailyBest = [];
          var challenge = false;
          var i = 0;
          var score;

          for (k in drupalSettings.chart.test[uid]) {

            if (k == '2023-01-09') {
              challenge = true;
            }

            if ((mobile && i > len - 13 && len > 13) || !mobile) {
              
              score = drupalSettings.chart.test[uid][k];

              if (challenge) {
                throws2.push(score);
              } else {
                throws.push(score);
                throws2.push(score);
              }
              labels.push(k);
            }
            i++;
          }

          // Daily best only.
          for (k in drupalSettings.chart.daily_best[uid]) {
            score = drupalSettings.chart.daily_best[uid][k];
            if ((mobile && i > len - 13 && len > 13) || !mobile) {
              dailyBest.push(score);
            }
            i++;
          }
          
          const data = {
            labels: labels,
            datasets: [
              {
                type: 'line',
                label: $('#player-' + uid).attr('data-name'),
                data: throws,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              },
              {
                type: 'line',
                label: '2023 New Year Challenge',
                data: throws2,
                fill: false,
                borderColor: 'rgb(255, 0, 0)',
                tension: 0.1
              },
              {
                type: 'line',
                label: 'Daily best',
                data: dailyBest,
                fill: false,
                borderColor: 'rgb(255, 140, 0)',
                tension: 0.1
              },
            ]
          };

          const config = {
            data: data,
            options: {
              //responsive: false,
              maintainAspectRatio: false,
            },
          };

          chartStatus = Chart.getChart('canvas');

          if (chartStatus !== undefined) {
            chartStatus.destroy();
          }
          var ctx = $('#canvas');
          const chart = new Chart(ctx, config);


        }

        function drawDiagram3(uid) {

          weightsSum = drupalSettings.chart.weights_sum[uid];
          var weightsA = [];
          for (k in weightsSum) {
            score = weightsSum[k];
            weightsA.push(score);
          }

          weightsChallenge = drupalSettings.chart.weights_challenge[uid];

          var weightsAC = [];
          for (k in weightsChallenge) {
            score = weightsChallenge[k];
            weightsAC.push(score);
          }

          const data = {
              labels: [
                '20+',
                '40+',
                '60+',
                '80+',
                '100+',
              ],
              datasets: [
              {
                  data: weightsA,
                  label: 'All time (%)',
                  fill: true,
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgb(54, 162, 235)',
                  pointBackgroundColor: 'rgb(54, 162, 235)',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: 'rgb(54, 162, 235)',
              },
              {
                  data: weightsAC,
                  label: '2023 New Year Challenge (%)',
                  borderColor: 'rgb(0,0,0)',
                  fill: true,
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  borderColor: 'rgb(255, 99, 132)',
                  pointBackgroundColor: 'rgb(255, 99, 132)',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: 'rgb(255, 99, 132)',
              }],
              options: {
                responsive: true,
                maintainAspectRatio: false,
              }
          };

          const config = {
              type: 'radar',
              data: data,

          };

          chartStatus = Chart.getChart('canvas2');

          if (chartStatus !== undefined) {
            chartStatus.destroy();
          }

          var ctx = $('#canvas2');
          var myChart = new Chart(
              ctx,
              config
          );

        }

        function drawTable(uid) {
          table = $('#limits');
          stats = drupalSettings.chart.weights[uid];

          table.empty();

          sum = 0;
          for (k in stats) {
            sum += stats[k];
          }

          for (k in stats) {
            table.append('<div class="row"><div class="label">' + k + '+ </div><div class="value">' + stats[k] + ' (' + ((parseInt(stats[k] / sum * 1000)) / 10) + '%)</div></div>');
          }

        }


        function scaleCoord(coord) {
          return (180 - parseInt(coord)) * 1.5;
        }

        function drawDiagram2() {
          // draw diagram.
          var width = window.innerWidth / 2.2;

          var step = parseInt(width / Object.keys(drupalSettings.chart.test[uid]).length);


          var canvas = document.querySelector('#canvas');
          //canvas.setAttribute("viewBox", "0 0 1800 100");
          var ctx = canvas.getContext('2d');
          ctx.canvas.width  = window.innerWidth;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // set line stroke and line width
          
          ctx.lineWidth = 1;

          /* horizontal lines */
          lineEnd = width - width * 0.04;
          ctx.strokeStyle = '#cccccc';
          ctx.moveTo(0, scaleCoord(40));
          ctx.lineTo(lineEnd, scaleCoord(40));

          ctx.moveTo(0, scaleCoord(50));
          ctx.lineTo(lineEnd, scaleCoord(50));

          ctx.moveTo(0, scaleCoord(60));
          ctx.lineTo(lineEnd, scaleCoord(60));

          ctx.moveTo(0, scaleCoord(70));
          ctx.lineTo(lineEnd, scaleCoord(70));

          ctx.moveTo(0, scaleCoord(80));
          ctx.lineTo(lineEnd, scaleCoord(80));

          ctx.stroke();
          ctx.closePath();
          /* horizontal lines */

          ctx.font = "12px Arial";
          ctx.fillText('40', lineEnd + 4, scaleCoord(37));
          ctx.fillText('60', lineEnd + 4, scaleCoord(57));
          ctx.fillText('80', lineEnd + 4, scaleCoord(77));
          ctx.closePath();


          // draw a red line
          ctx.strokeStyle = 'red';
          ctx.beginPath();

          ctx.font = "12px Arial";
          
          coord = scaleCoord(drupalSettings.chart.test[uid][Object.keys(drupalSettings.chart.test[uid])[0]]);
          

          var len = Object.keys(drupalSettings.chart.test[uid]).length;
          var i = len * step;
          var ii = 0;

          for (k in drupalSettings.chart.test[uid]) {

            

            ctx.moveTo(i, coord);
            coord = scaleCoord(drupalSettings.chart.test[uid][k]);
            
            i -= step;
            ii++;

            ctx.lineTo(i, coord);


            /*
            if (ii % 2 == 0) {
              ctx.fillText(drupalSettings.chart.test[uid][k], i, scaleCoord(100) - 20);
            } else {
              ctx.fillText(drupalSettings.chart.test[uid][k], i, scaleCoord(100));
            }
            */

            ctx.stroke();

            if (k == '2023-01-09') {
              var challengeDate = i;
            }

          }
          ctx.closePath();

          ctx.strokeStyle = 'green';
          ctx.beginPath();
          ctx.moveTo(challengeDate, scaleCoord(0));
          ctx.lineTo(challengeDate, scaleCoord(100));
          ctx.stroke();
          ctx.closePath();

          

               
          
          /*
          coord = 0;
          var i = 0;
          ctx.beginPath();
          ctx.strokeStyle = 'green';
          console.log('step' + step);

          var ii = 0;

          sumNum = 6;
          for (k in drupalSettings.chart.test[uid]) {

            ii += 1;

            if (ii % sumNum == 0) {

              ctx.moveTo(i, coord);
              coord = drupalSettings.chart.test[uid][k];
              i += step * sumNum;
              ctx.lineTo(i, coord);
              ctx.stroke();
            }


            
          }

          ctx.closePath();
          */


        }


      })
    },
    detach: function(context, settings, trigger) {
      $('.example', context).removeOnce('example-behavior').each(function() {
        // Undo stuff.
      });
    }

  };
}(jQuery, Drupal, drupalSettings));
