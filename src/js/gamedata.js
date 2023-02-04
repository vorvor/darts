(function ($, Drupal, cookies) {
  Drupal.behaviors.dartsGamedataBehavior = {

    attach: function(context, settings) {

      function shake(selector) {
          $(selector).addClass('shake');
              setTimeout(function() {
                $(selector).removeClass('shake')
              }, 1200);
        }

      $(window).once('dartsGamedataBehavior').each(function() {

        $('.highlight-data a').click(function(e) {
          e.preventDefault();
          destGame = $(this).attr('href');
          destThrow = $(this).attr('data-throwid');

          $('html, body').animate({
              scrollTop: $(destGame).offset().top - 50
          }, 1000, function() {
            shake('#throw-' + destThrow);
          })
        })

        $('.level .game').each(function() {
          x = $(this).offset().left;
          y = $(this).offset().top;

          $(this).attr('x', x);
          $(this).attr('y', y);

          parentX = $('.game[data-gameid="' + $(this).attr('data-parent') + '"]').attr('x');
          parentY = $('.game[data-gameid="' + $(this).attr('data-parent') + '"]').attr('y') - 20;

          console.log(Math.abs(parentX));

          width = Math.abs(parentX - x);
          height = Math.abs(parentY - y);

          minus = Math.abs(parentX - x) / (parentX - x);

          $('.rope', this).css({
            'width' : width + 'px',
            'height' : height + 'px',
            'left' : width / 2 * minus - 55,
            'top' : height / 2 * -1,
            'display' : 'block',
          });

          if (minus == 1) {
            $('.rope', this).css('transform', 'scale(-1, 1)');
          }


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
