(function ($, Drupal, cookies) {
  Drupal.behaviors.dartsDrawTableBehavior = {

    attach: function(context, settings) {

      $(window).once('dartsDrawTableBehavior').each(function() {

        

        $('.add-player').click(function() {
          did = $(this).data('did');
          team = $(this).data('team');
          uid = $('select[name="add-player-team-' + team + '"]').val();

          if (uid == 0) {
            $('select[name="add-player-team-' + team + '"]').show();
          } else {

            $.ajax
              ({ 
                url: '/darts/drawtable/addplayer/' + did + '/' + team + '/' + uid,
                type: 'post',
                success: function(result)  {
                  console.log('hey');
                  location.reload();
                }
              });
          }
        })

        $('.remove-player').click(function() {
            did = $(this).data('did');
            team = $(this).data('team');
            uid = $(this).data('uid');

            $.ajax
              ({ 
                url: '/darts/drawtable/removeplayer/' + did + '/' + team + '/' + uid,
                type: 'post',
                success: function(result)  {
                  console.log('hey');
                  location.reload();
                }
              });
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
