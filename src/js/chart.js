(function ($, Drupal, cookies) {
  Drupal.behaviors.dartsChartBehavior = {

    attach: function(context, settings) {

      $(window).once('dartsChartBehavior').each(function() {

        $('.player-wrapper').each(function() {
          $('#player').append('<option value="'+$(this).data('uid')+'">'+$(this).data('name')+'</option>');
        })

        $('#player').change(function() {
          $('.player-wrapper').hide();
          $('#player-' + $(this).val()).show();
        })

        $('.stat-per-day').click(function() {
          $('.stat-card').hide();
          console.log('.stat-card.day-'+$(this).data('day'));
          $('.stat-card.day-'+$(this).data('day')).show();
        })

        $("#scrolltotop").click(function() {
            $("html, body").animate({ scrollTop: 0 }, "slow");
            return false;
          });

      })
    },
    detach: function(context, settings, trigger) {
      $('.example', context).removeOnce('example-behavior').each(function() {
        // Undo stuff.
      });
    }

  };
}(jQuery, Drupal, drupalSettings));
