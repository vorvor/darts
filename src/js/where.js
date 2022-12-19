(function ($, Drupal, cookies) {
  Drupal.behaviors.dartsWhereBehavior = {

    attach: function(context, settings) {

      $(window).once('dartsChartBehavior').each(function() {

        var round = 1;

        /*
        // for test.
        $('.area').each(function() {
          $(this).append($(this).attr('data-value'));
        })
        */

        function shake(selector) {
          $(selector).addClass('shake');
              setTimeout(function() {
                $(selector).removeClass('shake')
              }, 900);
        }

        $('.area').click(function() {
          if ($(this).attr('data-value') == $('#point').html()) {
            point = x = Math.floor((Math.random() * 20) + 1);
            $('#point').html(point);

            $('#won').html(($('#won').html() * 1) + 1);
          } else {

            prefix = 'a';
            if ($(this).attr('data-value') == '1' || $(this).attr('data-value') == '5') {
                prefix = 'az';
            }

            $('#response-text').html('Az ' + prefix + ' ' + $(this).attr('data-value'));
            shake('#response');
          }

          round++;
          $('#round').html(round);

          if (round == 15) {
            $('#stat').addClass('finale');
            
            $('#dartsboard').hide();
            $('#round').hide();
            $('#restart').show();

            $('#restart').click(function() {
              location.reload();
            })
          }
        })

        $('#point').html(20);
      })
    },
    detach: function(context, settings, trigger) {
      $('.example', context).removeOnce('example-behavior').each(function() {
        // Undo stuff.
      });
    }

  };
}(jQuery, Drupal, drupalSettings));
