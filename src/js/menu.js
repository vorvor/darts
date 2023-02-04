(function ($, Drupal, cookies) {
  Drupal.behaviors.dartsMenuBehavior = {

    attach: function(context, settings) {

      $(window).once('dartsMenuBehavior').each(function() {



        $('.menu-label').click(function() {
          $('.sub-menu').addClass('hidden');

          if (!$('body').children('.blur').length > 0) {
            $('body').prepend('<div class="blur"></div>');

            $('.blur').click(function() {
              $('.blur').remove();
              $('.sub-menu').addClass('hidden');
            })
          }
          

          if ($(this).hasClass('active')) {
            $(this).siblings('.sub-menu').addClass('hidden');
            $(this).removeClass('active');
          } else {
            $(this).siblings('.sub-menu').removeClass('hidden');
            $('.menu-label').removeClass('active');
            $(this).addClass('active');
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
