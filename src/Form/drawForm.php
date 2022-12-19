<?php

namespace Drupal\darts\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\darts\Player;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * Provides a Alap migrate from DB form.
 */
class drawForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'darts_draw';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    $form['#attached']['library'][] = 'darts/gamedraw';

    $allPlayers = Player::getPlayers();

    $form['players'] = [
      '#title' => 'Player',
      '#type' => 'checkboxes',
      '#options' => $allPlayers,
    ];

    $form['actions'] = [
      '#type' => 'actions',
    ];
    
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Shuffle'),
    ];

    $form['actions']['save'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
    ];


    $playerlist = Player::getPlayers();
    $selectedPlayers = array_filter($form_state->getValue('players'));


    foreach ($selectedPlayers as &$player) {
      $player = $allPlayers[$player];
    }

    // Draw.
    $selectedPlayers = $this->shuffle_assoc($selectedPlayers);

    $playersNum = count($selectedPlayers);

    // divide players equally to teams.
    $int = (int)($playersNum / 4);
    $left = $playersNum % 4;
    $numbers = array_fill(0, $int, 4);

    while ($left > 0) {
      foreach ($numbers as &$number) {
          if ($left > 0) {
            $number++;
          }
          $left--;
      }
    }

    $sum = 0;
    $teams = [];
    foreach ($numbers as $k => $n) {
      $teams[$k] = array_slice($selectedPlayers, $sum, $n, true);
      $sum += $n;
    }
    // divide players equally to teams.

    $build['content'] = [
      '#theme' => 'gamedraw',
      '#teams' => $teams,
      '#attached' => [
        'library' => [
          'darts/gamedraw',
        ],
      ],
    ];

    $form['data'] = [
      '#type' => 'textarea',
      '#value' => serialize($teams),
    ];

    $form['matrix'] = [
      '#markup' => \Drupal::service('renderer')->renderRoot($build),
      '#weight' => 1000,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    
   
    
    $this->messenger()->addStatus($this->t('done.'));

    $form_state->setRebuild();

    $submitButton = $form_state->getTriggeringElement(); 

    if ($submitButton['#id'] == 'edit-save') {
      dpm($form_state->getValue('data'));

      $database = \Drupal::database();

      $did = $database->insert('darts_matrix')
      ->fields([
        'data' => $form_state->getValue('data'),
        'date' => \Drupal::time()->getRequestTime(),
      ])
      ->execute();

      $form_state->setRedirect('/darts/drawtable?id=' . $did);

      (new RedirectResponse('/darts/drawtable/' . $did))->send();
      
    }

    //$form_state->setRedirect('<front>');
  }

  public function shuffle_assoc($list) { 
  if (!is_array($list)) return $list; 
  $keys = array_keys($list);

  shuffle($keys); 

  $random = array(); 
  foreach ($keys as $key) 
    $random[$key] = $list[$key]; 
  return $random; 
}

 

}
